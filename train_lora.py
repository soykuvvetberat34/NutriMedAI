from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
import os

# 1. Configuration
max_seq_length = 2048 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to reduce memory usage. Can be False.

# 2. Load Model
model_name = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"
new_model_name = "llama-3.1-8b-turkish-drug-finetuned"

print(f"Loading {model_name}...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_name,
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

# 3. Add LoRA Adapters
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",    # Supports any, but = "none" is optimized
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = False,  # We support rank stabilized LoRA
    loftq_config = None, # And LoftQ
)

# 4. Load Dataset
dataset_file = "finetune_dataset.jsonl"
if not os.path.exists(dataset_file):
    raise FileNotFoundError(f"{dataset_file} not found! Run prepare_dataset.py first.")

dataset = load_dataset("json", data_files=dataset_file, split="train")

# 5. Format Prompt (Chat Template)
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
    mapping = {"role" : "from", "content" : "value", "user" : "human", "assistant" : "gpt"}, # ShareGPT style
)

def formatting_prompts_func(examples):
    convos = []
    texts = []
    # Convert instruction/input/output format to Chat
    for instruction, input_text, output in zip(examples["instruction"], examples["input"], examples["output"]):
        # Simplified user message
        user_msg = instruction
        if input_text:
            user_msg += "\n" + input_text
            
        convo = [
            {"role": "system", "content": "Sen yardımcı bir ilaç asistanısın. Her zaman Türkçe yanıt ver."},
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": output},
        ]
        
        # Apply template
        text = tokenizer.apply_chat_template(convo, tokenize = False, add_generation_prompt = False)
        texts.append(text)
        
    return { "text" : texts, }

dataset = dataset.map(formatting_prompts_func, batched = True,)

# 6. Train
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, # Can make training 5x faster for short sequences.
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60, # Set to 60 for demo, increase for full training (e.g., 1 epoch)
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
    ),
)

print("Starting training...")
trainer.train()

# 7. Save
print(f"Saving to {new_model_name}...")
model.save_pretrained(new_model_name) # Local saving
tokenizer.save_pretrained(new_model_name)

# 8. GGUF Conversion (Optional - for Ollama)
print("converting to GGUF...")
try:
    model.save_pretrained_gguf(new_model_name, tokenizer, quantization_method = "q4_k_m")
    print(f"Model saved and converted to GGUF in {new_model_name}")
except Exception as e:
    print(f"GGUF conversion failed: {e}")
