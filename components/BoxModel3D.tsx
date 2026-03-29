"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/* ─── Shared loader ─── */
const gltfCache = new Map<string, THREE.Group>();
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("/draco/");
loader.setDRACOLoader(draco);

function loadModel(url: string): Promise<THREE.Group> {
  if (gltfCache.has(url)) return Promise.resolve(gltfCache.get(url)!);
  return new Promise((resolve, reject) => {
    loader.load(url,
      (gltf) => { gltfCache.set(url, gltf.scene); resolve(gltf.scene); },
      undefined,
      (err) => { console.error("GLB load error:", url, err); reject(err); },
    );
  });
}

/* ─── Normalize ─── */
function normalizeScene(scene: THREE.Group, targetSize: number): THREE.Group {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
    if (!mat) return;
    mat.needsUpdate = true;
    if (mat.map) { mat.map.colorSpace = THREE.SRGBColorSpace; mat.map.needsUpdate = true; }
  });
  const box = new THREE.Box3().setFromObject(clone);
  const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
  if (maxDim > 0) clone.scale.setScalar(targetSize / maxDim);
  const center = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
  clone.position.sub(center);
  return clone;
}

/* ─── Model component ─── */
function BoxScene({ scene, visible, targetSize }: { scene: THREE.Group; visible: boolean; targetSize: number }) {
  const normalized = useMemo(() => normalizeScene(scene, targetSize), [scene, targetSize]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = visible;
    if (!visible) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.18;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.04;
  });

  return (
    <group ref={groupRef} visible={visible}>
      <primitive object={normalized} />
    </group>
  );
}

/* ─── Config ─── */
const SIZE = 2.4;
const MODELS = [
  { url: "/models/box-optimized.glb", size: SIZE },
  { url: "/models/box2-optimized.glb", size: SIZE },
];

export default function BoxModel3D({
  height = 460,
  alternateInterval = 8000,
}: {
  height?: number;
  alternateInterval?: number;
}) {
  const [webglOk, setWebglOk] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scenes, setScenes] = useState<(THREE.Group | null)[]>([null, null]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) setWebglOk(false);
    } catch { setWebglOk(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    MODELS.forEach((m, i) => {
      loadModel(m.url).then((scene) => {
        if (!cancelled) {
          setScenes((prev) => { const n = [...prev]; n[i] = scene; return n; });
        }
      }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, []);

  const allLoaded = scenes.every(Boolean);

  // Mark ready with small delay after first model loads for smooth fade
  useEffect(() => {
    if (scenes[0]) {
      const t = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(t);
    }
  }, [scenes]);

  useEffect(() => {
    if (!allLoaded) return;
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % MODELS.length);
    }, alternateInterval);
    return () => clearInterval(id);
  }, [alternateInterval, allLoaded]);

  return (
    <div style={{ width: "100%", height, maxWidth: "680px", margin: "0 auto", position: "relative" }}>
      {/* Background circle */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "72%", paddingBottom: "72%", borderRadius: "50%",
        background: "linear-gradient(145deg, var(--pink) 0%, var(--pink-dark) 100%)",
        border: "2px solid rgba(240,223,197,0.5)",
        boxShadow: "0 12px 48px rgba(200,180,160,0.2)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Static placeholder image — instant, fades out when 3D ready */}
      <div style={{
        position: ready ? "absolute" : "relative",
        inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        opacity: ready ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: ready ? "none" : "auto",
        zIndex: 3,
      }}>
        <img
          src="/uploads/produits-box-omea.webp"
          alt="Coffret O'Méa"
          style={{ maxHeight: "85%", maxWidth: "85%", objectFit: "contain" }}
        />
      </div>

      {/* Dots */}
      {allLoaded && (
        <div style={{
          position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "6px", zIndex: 4,
        }}>
          {MODELS.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              aria-label={`Mod\u00e8le ${i + 1}`}
              style={{
                width: activeIdx === i ? "22px" : "6px", height: "6px",
                borderRadius: "3px", border: "none", padding: 0, cursor: "pointer",
                background: activeIdx === i ? "var(--green-deep)" : "rgba(135,163,141,0.3)",
                transition: "all 0.4s ease",
              }} />
          ))}
        </div>
      )}

      {/* 3D Canvas — loads on top, appears with fade */}
      {webglOk && (
      <div style={{
        position: "absolute", inset: 0,
        opacity: ready ? 1 : 0,
        transition: "opacity 0.5s ease",
        zIndex: 1,
      }}>
      <Canvas
        camera={{ fov: 32, near: 0.1, far: 50, position: [0, 0.4, 5] }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setWebglOk(false);
          });
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} color="#FFF8F0" />
          <directionalLight position={[5, 6, 4]} intensity={2.8} color="#FFF5E8" />
          <directionalLight position={[-4, 3, -2]} intensity={1.0} color="#F0F0FF" />
          <directionalLight position={[0, -1, 4]} intensity={0.5} color="#FFF0E0" />

          {scenes.map((s, i) =>
            s && <BoxScene key={MODELS[i].url} scene={s} visible={activeIdx === i} targetSize={MODELS[i].size} />
          )}

          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls
          enableZoom={false} enablePan={false} autoRotate={false}
          minPolarAngle={Math.PI / 3.5} maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-Math.PI / 4} maxAzimuthAngle={Math.PI / 4}
          dampingFactor={0.08} enableDamping
        />
      </Canvas>
      </div>
      )}
    </div>
  );
}
