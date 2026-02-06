import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
from datasets import load_dataset
import os

# 1. Configuration
model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"  # Official HF ID (or use a quant if needed)
# Since we are on consumer GPU, usually we use a quantized base if possible, or 4bit loading.
# If user doesn't have access to gated repo, we might need a public mirror or assume logged in.
# Let's use a public mirror if possible or assuming they are logged in via 'huggingface-cli login'
# "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit" is optimized for unsloth but might work with transformers if bitsandbytes is recent.
# Let's stick to a safe standard base.
model_name = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit" # This comes pre-quantized which is handy

new_model_name = "llama-3.1-8b-turkish-drug-finetuned"

def train():
    print("🚀 Windows Training Script Started...")
    
    # 2. Check GPU
    if not torch.cuda.is_available():
        print("❌ Error: GPU not detected. Training on CPU is not feasible.")
        return

    print(f"✅ GPU Detected: {torch.cuda.get_device_name(0)}")

    # 3. Load Model with 4-bit quantization (requires bitsandbytes-windows)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    )

    print(f"📥 Loading Model: {model_name}")
    try:
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    except Exception as e:
        print(f"❌ Model Load Error: {e}")
        print("Tip: You might need to install: pip install bitsandbytes-windows")
        return

    tokenizer.pad_token = tokenizer.eos_token
    
    # Prepare for LoRA
    model = prepare_model_for_kbit_training(model)
    
    peft_config = LoraConfig(
        r=16,
        lora_alpha=16,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 4. Load Dataset
    dataset_file = "finetune_dataset.jsonl"
    if not os.path.exists(dataset_file):
        print("❌ Dataset file not found!")
        return

    dataset = load_dataset("json", data_files=dataset_file, split="train")

    # Format Prompt
    def formatting_prompts_func(example):
        output_texts = []
        for instruction, input_text, output in zip(example['instruction'], example['input'], example['output']):
            user_msg = instruction
            if input_text:
                user_msg += "\n" + input_text
                
            # Chat Format
            text = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nSen yardımcı bir ilaç asistanısın. Her zaman Türkçe yanıt ver.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_msg}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n{output}<|eot_id|>"
            output_texts.append(text)
        return output_texts

    # 5. Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        formatting_func=formatting_prompts_func,
        max_seq_length=2048,
        args=TrainingArguments(
            output_dir="outputs",
            per_device_train_batch_size=2,
            gradient_accumulation_steps=4,
            warmup_steps=10,
            max_steps=60, # Short run for demo/speed
            learning_rate=2e-4,
            fp16=True,
            logging_steps=1,
            optim="paged_adamw_8bit",
            save_strategy="steps",
            save_steps=30
        ),
    )

    print("🔥 Starting Training...")
    trainer.train()

    # 6. Save Adapter
    print(f"💾 Saving Adapter to {new_model_name}...")
    trainer.model.save_pretrained(new_model_name)
    tokenizer.save_pretrained(new_model_name)
    
    print("\n✅ Training Complete!")
    print(f"Adapter saved in folder: {new_model_name}")
    print("To use with Ollama, we now need to merge and convert to GGUF.")

if __name__ == "__main__":
    train()
