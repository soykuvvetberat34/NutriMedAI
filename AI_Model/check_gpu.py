
import sys
import subprocess

print("Python Executable:", sys.executable)
try:
    import torch
    print("Torch Version:", torch.__version__)
    print("CUDA Available:", torch.cuda.is_available())
except ImportError:
    print("Torch not installed.")
    
try:
    subprocess.run(["nvidia-smi"], check=True)
    print("nvidia-smi: Found")
except FileNotFoundError:
    print("nvidia-smi: Not Found (No NVIDIA Driver)")
except Exception as e:
    print(f"nvidia-smi error: {e}")
