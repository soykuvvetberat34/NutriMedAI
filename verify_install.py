
import sys

def check_branding():
    print("-" * 30)
    print("📦 Dependency Verification")
    print("-" * 30)

    # 1. TORCH & CUDA
    try:
        import torch
        print(f"✅ PyTorch: {torch.__version__}")
        if torch.cuda.is_available():
            print(f"   🚀 CUDA Available: {torch.cuda.get_device_name(0)}")
            print(f"   🔹 CUDA Version: {torch.version.cuda}")
        else:
            print("   ❌ CUDA NOT Available (Training will fail or use CPU)")
    except ImportError:
        print("❌ PyTorch Not Found")

    # 2. TRANSFORMERS
    try:
        import transformers
        print(f"✅ Transformers: {transformers.__version__}")
    except ImportError:
        print("❌ Transformers Not Found")

    # 3. PEFT
    try:
        import peft
        print(f"✅ PEFT: {peft.__version__}")
    except ImportError:
        print("❌ PEFT Not Found")

    # 4. BITSANDBYTES
    try:
        import bitsandbytes
        print(f"✅ BitsAndBytes: {bitsandbytes.__version__}")
    except ImportError as e:
        print(f"❌ BitsAndBytes Not Found or Error: {e}")
        print("   If on Windows, you might need 'bitsandbytes-windows'")

if __name__ == "__main__":
    check_branding()
