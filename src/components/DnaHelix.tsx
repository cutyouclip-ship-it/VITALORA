import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TURNS = 3.2;
const HEIGHT = 14;
const RADIUS = 1.6;
const PER_STRAND = 1400;

export const DnaHelix: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Compute DNA helix points
    const s: number[] = [];
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < PER_STRAND; i++) {
        const t = i / PER_STRAND;
        const a = t * Math.PI * 2 * TURNS + k * Math.PI;
        const j = 0.18;
        s.push(
          Math.cos(a) * RADIUS + (Math.random() - 0.5) * j,
          (t - 0.5) * HEIGHT + (Math.random() - 0.5) * j,
          Math.sin(a) * RADIUS + (Math.random() - 0.5) * j
        );
      }
    }

    const r: number[] = [];
    const count = 46;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const a = t * Math.PI * 2 * TURNS;
      for (let p = 0; p < 26; p++) {
        const u = p / 25;
        const x = THREE.MathUtils.lerp(Math.cos(a), Math.cos(a + Math.PI), u) * RADIUS;
        const z = THREE.MathUtils.lerp(Math.sin(a), Math.sin(a + Math.PI), u) * RADIUS;
        r.push(x, (t - 0.5) * HEIGHT, z);
      }
    }

    const d: number[] = [];
    for (let i = 0; i < 600; i++) {
      d.push(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10 - 3
      );
    }

    const group = new THREE.Group();
    group.rotation.set(0, 0, -0.55);
    scene.add(group);

    // Strands
    const strandGeo = new THREE.BufferGeometry();
    strandGeo.setAttribute('position', new THREE.Float32BufferAttribute(s, 3));
    const strandMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0xffb547,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const strandPoints = new THREE.Points(strandGeo, strandMat);
    group.add(strandPoints);

    // Rungs
    const rungsGeo = new THREE.BufferGeometry();
    rungsGeo.setAttribute('position', new THREE.Float32BufferAttribute(r, 3));
    const rungsMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xff8a2a,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const rungsPoints = new THREE.Points(rungsGeo, rungsMat);
    group.add(rungsPoints);

    // Dust
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(d, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xffd9a0,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      group.rotation.y += Math.min(delta, 0.05) * 0.25;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full min-h-[500px]" />;
};
export default DnaHelix;
