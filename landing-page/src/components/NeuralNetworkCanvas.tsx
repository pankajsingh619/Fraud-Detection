"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ScreenNode {
  name: string;
  x: number;
  y: number;
}

export default function NeuralNetworkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenNodes, setScreenNodes] = useState<ScreenNode[]>([]);
  const [scrollSpeedMultiplier, setScrollSpeedMultiplier] = useState<number>(1);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 250;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Group to hold everything
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // 4 Key Core Nodes
    const corePositions = [
      { name: "Merchant", pos: new THREE.Vector3(0, 75, 0), color: 0x8b5cf6 },
      { name: "Card", pos: new THREE.Vector3(-90, 0, 0), color: 0x3b82f6 },
      { name: "Device", pos: new THREE.Vector3(90, -35, 0), color: 0x00e5ff },
      { name: "Transaction", pos: new THREE.Vector3(0, -20, 0), color: 0xef4444 },
    ];

    const coreMeshes: THREE.Mesh[] = [];

    corePositions.forEach((node) => {
      const geom = new THREE.SphereGeometry(6, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(node.pos);
      networkGroup.add(mesh);
      coreMeshes.push(mesh);
    });

    // Sub-particles (Floating nodes)
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];
    const range = 350;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * range;
      positions[i * 3 + 1] = (Math.random() - 0.5) * range;
      positions[i * 3 + 2] = (Math.random() - 0.5) * range;

      // Slow velocities
      velocities.push(
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.25
      );
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    networkGroup.add(particles);

    // Dynamic Connections between floating nodes
    const maxDistance = 80;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });

    let lineSegments = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    networkGroup.add(lineSegments);

    // Specific Core Connections (Card -> Transaction, Device -> Transaction, Merchant -> Transaction)
    const coreLineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const coreLinePositions: number[] = [];
    const txPos = corePositions[3].pos; // Transaction Node
    for (let i = 0; i < 3; i++) {
      const p = corePositions[i].pos;
      coreLinePositions.push(p.x, p.y, p.z, txPos.x, txPos.y, txPos.z);
    }

    const coreLineGeom = new THREE.BufferGeometry();
    coreLineGeom.setAttribute("position", new THREE.Float32BufferAttribute(coreLinePositions, 3));
    const coreLines = new THREE.LineSegments(coreLineGeom, coreLineMaterial);
    networkGroup.add(coreLines);

    // Scroll listener handler to pulse connection lines and accelerate rotation speed
    const handleScrollMultiplier = () => {
      const scrollY = window.scrollY;
      // Calculate multiplier based on scroll offset
      const mult = 1 + Math.min(scrollY / 200, 3.5);
      setScrollSpeedMultiplier(mult);

      // Dynamically pulse core lines opacity
      coreLineMaterial.opacity = 0.4 + Math.sin(scrollY * 0.02) * 0.25;
    };
    window.addEventListener("scroll", handleScrollMultiplier);

    // Project coordinates calculation
    const tempV = new THREE.Vector3();
    const updateHTMLPositions = () => {
      const list: ScreenNode[] = [];
      corePositions.forEach((node, idx) => {
        // Find current world position of the mesh
        const mesh = coreMeshes[idx];
        tempV.copy(mesh.position);
        
        // Apply group rotations
        tempV.applyEuler(networkGroup.rotation);
        tempV.project(camera);

        // Convert projection standard back to viewport bounds
        const x = (tempV.x * 0.5 + 0.5) * width;
        const y = (tempV.y * -0.5 + 0.5) * height;

        list.push({
          name: node.name,
          x,
          y
        });
      });
      setScreenNodes(list);
    };

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update floating particles positions
      const positionsAttr = particles.geometry.attributes.position as THREE.BufferAttribute;
      const array = positionsAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        array[i * 3] += velocities[i * 3] * scrollSpeedMultiplier;
        array[i * 3 + 1] += velocities[i * 3 + 1] * scrollSpeedMultiplier;
        array[i * 3 + 2] += velocities[i * 3 + 2] * scrollSpeedMultiplier;

        // Boundary bounce check
        if (Math.abs(array[i * 3]) > range / 2) velocities[i * 3] *= -1;
        if (Math.abs(array[i * 3 + 1]) > range / 2) velocities[i * 3 + 1] *= -1;
        if (Math.abs(array[i * 3 + 2]) > range / 2) velocities[i * 3 + 2] *= -1;
      }
      positionsAttr.needsUpdate = true;

      // Rebuild line segments
      const linePositions: number[] = [];
      for (let i = 0; i < particleCount; i++) {
        const x1 = array[i * 3];
        const y1 = array[i * 3 + 1];
        const z1 = array[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const x2 = array[j * 3];
          const y2 = array[j * 3 + 1];
          const z2 = array[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            linePositions.push(x1, y1, z1, x2, y2, z2);
          }
        }
      }

      // Refresh lines
      networkGroup.remove(lineSegments);
      lineSegments.geometry.dispose();

      const newGeom = new THREE.BufferGeometry();
      newGeom.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
      lineSegments = new THREE.LineSegments(newGeom, lineMaterial);
      networkGroup.add(lineSegments);

      // Rotate network group based on scroll velocity multiplier
      const rotationSpeed = 0.0006 * scrollSpeedMultiplier;
      networkGroup.rotation.y += rotationSpeed;
      networkGroup.rotation.x += rotationSpeed * 0.3;

      // Core pulses size
      const pulse = 1.0 + Math.sin(elapsed * 2.5 * scrollSpeedMultiplier) * 0.12;
      coreMeshes.forEach((mesh) => {
        mesh.scale.set(pulse, pulse, pulse);
      });

      // Update label overlays position
      updateHTMLPositions();

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScrollMultiplier);
      window.removeEventListener("resize", handleResize);
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineMaterial.dispose();
      coreLineMaterial.dispose();
      coreLineGeom.dispose();
      lineSegments.geometry.dispose();
      coreMeshes.forEach((mesh) => mesh.geometry.dispose());
      renderer.dispose();
    };
  }, [scrollSpeedMultiplier]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Absolute Node Tags (HTML overlay) */}
      <div className="absolute inset-0 z-20 select-none">
        {screenNodes.map((node, idx) => {
          // Color specifications
          let glowClass = "border-purple-500/30 text-[#8b5cf6]";
          if (node.name === "Card") glowClass = "border-blue-500/30 text-[#3b82f6]";
          if (node.name === "Device") glowClass = "border-cyan-500/30 text-[#00e5ff]";
          if (node.name === "Transaction") glowClass = "border-red-500/30 text-[#ef4444]";

          return (
            <div
              key={idx}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              <div className={`py-1 px-2.5 rounded bg-black/80 border text-[9px] font-mono font-bold tracking-wider uppercase backdrop-blur-sm ${glowClass}`}>
                {node.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
