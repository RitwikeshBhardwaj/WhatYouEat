import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BURST_TIME = 2.5;
const FLESH_DARK_COUNT = 80;
const FLESH_LIGHT_COUNT = 60;
const SEED_COUNT = 50;
const JUICE_SMALL_COUNT = 150;
const JUICE_LARGE_COUNT = 40;
const GRAVITY = -1.5;

function createWatermelonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a6e32';
  ctx.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 7; i++) {
    const baseX = i * 36 + 5;
    ctx.beginPath();
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 10 + Math.random() * 8;
    for (let y = 0; y <= 512; y += 4) {
      const wx = baseX + Math.sin(y * 0.035 + i * 1.2) * 18 + Math.sin(y * 0.07 + i * 0.5) * 6;
      y === 0 ? ctx.moveTo(wx, y) : ctx.lineTo(wx, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(46, 204, 113, ${0.05 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 512, 2 + Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createDropTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const cx = 32, cy = 34;
  const gradient = ctx.createRadialGradient(27, 27, 0, cx, cy, 30);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.08, 'rgba(255, 80, 80, 0.95)');
  gradient.addColorStop(0.4, 'rgba(230, 30, 30, 0.85)');
  gradient.addColorStop(0.75, 'rgba(190, 15, 15, 0.6)');
  gradient.addColorStop(1, 'rgba(150, 5, 5, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(24, 23, 6, 8, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.ellipse(31, 21, 3, 4, -0.35, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function randomDirection(speed) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return [
    Math.sin(phi) * Math.cos(theta) * (speed + Math.random() * 2.5),
    Math.sin(phi) * Math.sin(theta) * (speed + Math.random() * 2.5),
    Math.cos(phi) * (speed + Math.random() * 2.5),
  ];
}

function prepareFleshData(count, baseSpeed, sizeMin, sizeMax) {
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rotations = new Float32Array(count * 3);
  const rotSpeeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [vx, vy, vz] = randomDirection(baseSpeed);
    velocities[i * 3] = vx;
    velocities[i * 3 + 1] = vy + 0.5;
    velocities[i * 3 + 2] = vz;
    sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
    rotations[i * 3] = Math.random() * Math.PI * 2;
    rotations[i * 3 + 1] = Math.random() * Math.PI * 2;
    rotations[i * 3 + 2] = Math.random() * Math.PI * 2;
    rotSpeeds[i * 3] = (Math.random() - 0.5) * 5;
    rotSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 5;
    rotSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }
  return { velocities, sizes, rotations, rotSpeeds };
}

function prepareSeedData() {
  const velocities = new Float32Array(SEED_COUNT * 3);
  const sizes = new Float32Array(SEED_COUNT);
  const rotations = new Float32Array(SEED_COUNT * 3);
  const rotSpeeds = new Float32Array(SEED_COUNT * 3);
  for (let i = 0; i < SEED_COUNT; i++) {
    const [vx, vy, vz] = randomDirection(3.5);
    velocities[i * 3] = vx;
    velocities[i * 3 + 1] = vy + 0.5;
    velocities[i * 3 + 2] = vz;
    sizes[i] = 0.4 + Math.random() * 0.3;
    rotations[i * 3] = Math.random() * Math.PI * 2;
    rotations[i * 3 + 1] = Math.random() * Math.PI * 2;
    rotations[i * 3 + 2] = Math.random() * Math.PI * 2;
    rotSpeeds[i * 3] = (Math.random() - 0.5) * 6;
    rotSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 6;
    rotSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  return { velocities, sizes, rotations, rotSpeeds };
}

function prepareJuiceData(count, baseSpeed) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [vx, vy, vz] = randomDirection(baseSpeed);
    velocities[i * 3] = vx;
    velocities[i * 3 + 1] = vy + 1;
    velocities[i * 3 + 2] = vz;
    colors[i * 3] = 0.95 + Math.random() * 0.05;
    colors[i * 3 + 1] = 0.05 + Math.random() * 0.15;
    colors[i * 3 + 2] = 0.03 + Math.random() * 0.1;
  }
  return { positions, velocities, colors };
}

function updateFleshGroup(ref, count, data, t, dt, dampFactor) {
  if (!ref.current) return;
  const dummy = new THREE.Object3D();
  const damp = 1 + t * dampFactor;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    dummy.position.set(
      (data.velocities[i3] * dt) / damp,
      (data.velocities[i3 + 1] * dt) / damp + GRAVITY * dt * dt * 0.5,
      (data.velocities[i3 + 2] * dt) / damp,
    );
    dummy.rotation.set(
      data.rotations[i3] + data.rotSpeeds[i3] * t,
      data.rotations[i3 + 1] + data.rotSpeeds[i3 + 1] * t,
      data.rotations[i3 + 2] + data.rotSpeeds[i3 + 2] * t,
    );
    dummy.scale.setScalar(data.sizes[i]);
    dummy.updateMatrix();
    ref.current.setMatrixAt(i, dummy.matrix);
  }
  ref.current.instanceMatrix.needsUpdate = true;
  ref.current.material.opacity = Math.max(0, 1 - (t - 0.5) * 0.15);
}

