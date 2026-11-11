"use client";

import { useMemo } from "react";
import * as THREE from "three";

/** Gaussian bump: displaces the surface outward around a direction. */
function bump(
  dir: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  amount: number,
) {
  const d = dir.distanceTo(center);
  return amount * Math.exp(-(d * d) / (radius * radius));
}

function buildGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 64);
  const position = geometry.attributes.position;
  const dir = new THREE.Vector3();

  // Sketched features, as unit directions from the head centre.
  const nose = new THREE.Vector3(0, -0.12, 1).normalize();
  const browL = new THREE.Vector3(0.38, 0.32, 0.87).normalize();
  const browR = new THREE.Vector3(-0.38, 0.32, 0.87).normalize();
  const chin = new THREE.Vector3(0, -0.72, 0.69).normalize();
  const cheekL = new THREE.Vector3(0.5, -0.2, 0.84).normalize();
  const cheekR = new THREE.Vector3(-0.5, -0.2, 0.84).normalize();

  for (let i = 0; i < position.count; i++) {
    dir.fromBufferAttribute(position, i).normalize();
    let r = 1;
    r += bump(dir, nose, 0.2, 0.2);
    r += bump(dir, browL, 0.22, 0.07);
    r += bump(dir, browR, 0.22, 0.07);
    r += bump(dir, chin, 0.25, 0.1);
    r += bump(dir, cheekL, 0.28, 0.04);
    r += bump(dir, cheekR, 0.28, 0.04);
    // Narrower lower jaw.
    if (dir.y < -0.3) r *= 1 - 0.18 * Math.min(1, (-0.3 - dir.y) / 0.7);
    position.setXYZ(i, dir.x * r * 0.38, dir.y * r * 0.45, dir.z * r * 0.42);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Placeholder head (about 1 unit tall) used until public/models/head.glb exists.
 * Origin at the head centre, Y up, face toward +Z.
 */
export function ProvisionalHead() {
  const headGeometry = useMemo(() => buildGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e8e4dc",
        roughness: 0.85,
        metalness: 0,
      }),
    [],
  );

  return (
    <group>
      <mesh geometry={headGeometry} material={material} />
      {/* Neck */}
      <mesh position={[0, -0.55, -0.04]} material={material}>
        <cylinderGeometry args={[0.15, 0.17, 0.4, 32]} />
      </mesh>
      {/* Ears */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.375, -0.02, -0.02]}
          scale={[0.35, 1, 0.7]}
          material={material}
        >
          <sphereGeometry args={[0.09, 24, 16]} />
        </mesh>
      ))}
    </group>
  );
}
