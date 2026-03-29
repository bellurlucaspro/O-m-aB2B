"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const MODEL_URL = "/models/tower-optimized.glb"; // 5 Mo (compressed from 87 Mo)

/* Shared loader */
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("/draco/");
loader.setDRACOLoader(draco);

function normalizeScene(scene: THREE.Group, targetSize = 2.4): THREE.Group {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
    if (!mat) return;
    mat.needsUpdate = true;
    if (mat.map) { mat.map.colorSpace = THREE.SRGBColorSpace; mat.map.needsUpdate = true; }
  });

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) clone.scale.setScalar(targetSize / maxDim);

  const center = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
  clone.position.sub(center);
  return clone;
}

function TowerScene({ scene }: { scene: THREE.Group }) {
  const normalized = useMemo(() => normalizeScene(scene, 1.4), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  const matsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  useEffect(() => {
    const mats: THREE.MeshStandardMaterial[] = [];
    normalized.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (m) mats.push(m);
      }
    });
    matsRef.current = mats;
  }, [normalized]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalized} />
    </group>
  );
}

export default function TowerModel3D({ height = 420 }: { height?: number }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loader.load(
      MODEL_URL,
      (gltf) => { if (!cancelled) { setScene(gltf.scene); setTimeout(() => setReady(true), 100); } },
      undefined,
      () => { if (!cancelled) setError(true); },
    );
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
      {/* Static image — always rendered as instant placeholder, fades out when 3D is ready */}
      <div style={{
        position: scene && ready ? "absolute" : "relative",
        inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        opacity: scene && ready ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: scene && ready ? "none" : "auto",
        zIndex: 1,
      }}>
        <img src="/mockup-box-grossesse.webp" alt="Coffret O'Méa" style={{ maxHeight: "90%", maxWidth: "90%", objectFit: "contain" }} />
      </div>

      {/* 3D Canvas — renders on top when loaded */}
      {scene && !error && (
      <div style={{
        position: "absolute", inset: 0,
        opacity: ready ? 1 : 0,
        transition: "opacity 0.5s ease",
        zIndex: 2,
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
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} color="#FFF8F0" />
          <directionalLight position={[5, 6, 4]} intensity={2.8} color="#FFF5E8" />
          <directionalLight position={[-4, 3, -2]} intensity={1.0} color="#F0F0FF" />
          <directionalLight position={[0, -1, 4]} intensity={0.5} color="#FFF0E0" />
          <TowerScene scene={scene} />
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
