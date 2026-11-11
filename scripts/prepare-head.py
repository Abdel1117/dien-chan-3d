"""Converts a head mesh (OBJ) into public/models/head.glb for the app.

Run headless:
  blender --background --python scripts/prepare-head.py -- <input.obj> <output.glb> [preview_dir]

Target contract: <= 20 000 triangles, origin at the centre of the head,
Y up, face towards +Z, head height = 1.
"""
import sys
import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
src, dst = args[0], args[1]
preview_dir = args[2] if len(args) > 2 else None
MAX_TRIS = 20000

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=src, forward_axis="NEGATIVE_Z", up_axis="Y")
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
obj.name = "head"
# The importer leaves a rotation on the object: bake it into the vertices.
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# One level of smoothing subdivision if we stay under the triangle budget.
tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
if tris * 4 <= MAX_TRIS:
    mod = obj.modifiers.new("subsurf", "SUBSURF")
    mod.levels = 1
    mod.render_levels = 1
    bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.object.shade_smooth()

# Recentre on the bounding box and scale so the height is 1.
corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
lo = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
hi = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
centre = (lo + hi) / 2
height = hi.z - lo.z  # Blender is Z-up; glTF export converts to Y-up.
for v in obj.data.vertices:
    v.co = (v.co - centre) / height
obj.data.update()

final_tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
print(f"TRIANGLES={final_tris}")
assert final_tris <= MAX_TRIS, "too many triangles"

# Neutral material (the source has no texture).
mat = bpy.data.materials.new("skin")
mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.86, 0.68, 0.58, 1)
mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.7
obj.data.materials.clear()
obj.data.materials.append(mat)

bpy.ops.export_scene.gltf(filepath=dst, export_format="GLB", export_yup=True,
                          use_selection=True, export_apply=True)

if preview_dir:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = scene.render.resolution_y = 500
    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 1.4
    # Blender is Z-up here: the face looks towards -Y after import.
    for name, loc, rot in (("face", (0, -3, 0), (1.5708, 0, 0)),
                           ("profil", (3, 0, 0), (1.5708, 0, 1.5708))):
        cam.location, cam.rotation_euler = loc, rot
        scene.render.filepath = f"{preview_dir}/{name}.png"
        bpy.ops.render.render(write_still=True)
