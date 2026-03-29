"""
O'Méa coffret 3D — v6 DEFINITIVE
Exact reproduction of 4.1-Photoroom.png
Fixed: lid direction, straw frisure, camera angle, proportions, colors
"""

import bpy
import bmesh
import math
import os
import random
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT = os.path.join(PROJECT_DIR, "public", "models", "coffret.glb")
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

# ─── MATERIALS ────────────────────────────────────────
def pbr(name, hex_color, rough=0.8, metal=0.0):
    h = hex_color.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    for n in m.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = (r, g, b, 1.0)
            n.inputs['Roughness'].default_value = rough
            n.inputs['Metallic'].default_value = metal
            break
    return m

# Colors sampled from photo — lighter/warmer than v5
M_KRAFT    = pbr("Kraft",    "#CEB080", 0.85)   # warm kraft
M_KRAFT_IN = pbr("KraftIn",  "#D8BC90", 0.82)   # inner kraft lighter
M_STRAW    = pbr("Straw",    "#D8C488", 0.92)   # golden straw
M_PINK     = pbr("Pink",     "#E8B8B0", 0.45)   # lighter pink
M_BAMBOO   = pbr("Bamboo",   "#C8A068", 0.60)
M_GOLD     = pbr("Gold",     "#E0B850", 0.22, 0.05)
M_GCAP     = pbr("GCap",     "#3A4830", 0.48)
M_WHITE    = pbr("White",    "#F5F0E8", 0.35)   # brighter white
M_GLBL     = pbr("GLbl",     "#8A9860", 0.50)
M_WOOD     = pbr("Wood",     "#A88050", 0.70)
M_CREAM    = pbr("Cream",    "#E8DCC8", 0.90)   # lighter cream
M_COTTON   = pbr("Cotton",   "#F0E8D8", 0.95)
M_MESH     = pbr("Mesh",     "#E0D4C0", 0.88)
M_SPONGE   = pbr("Sponge",   "#C8B8A0", 0.92)
M_DRIED    = pbr("Dried",    "#D8C8B0", 0.92)
M_STEMS    = pbr("Stems",    "#98A878", 0.78)
M_TEXT     = pbr("Text",     "#605040", 0.90)
M_ILLUST   = pbr("Illust",   "#D8C8A8", 0.80)
M_ORANGE   = pbr("Orange",   "#D89858", 0.55)

# ─── HELPERS ──────────────────────────────────────────
def assign(o, m):
    o.data.materials.clear(); o.data.materials.append(m)

def smo(o):
    bpy.context.view_layer.objects.active = o
    o.select_set(True); bpy.ops.object.shade_smooth(); o.select_set(False)
    return o

def cyl(r, h, loc, mat, v=32, name="C"):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=v)
    o = smo(bpy.context.active_object); o.name=name; assign(o, mat); return o

def box(sz, loc, mat, sc=(1,1,1), rot=(0,0,0), name="B"):
    bpy.ops.mesh.primitive_cube_add(size=sz, location=loc)
    o = bpy.context.active_object; o.name=name; o.scale=sc; o.rotation_euler=rot
    assign(o, mat); return o

def sph(r, loc, mat, sc=(1,1,1), name="S"):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=16)
    o = smo(bpy.context.active_object); o.name=name; o.scale=sc; assign(o, mat); return o

def txt(t, loc, rot, sz=0.03, ext=0.001):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o=bpy.context.active_object; o.data.body=t; o.data.size=sz; o.data.extrude=ext
    o.data.align_x='CENTER'; o.data.align_y='CENTER'; assign(o, M_TEXT); return o

# ─── DIMENSIONS ───────────────────────────────────────
# Photo: wide, shallow box
W, D, H, T = 0.38, 0.27, 0.080, 0.003
hw, hd = W/2, D/2

# ═══════════════════════════════════════════════════════
#  BOX BASE — FRONT is at Y- (facing camera)
# ═══════════════════════════════════════════════════════
print("► Box...")
bm = bmesh.new()
for vl in [
    [(-hw,-hd,0),(hw,-hd,0),(hw,hd,0),(-hw,hd,0)],
    [(-hw,-hd,0),(hw,-hd,0),(hw,-hd,H),(-hw,-hd,H)],
    [(hw,hd,0),(-hw,hd,0),(-hw,hd,H),(hw,hd,H)],
    [(-hw,hd,0),(-hw,-hd,0),(-hw,-hd,H),(-hw,hd,H)],
    [(hw,-hd,0),(hw,hd,0),(hw,hd,H),(hw,-hd,H)],
]:
    bm.faces.new([bm.verts.new(v) for v in vl])
