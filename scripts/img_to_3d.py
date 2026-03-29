"""
Convert 4.1-Photoroom.png to 3D GLB using free HuggingFace Spaces
Tries multiple free image-to-3D spaces until one works.
"""
import os
import shutil
from gradio_client import Client, handle_file

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
IMG_PATH = os.path.join(PROJECT_DIR, "public", "uploads", "4.1-Photoroom.png")
OUTPUT = os.path.join(PROJECT_DIR, "public", "models", "coffret.glb")
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

# List of free HuggingFace Spaces for image-to-3D
SPACES = [
    {
        "name": "TencentARC/InstantMesh",
        "call": lambda c: c.predict(handle_file(IMG_PATH), api_name="/generate_mesh"),
    },
    {
        "name": "sudo-ai/zero123plus-demo-space",
        "call": lambda c: c.predict(handle_file(IMG_PATH), api_name="/predict"),
    },
    {
        "name": "One-2-3-45/One-2-3-45",
        "call": lambda c: c.predict(handle_file(IMG_PATH), api_name="/predict"),
    },
]

def find_glb(result):
    """Extract GLB file path from various result formats."""
    if isinstance(result, str) and (result.endswith('.glb') or result.endswith('.obj')):
        return result
    if isinstance(result, (list, tuple)):
        for item in result:
            found = find_glb(item)
            if found:
                return found
    if isinstance(result, dict):
        for v in result.values():
            found = find_glb(v)
            if found:
                return found
    # Check if it's a file path that exists
    if isinstance(result, str) and os.path.exists(result):
        return result
    return None

for space in SPACES:
    name = space["name"]
    print(f"\n{'='*50}")
    print(f"Trying: {name}")
    print(f"{'='*50}")
    try:
        client = Client(name)
        print("Connected. Generating 3D model...")
        result = space["call"](client)
        print(f"Result type: {type(result)}")
        print(f"Result: {str(result)[:500]}")

        glb_path = find_glb(result)
        if glb_path and os.path.exists(glb_path):
            shutil.copy2(glb_path, OUTPUT)
            print(f"\n✅ GLB saved: {OUTPUT} ({os.path.getsize(OUTPUT)/1024:.0f} KB)")
            break
        else:
            print(f"No GLB found in result")
    except Exception as e:
        print(f"Failed: {e}")
        continue
else:
    print("\n❌ All spaces failed. Try manually at:")
    print("   https://huggingface.co/spaces/TencentARC/InstantMesh")
    print("   Upload your image, download the GLB, place it in public/models/coffret.glb")
