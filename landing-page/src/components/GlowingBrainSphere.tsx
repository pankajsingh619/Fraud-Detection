"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface OrbitNode {
  name: string;
  angle: number; // in radians
  distance: number; // in pixels (for CSS overlay)
  color: string;
  desc: string;
}

export default function GlowingBrainSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes: OrbitNode[] = [
    { name: "Stacking ML", angle: 0, distance: 180, color: "text-[#3b82f6]", desc: "Logistic Regression ensembling base GBDT models." },
    { name: "SHAP Explainability", angle: Math.PI / 4, distance: 180, color: "text-[#00e5ff]", desc: "Local attribution logs explaining log-odds push." },
    { name: "Isolation Forest", angle: Math.PI / 2, distance: 180, color: "text-[#3b82f6]", desc: "Unsupervised anomaly score calculation." },
    { name: "Hybrid RAG", angle: (3 * Math.PI) / 4, distance: 180, color: "text-[#8b5cf6]", desc: "Sparse keyword matching plus concept alignment." },
    { name: "Compliance Engine", angle: Math.PI, distance: 180, color: "text-[#22c55e]", desc: "Anoop/SOP guidelines verification." },
    { name: "Multi-Agent Review", angle: (5 * Math.PI) / 4, distance: 180, color: "text-[#8b5cf6]", desc: "Collaborative case investigation matrix." },
    { name: "Neo4j Graph Database", angle: (3 * Math.PI) / 2, distance: 180, color: "text-[#3b82f6]", desc: "Entity linkage for tracking ATO clusters." },
    { name: "Analytics Dashboard", angle: (7 * Math.PI) / 4, distance: 180, color: "text-[#00e5ff]", desc: "Live multi-tab transaction monitor workspace." }
  ];

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = 500;
    const height = 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Glowing Core (Icosahedron wireframe)
    const coreGeometry = new THREE.IcosahedronGeometry(3.5, 2);
    
    // Core shader-like glowing wireframe material
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Inner glowing sphere
    const innerGeom = new THREE.SphereGeometry(2.8, 16, 16);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMaterial);
    scene.add(innerCore);

    // Particle shell around the core
    const particleGeom = new THREE.BufferGeometry();
    const particleCount = 150;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.6 + Math.random() * 0.4; // Shell radius
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particleShell = new THREE.Points(particleGeom, particleMat);
    scene.add(particleShell);

    // Orbit Paths (Rings)
    const ringMaterials = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.1,
    });
    const ringGeoms: THREE.Line[] = [];
    const numRings = 3;
    for (let i = 0; i < numRings; i++) {
      const radius = 5.0 + i * 1.2;
      const ringGeom = new THREE.BufferGeometry();
      const ringPoints: number[] = [];
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        ringPoints.push(radius * Math.cos(theta), 0, radius * Math.sin(theta));
      }
      ringGeom.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints, 3));
      const ring = new THREE.Line(ringGeom, ringMaterials);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      scene.add(ring);
      ringGeoms.push(ring);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Pulse effect
      const pulseScale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.07;
      core.scale.set(pulseScale, pulseScale, pulseScale);
      innerCore.scale.set(pulseScale, pulseScale, pulseScale);

      // Rotate core elements
      core.rotation.y += 0.005;
      core.rotation.x += 0.002;
      innerCore.rotation.y -= 0.003;
      particleShell.rotation.y -= 0.004;

      // Rotate orbit rings
      ringGeoms.forEach((ring, idx) => {
        ring.rotation.y += 0.001 * (idx + 1);
        ring.rotation.x += 0.0005 * (idx + 1);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeom.dispose();
      innerMaterial.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      ringMaterials.dispose();
      ringGeoms.forEach(ring => ring.geometry.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-[500px] h-[500px] absolute z-10" />

      {/* Center Label (Core) */}
      <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase">GuardianEye</span>
        <span className="text-sm font-bold text-[#f8fafc] tracking-wider uppercase">CORE</span>
      </div>

      {/* Orbit nodes (HTML Overlay) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {nodes.map((node, idx) => {
          const x = 250 + node.distance * Math.cos(node.angle) - 60; // offset center & half element width
          const y = 250 + node.distance * Math.sin(node.angle) - 20; // offset center & half element height

          return (
            <div
              key={idx}
              className="absolute w-[120px] pointer-events-auto"
              style={{ left: `${x}px`, top: `${y}px` }}
              onMouseEnter={() => setActiveNode(node.name)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div
                className={`text-center py-1.5 px-2 rounded-lg glass-panel text-[11px] font-semibold transition-all duration-300 cursor-pointer ${
                  activeNode === node.name
                    ? "border-glow-blue border-[#3b82f6]/40 scale-105"
                    : "border-transparent"
                }`}
              >
                <span className={node.color}>{node.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Info Tooltip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[80%] min-h-[50px] pointer-events-none text-center">
        {activeNode ? (
          <div className="py-2 px-4 rounded-lg glass-panel border-[#8b5cf6]/30 text-xs text-[#cbd5e1] animate-fade-in transition-all duration-300">
            <span className="font-semibold text-[#f8fafc] block mb-1">{activeNode}</span>
            {nodes.find(n => n.name === activeNode)?.desc}
          </div>
        ) : (
          <div className="text-[10px] text-[#94a3b8] font-mono tracking-wider animate-pulse">
            [ HOVER A CORE NODE TO AUDIT SUB-ENGINE ]
          </div>
        )}
      </div>
    </div>
  );
}