mesh = bpy.data.meshes.new("BoxMesh"); bm.to_mesh(mesh); bm.free()
bx = bpy.data.objects.new("Box", mesh); bpy.context.collection.objects.link(bx)
bpy.context.view_layer.objects.active = bx
m=bx.modifiers.new("S",'SOLIDIFY'); m.thickness=T; m.offset=-1
bpy.ops.object.modifier_apply(modifier="S")
m=bx.modifiers.new("B",'BEVEL'); m.width=0.0012; m.segments=2
bpy.ops.object.modifier_apply(modifier="B")
assign(bx, M_KRAFT)

# ═══════════════════════════════════════════════════════
#  LID — hinged at BACK (Y+), opens BACKWARD away from viewer
#  Panel extends in +Y direction, rotated -112° around X
# ═══════════════════════════════════════════════════════
print("► Lid...")
bm = bmesh.new()
ld = D * 1.03
# Main lid panel — extends BACKWARD from hinge
bm.faces.new([bm.verts.new(v) for v in [(-hw,0,0),(hw,0,0),(hw,ld,0),(-hw,ld,0)]])
# Front tuck flap
fw = hw * 0.88
bm.faces.new([bm.verts.new(v) for v in [(-fw,ld,0),(fw,ld,0),(fw,ld+0.048,0),(-fw,ld+0.048,0)]])
# Left dust flap
sf = H * 0.50
bm.faces.new([bm.verts.new(v) for v in [(-hw,0,0),(-hw,0,-sf),(-hw,D*0.46,-sf),(-hw,D*0.46,0)]])
# Right dust flap
bm.faces.new([bm.verts.new(v) for v in [(hw,0,0),(hw,D*0.46,0),(hw,D*0.46,-sf),(hw,0,-sf)]])

mesh = bpy.data.meshes.new("LidMesh"); bm.to_mesh(mesh); bm.free()
lid = bpy.data.objects.new("Lid", mesh); bpy.context.collection.objects.link(lid)
bpy.context.view_layer.objects.active = lid
m=lid.modifiers.new("S",'SOLIDIFY'); m.thickness=T; m.offset=-1
bpy.ops.object.modifier_apply(modifier="S")
m=lid.modifiers.new("B",'BEVEL'); m.width=0.0012; m.segments=2
bpy.ops.object.modifier_apply(modifier="B")

# Hinge at BACK wall top edge, open 112° BACKWARD
lid.location = (0, hd, H)
lid.rotation_euler = (math.radians(-112), 0, 0)
assign(lid, M_KRAFT)

# ═══════════════════════════════════════════════════════
#  LID ILLUSTRATION (mother-baby)
# ═══════════════════════════════════════════════════════
print("► Illustration...")
bpy.ops.mesh.primitive_circle_add(radius=0.055, vertices=48, fill_type='NGON',
    location=(0.02, hd+0.09, H+0.065))
ill = bpy.context.active_object; ill.name="IllBG"
ill.rotation_euler = (math.radians(-22), 0, 0)
assign(ill, M_ILLUST)
sph(0.020, (0.01, hd+0.085, H+0.078), M_ILLUST, (0.6,0.2,1.1), "Mom")
sph(0.013, (0.03, hd+0.090, H+0.058), M_ILLUST, (0.7,0.2,0.8), "Baby")
txt("O'mea", (0.05, hd+0.055, H+0.048), (math.radians(-22),0,0), 0.016, 0.0003)