function updateJuiceGroup(ref, count, data, t, dt) {
  if (!ref.current) return;
  const pos = ref.current.geometry.attributes.position.array;
  const damp = 1 + t * 0.25;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3] = (data.velocities[i3] * dt) / damp;
    pos[i3 + 1] = (data.velocities[i3 + 1] * dt) / damp + GRAVITY * 0.35 * dt * dt * 0.5;
    pos[i3 + 2] = (data.velocities[i3 + 2] * dt) / damp;
  }
  ref.current.geometry.attributes.position.needsUpdate = true;
  ref.current.material.opacity = Math.max(0, 1 - (t - 0.2) * 0.1);
}

function WatermelonBurstScene({ onBurst }) {
  const watermelonRef = useRef();
  const fleshDarkRef = useRef();
  const fleshLightRef = useRef();
  const seedRef = useRef();
  const juiceSmallRef = useRef();
  const juiceLargeRef = useRef();
  const hasBurst = useRef(false);

  const watermelonTexture = useMemo(() => createWatermelonTexture(), []);
  const dropTexture = useMemo(() => createDropTexture(), []);

  const fleshDarkData = useMemo(() => prepareFleshData(FLESH_DARK_COUNT, 2.5, 0.1, 0.16), []);
  const fleshLightData = useMemo(() => prepareFleshData(FLESH_LIGHT_COUNT, 2.8, 0.08, 0.12), []);
  const seedData = useMemo(() => prepareSeedData(), []);
  const juiceSmallData = useMemo(() => prepareJuiceData(JUICE_SMALL_COUNT, 4.5), []);
  const juiceLargeData = useMemo(() => prepareJuiceData(JUICE_LARGE_COUNT, 5.5), []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (watermelonRef.current) {
      if (elapsed < 2) {
        watermelonRef.current.position.y = Math.sin(elapsed * 1.2) * 0.2;
        watermelonRef.current.rotation.y = elapsed * 0.25;
      } else if (elapsed < BURST_TIME) {
        const intensity = (elapsed - 2) / (BURST_TIME - 2);
        watermelonRef.current.position.x = Math.sin(elapsed * 45) * 0.05 * intensity;
        watermelonRef.current.position.y = Math.sin(elapsed * 40) * 0.05 * intensity;
        watermelonRef.current.rotation.z = Math.sin(elapsed * 30) * 0.08 * intensity;
      } else {
        watermelonRef.current.scale.setScalar(Math.max(0, 1 - (elapsed - BURST_TIME) * 5));
      }
    }

    if (elapsed > BURST_TIME && !hasBurst.current) {
      hasBurst.current = true;
      onBurst?.();
    }

    const t = Math.max(0, elapsed - BURST_TIME);
    const dt = Math.min(t, 3);

    updateFleshGroup(fleshDarkRef, FLESH_DARK_COUNT, fleshDarkData, t, dt, 0.5);
    updateFleshGroup(fleshLightRef, FLESH_LIGHT_COUNT, fleshLightData, t, dt, 0.55);

    if (seedRef.current) {
      const dummy = new THREE.Object3D();
      const damp = 1 + t * 0.4;
      for (let i = 0; i < SEED_COUNT; i++) {
        const i3 = i * 3;
        dummy.position.set(
          (seedData.velocities[i3] * dt) / damp,
          (seedData.velocities[i3 + 1] * dt) / damp + GRAVITY * dt * dt * 0.5,
          (seedData.velocities[i3 + 2] * dt) / damp,
        );
        dummy.rotation.set(
          seedData.rotations[i3] + seedData.rotSpeeds[i3] * t,
          seedData.rotations[i3 + 1] + seedData.rotSpeeds[i3 + 1] * t,
          seedData.rotations[i3 + 2] + seedData.rotSpeeds[i3 + 2] * t,
        );
        const s = seedData.sizes[i];
        dummy.scale.set(s * 0.3, s * 0.8, s * 0.3);
        dummy.updateMatrix();
        seedRef.current.setMatrixAt(i, dummy.matrix);
      }
      seedRef.current.instanceMatrix.needsUpdate = true;
      seedRef.current.material.opacity = Math.max(0, 1 - (t - 0.3) * 0.12);
    }

    updateJuiceGroup(juiceSmallRef, JUICE_SMALL_COUNT, juiceSmallData, t, dt);
    updateJuiceGroup(juiceLargeRef, JUICE_LARGE_COUNT, juiceLargeData, t, dt);
  });

  return (
    <group>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 6, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4ade80" />

      <group ref={watermelonRef} position={[0, 0.3, 0]}>
        <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.6, 24]} />
          <meshBasicMaterial color="#000" transparent opacity={0.12} />
        </mesh>
        <mesh scale={[1.2, 0.78, 1]}>
          <sphereGeometry args={[1.3, 48, 48]} />
          <meshPhysicalMaterial map={watermelonTexture} roughness={0.45} metalness={0.05} clearcoat={0.2} clearcoatRoughness={0.3} />
        </mesh>
        <mesh position={[0.25, 0.65, 0.85]} rotation={[0.25, 0.4, 0]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.06} />
        </mesh>
        <mesh position={[0, 1.08, 0]} rotation={[0.5, 0, 0.3]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#3d2b1f" />
        </mesh>
        <mesh position={[0.05, 1.02, 0.05]} rotation={[0.7, 0.6, 0.2]}>
          <cylinderGeometry args={[0.02, 0.035, 0.18, 6]} />
          <meshBasicMaterial color="#4a3728" />
        </mesh>
      </group>

      <instancedMesh ref={fleshDarkRef} args={[null, null, FLESH_DARK_COUNT]}>
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshPhysicalMaterial color="#bb1111" roughness={0.7} transparent opacity={0.95} />
      </instancedMesh>

      <instancedMesh ref={fleshLightRef} args={[null, null, FLESH_LIGHT_COUNT]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshPhysicalMaterial color="#ee4444" roughness={0.65} transparent opacity={0.95} />
      </instancedMesh>

      <instancedMesh ref={seedRef} args={[null, null, SEED_COUNT]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshPhysicalMaterial color="#1a0a05" roughness={0.9} transparent opacity={0.95} />
      </instancedMesh>

      <points ref={juiceSmallRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={JUICE_SMALL_COUNT} array={juiceSmallData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={JUICE_SMALL_COUNT} array={juiceSmallData.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.2} map={dropTexture} vertexColors sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.NormalBlending} />
      </points>

      <points ref={juiceLargeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={JUICE_LARGE_COUNT} array={juiceLargeData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={JUICE_LARGE_COUNT} array={juiceLargeData.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.4} map={dropTexture} vertexColors sizeAttenuation transparent opacity={0.8} depthWrite={false} blending={THREE.NormalBlending} />
      </points>
    </group>
  );
}

function SplatterOverlay({ visible }) {
  const [mounted, setMounted] = useState(false);
  const splats = useMemo(() => [
    { x: '20%', y: '15%', size: '150%', delay: '0s' },
    { x: '50%', y: '25%', size: '120%', delay: '0.12s' },
    { x: '80%', y: '20%', size: '140%', delay: '0.2s' },
    { x: '30%', y: '65%', size: '130%', delay: '0.08s' },
    { x: '70%', y: '60%', size: '110%', delay: '0.18s' },
    { x: '50%', y: '45%', size: '170%', delay: '0.04s' },
    { x: '15%', y: '45%', size: '90%', delay: '0.1s' },
    { x: '85%', y: '40%', size: '100%', delay: '0.15s' },
  ], []);
  const juiceDrops = useMemo(() => {
    const drops = [];
    for (let i = 0; i < 25; i++) drops.push({
      x: 10 + Math.random() * 80, y: 5 + Math.random() * 85,
      size: 3 + Math.random() * 14,
      delay: 0.2 + Math.random() * 0.6,
      r: 200 + Math.random() * 55, g: 10 + Math.random() * 30, b: 10 + Math.random() * 20,
    });
    return drops;
  }, []);

  useEffect(() => {
    if (visible) setMounted(true);
    if (!visible) { const t = setTimeout(() => setMounted(false), 100); return () => clearTimeout(t); }
  }, [visible]);

  if (!mounted && !visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
      {splats.map((s, i) => (
        <div key={i} className="absolute" style={{
          left: s.x, top: s.y, width: s.size, height: s.size,
          marginLeft: `calc(${s.size} * -0.5)`, marginTop: `calc(${s.size} * -0.5)`,
          background: `radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(220,38,38,0.18) 30%, rgba(185,28,28,0.07) 60%, transparent 100%)`,
          animation: `splat ${1.5 + i * 0.1}s ease-out ${s.delay} forwards`,
          transform: 'scale(0)',
        }} />
      ))}
      {juiceDrops.map((d, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${d.x}%`, top: `${d.y}%`, width: `${d.size}px`, height: `${d.size}px`,
          background: `rgb(${d.r}, ${d.g}, ${d.b})`,
          animation: `splat-dot ${0.8 + Math.random() * 0.8}s ease-out ${d.delay}s forwards`,
          transform: 'scale(0)',
        }} />
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={`drip-${i}`} className="absolute rounded-full" style={{
          left: `${15 + Math.random() * 70}%`, top: `${5 + Math.random() * 30}%`,
          width: `${2 + Math.random() * 4}px`, height: `${15 + Math.random() * 40}px`,
          background: `rgba(${200 + Math.random() * 55}, ${10 + Math.random() * 20}, ${10 + Math.random() * 15}, ${0.3 + Math.random() * 0.3})`,
          animation: `juice-drip ${1 + Math.random() * 1.5}s ease-out ${0.5 + Math.random() * 0.5}s forwards`,
          transform: 'scaleY(0)',
        }} />
      ))}
    </div>
  );
}

function MobileFallback({ splashed }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <span className="text-6xl" style={{
        animation: splashed ? 'melon-shake 0.5s ease-out forwards' : 'melon-float 3s ease-in-out infinite',
      }}>🍉</span>
    </div>
  );
}

function ThreeScene({ onBurst }) {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50, near: 0.1, far: 20 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ position: 'absolute', inset: 0 }}>
      <Suspense fallback={null}>
        <WatermelonBurstScene onBurst={onBurst} />
      </Suspense>
    </Canvas>
  );
}

export default function HeroScene({ isMobile }) {
  const [splashed, setSplashed] = useState(false);
  useEffect(() => { setSplashed(false); }, [isMobile]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/60 via-transparent to-surface-950" />
        {isMobile ? <MobileFallback splashed={splashed} /> : (
          <Suspense fallback={null}>
            <ThreeScene onBurst={() => setSplashed(true)} />
          </Suspense>
        )}
      </div>
      <SplatterOverlay visible={splashed} />
    </>
  );
}
