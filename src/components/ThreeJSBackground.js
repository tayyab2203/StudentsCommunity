'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJSBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Particle material with gradient
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x8da9c4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create animated mesh
    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0x134074,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add second torus
    const geometry2 = new THREE.TorusGeometry(1.5, 0.2, 16, 100);
    const material2 = new THREE.MeshStandardMaterial({
      color: 0x8da9c4,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    scene.add(mesh2);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Point light
    const pointLight = new THREE.PointLight(0x8da9c4, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
      const elapsedTime = clock.getElapsedTime();
      time = elapsedTime;

      // Rotate meshes
      mesh.rotation.x = time * 0.2;
      mesh.rotation.y = time * 0.3;
      mesh2.rotation.x = -time * 0.15;
      mesh2.rotation.y = -time * 0.25;

      // Animate particles
      const positions = particlesMesh.geometry.attributes.position.array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i) * 0.001;
        positions[i3] += Math.cos(time + i * 0.5) * 0.001;
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;

      // Camera movement
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.3;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      geometry2.dispose();
      material2.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}

