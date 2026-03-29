"""
Generate 3D GLB from 4.1-Photoroom.png using TripoSR (local, CPU)
"""
import os
import sys

# Add TripoSR to path
sys.path.insert(0, "c:/Users/bellu/Desktop/TripoSR")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
IMG = os.path.join(PROJECT_DIR, "public", "uploads", "4.1-Photoroom.png")
OUT = os.path.join(PROJECT_DIR, "public", "models", "coffret.glb")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

print(f"Input:  {IMG}")
print(f"Output: {OUT}")

import torch
print(f"PyTorch: {torch.__version__}")
print("Device: cpu")

print("Loading TripoSR model (downloads ~350MB on first run)...")
from tsr.system import TSR

model = TSR.from_pretrained(
    "stabilityai/TripoSR",
    config_name="config.yaml",
    weight_name="model.ckpt",
)
model.to("cpu")
model.renderer.set_chunk_size(1)  # Low memory mode

from PIL import Image
from tsr.utils import remove_background, resize_foreground

print("Processing image...")
image = Image.open(IMG)

# Remove background if not already transparent
if image.mode != "RGBA" or image.getextrema()[3][0] == 255:
    print("Removing background...")
    rembg_session = None
    try:
        from rembg import new_session
        rembg_session = new_session()
    except:
        pass
    image = remove_background(image, rembg_session)

# Resize foreground to fill frame
image = resize_foreground(image, 0.85)

# Convert to RGB on white bg for model input
if image.mode == "RGBA":
    bg = Image.new("RGBA", image.size, (255, 255, 255, 255))
    bg.paste(image, mask=image.split()[3])
    image = bg.convert("RGB")

print("Generating 3D (CPU mode, ~5 min)...")
with torch.no_grad():
    scene_codes = model([image], device="cpu")

print("Extracting mesh (resolution=192)...")
meshes = model.extract_mesh(scene_codes, resolution=192)
mesh = meshes[0]

print(f"Vertices: {mesh.vertices.shape[0]}, Faces: {mesh.faces.shape[0]}")

# Export via trimesh
import trimesh
import numpy as np

vertices = mesh.vertices.cpu().numpy()
faces = mesh.faces.cpu().numpy()

tri = trimesh.Trimesh(vertices=vertices, faces=faces)

# Apply vertex colors if available
if hasattr(mesh, 'vertex_colors') and mesh.vertex_colors is not None:
    vc = mesh.vertex_colors.cpu().numpy()
    if vc.max() <= 1.0:
        vc = (vc * 255).astype(np.uint8)
    if vc.shape[1] == 3:
        alpha = np.full((vc.shape[0], 1), 255, dtype=np.uint8)
        vc = np.concatenate([vc, alpha], axis=1)
    tri.visual.vertex_colors = vc

tri.export(OUT, file_type='glb')
print(f"\n=== coffret.glb: {os.path.getsize(OUT)/1024:.0f} KB ===")