# ═══════════════════════════════════════════════════════
#  STRAW FRISURE — long golden strips, NOT tiny cubes
# ═══════════════════════════════════════════════════════
print("► Straw frisure...")
random.seed(42)
for i in range(70):
    # Each straw strip = very elongated thin box
    bpy.ops.mesh.primitive_cube_add(size=1)
    s = bpy.context.active_object; s.name = f"Str{i}"

    x = random.uniform(-hw+0.025, hw-0.025)
    y = random.uniform(-hd+0.025, hd-0.025)
    z = T + random.uniform(0.010, 0.050)
    s.location = (x, y, z)

    # LONG thin strips — like real straw
    length = random.uniform(0.04, 0.10)
    width = random.uniform(0.0015, 0.003)
    s.scale = (length, width, width * 0.5)

    # Random curl/orientation
    s.rotation_euler = (
        random.uniform(-0.6, 0.6),
        random.uniform(-0.3, 0.3),
        random.uniform(0, math.pi),
    )
    assign(s, M_STRAW)

# ═══════════════════════════════════════════════════════
#  PRODUCTS INSIDE — photo-accurate placement
#  Looking from FRONT: left=X-, right=X+, back=Y+
# ═══════════════════════════════════════════════════════
print("► Products...")

# ── PINK CREAM JAR — center, most visible ──
cyl(0.040, 0.036, (0.00, 0.00, 0.058), M_PINK, 32, "PinkJar")
cyl(0.041, 0.009, (0.00, 0.00, 0.080), M_BAMBOO, 32, "JarLid")

# ── GOLD OIL BOTTLE — right side, tallest ──
cyl(0.015, 0.135, (0.11, 0.03, 0.105), M_GOLD, 24, "GoldBtl")
cyl(0.011, 0.012, (0.11, 0.03, 0.178), M_GOLD, 16, "GoldNeck")
cyl(0.007, 0.020, (0.11, 0.03, 0.190), M_GCAP, 12, "GoldCap")
# Pump nozzle
cyl(0.002, 0.015, (0.11, 0.018, 0.200), M_GCAP, 8, "Pump")
bpy.context.active_object.rotation_euler = (math.radians(80),0,0)

# ── WHITE TUBES (Avril) — leaning ──
cyl(0.013, 0.095, (0.04, 0.04, 0.070), M_WHITE, 16, "Tube1")
bpy.context.active_object.rotation_euler = (math.radians(58),math.radians(5),math.radians(-10))

cyl(0.012, 0.085, (0.01, 0.06, 0.065), M_WHITE, 16, "Tube2")
bpy.context.active_object.rotation_euler = (math.radians(65),math.radians(-6),math.radians(8))

# ── BAMBOO CYLINDER ──
cyl(0.023, 0.045, (0.06, -0.02, 0.052), M_BAMBOO, 24, "BamCyl")

# ── PRODUCT BOXES inside ──
box(0.034, (-0.06, 0.04, 0.045), M_GLBL, (1.3,0.45,0.9), name="GBox")
box(0.026, (-0.04, 0.065, 0.040), M_WHITE, (1.1,0.38,0.8), (0,0,math.radians(10)), "WBox")
box(0.028, (-0.08, -0.01, 0.042), M_ORANGE, (1.0,0.48,1.0), (0,0,math.radians(-5)), "OBox")

# ── SMALL SPRAY BOTTLE ──
cyl(0.009, 0.072, (0.08, 0.06, 0.070), M_WHITE, 12, "Spray")
bpy.context.active_object.rotation_euler = (math.radians(6),0,math.radians(-5))

# ═══════════════════════════════════════════════════════
#  LEFT SIDE — exact photo layout
# ═══════════════════════════════════════════════════════
print("► Left items...")

# ── FABRIC POUCH — LARGE, dominant left element ──
# In photo: tall, cream fabric, "O'méa" + deer/flower motif
box(0.18, (-0.36, 0.02, 0.085), M_CREAM, (1.1, 0.18, 1.1),
    (0, math.radians(-3), math.radians(4)), "Pouch")
sph(0.034, (-0.36, 0.02, 0.180), M_CREAM, (1.5,0.38,0.50), "PchTop")
# Cords
cyl(0.002, 0.035, (-0.34, 0.005, 0.185), M_CREAM, 6, "Cord1")
bpy.context.active_object.rotation_euler = (math.radians(18),math.radians(35),0)
cyl(0.002, 0.030, (-0.38, 0.015, 0.182), M_CREAM, 6, "Cord2")
bpy.context.active_object.rotation_euler = (math.radians(15),math.radians(-30),0)

# ── SMALL DRAWSTRING BAG (behind pouch, slightly higher) ──
box(0.060, (-0.30, 0.09, 0.068), M_CREAM, (0.80,0.25,1.0), name="SmBag")
sph(0.014, (-0.30, 0.09, 0.100), M_CREAM, (1.1,0.30,0.40), "SmBTop")

# ── KONJAC SPONGE — IN FRONT of box, large dome ──
sph(0.044, (-0.20, -0.16, 0.028), M_SPONGE, (1.0,1.0,0.50), "Sponge")

# ── COTTON PADS — front-left, clearly visible stack ──
for i in range(5):
    cyl(0.026, 0.003, (-0.34, -0.20, 0.003+i*0.004), M_COTTON, 24, f"Pad{i}")
    bpy.context.active_object.rotation_euler = (
        math.radians(random.uniform(-2,2)), 0, math.radians(i*20))

# ── DRIED FLOWERS ──
random.seed(88)
for j in range(14):
    a = j*math.pi*2/14
    r = random.uniform(0.004, 0.016)
    sph(random.uniform(0.003,0.005),
        (-0.25+r*math.cos(a), -0.10+r*math.sin(a)*0.3, 0.052+j*0.0025),
        M_DRIED, name=f"Fl{j}")
for k in range(4):
    cyl(0.0012, 0.048, (-0.25+k*0.005, -0.10, 0.025), M_STEMS, 6, f"Stm{k}")
    bpy.context.active_object.rotation_euler = (math.radians(10+k*4),math.radians(-4+k*2),0)

# ── WOODEN BRUSH ──
box(0.046, (-0.18, -0.13, 0.013), M_WOOD, (0.40,1.60,0.18),
    (0,0,math.radians(28)), "Brush")

# ── PRODUCT BOXES left side ──
box(0.028, (-0.16, -0.04, 0.018), M_WHITE, (1.5,0.38,0.70),
    (0,0,math.radians(15)), "LProd")
box(0.024, (-0.15, -0.06, 0.015), M_GLBL, (1.2,0.32,0.60),
    (0,0,math.radians(22)), "LProd2")

# ═══════════════════════════════════════════════════════
#  RIGHT SIDE
# ═══════════════════════════════════════════════════════
print("► Right items...")

# ── MESH BAG — pear shape ──
sph(0.055, (0.30, 0.04, 0.058), M_MESH, (0.65,0.45,1.05), "MeshBag")
cyl(0.014, 0.018, (0.30, 0.04, 0.115), M_CREAM, 16, "BagTop")
cyl(0.002, 0.025, (0.31, 0.05, 0.125), M_CREAM, 6, "BCrd1")
bpy.context.active_object.rotation_euler = (math.radians(12),math.radians(20),0)
cyl(0.002, 0.022, (0.29, 0.03, 0.122), M_CREAM, 6, "BCrd2")
bpy.context.active_object.rotation_euler = (math.radians(10),math.radians(-15),0)

# ── SMALL WOODEN BOX ──
box(0.033, (0.26, -0.12, 0.016), M_WOOD, (1,1,0.48), name="WdBox")

# ── SMALL ROUND POT ──
cyl(0.011, 0.010, (0.23, -0.08, 0.036), M_COTTON, 16, "SmPot")

# ═══════════════════════════════════════════════════════
#  TEXT
# ═══════════════════════════════════════════════════════
print("► Text...")
# Front: O'mea
txt("O'mea", (0, -hd-T-0.001, H*0.58), (math.radians(90),0,0), 0.028, 0.0008)
# Tagline
txt("Coffret maternite naturel & responsable",
    (0, -hd-T-0.001, H*0.18), (math.radians(90),0,0), 0.006, 0.0003)
# Pouch
txt("O'mea", (-0.36, -0.01, 0.080), (math.radians(90),0,0), 0.014, 0.0003)

# ═══════════════════════════════════════════════════════
#  EXPORT
# ═══════════════════════════════════════════════════════
print("► Export...")
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=OUTPUT, export_format='GLB',
    use_selection=False, export_apply=True,
    export_cameras=False, export_lights=False,
    export_materials='EXPORT', export_normals=True,
    export_texcoords=True,
)
print(f"\n✅ {os.path.getsize(OUTPUT)/1024:.0f} KB")
