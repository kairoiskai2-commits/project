import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Maximize2, Minimize2, ChevronLeft, ChevronRight, Info, X,
  Eye, Sparkles, Play, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  RotateCcw, MousePointer2, Keyboard
} from 'lucide-react';

/* ─────────────────────────────────────────────
   3D ARTIFACT SHAPES
───────────────────────────────────────────── */
function Artifact3D({ shape, color, rotationSpeed = 0.005, size = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  const mat = <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />;
  if (shape === 'pyramid') return (
    <group ref={meshRef}>
      <mesh><coneGeometry args={[size * 0.7, size * 1.2, 4]} />{mat}</mesh>
      <mesh position={[0, -size * 0.6, 0]}><boxGeometry args={[size * 1.4, size * 0.05, size * 1.4]} />{mat}</mesh>
    </group>
  );
  if (shape === 'obelisk') return (
    <group ref={meshRef}>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[size * 0.1, size * 0.18, size * 1.6, 4]} />{mat}</mesh>
      <mesh position={[0, size * 1.1, 0]}><coneGeometry args={[size * 0.12, size * 0.3, 4]} />{mat}</mesh>
    </group>
  );
  if (shape === 'sphinx') return (
    <group ref={meshRef}>
      <mesh><boxGeometry args={[size * 1.4, size * 0.6, size * 0.7]} />{mat}</mesh>
      <mesh position={[size * 0.6, size * 0.5, 0]}><sphereGeometry args={[size * 0.35, 16, 16]} />{mat}</mesh>
    </group>
  );
  if (shape === 'ankh') return (
    <group ref={meshRef}>
      <mesh position={[0, -size * 0.2, 0]}><cylinderGeometry args={[size * 0.06, size * 0.06, size * 1.1, 8]} />{mat}</mesh>
      <mesh position={[0, size * 0.38, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.6, 8]} />{mat}</mesh>
      <mesh position={[0, size * 0.65, 0]}><torusGeometry args={[size * 0.2, size * 0.06, 8, 24]} />{mat}</mesh>
    </group>
  );
  if (shape === 'scarab') return (
    <group ref={meshRef}>
      <mesh><sphereGeometry args={[size * 0.5, 16, 16]} />{mat}</mesh>
      <mesh position={[0, size * 0.2, 0]} scale={[1.2, 0.4, 0.8]}><sphereGeometry args={[size * 0.4, 12, 12]} />{mat}</mesh>
    </group>
  );
  return <mesh ref={meshRef}><dodecahedronGeometry args={[size * 0.6, 0]} />{mat}</mesh>;
}

/* ─────────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────────── */
function Particles({ count = 120 }) {
  const pts = useRef();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 30;
  useFrame((s) => { if (pts.current) pts.current.rotation.y = s.clock.elapsedTime * 0.015; });
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#f0c060" transparent opacity={0.4} />
    </points>
  );
}

/* ─────────────────────────────────────────────
   MUSEUM HALL GEOMETRY
───────────────────────────────────────────── */
function MuseumHall() {
  const floorMat = <meshStandardMaterial color="#1a1208" metalness={0.6} roughness={0.4} />;
  const wallMat = <meshStandardMaterial color="#0d0a06" metalness={0.3} roughness={0.7} />;
  const pillarMat = <meshStandardMaterial color="#2a1e0a" metalness={0.7} roughness={0.3} />;
  const ceilMat = <meshStandardMaterial color="#0a0805" metalness={0.2} roughness={0.9} />;

  const pillars = [-8, -4, 0, 4, 8];

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[40, 60]} />{floorMat}
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[40, 60]} />{ceilMat}
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 3, -28]}>
        <boxGeometry args={[40, 12, 0.3]} />{wallMat}
      </mesh>
      {/* Side walls */}
      <mesh position={[-18, 3, 0]}>
        <boxGeometry args={[0.3, 12, 60]} />{wallMat}
      </mesh>
      <mesh position={[18, 3, 0]}>
        <boxGeometry args={[0.3, 12, 60]} />{wallMat}
      </mesh>
      {/* Pillars */}
      {pillars.map((z, i) => (
        <React.Fragment key={i}>
          <mesh position={[-12, 2, z]}>
            <cylinderGeometry args={[0.4, 0.5, 8, 8]} />{pillarMat}
          </mesh>
          <mesh position={[12, 2, z]}>
            <cylinderGeometry args={[0.4, 0.5, 8, 8]} />{pillarMat}
          </mesh>
        </React.Fragment>
      ))}
      {/* Gold floor trim lines */}
      {[-8, 8].map((x, i) => (
        <mesh key={i} position={[x, -1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 60]} />
          <meshBasicMaterial color="#c9963a" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Gold ceiling border */}
      <mesh position={[0, 7.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 60]} />
        <meshBasicMaterial color="#c9963a" transparent opacity={0.02} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   ARTIFACT PEDESTAL IN SCENE
───────────────────────────────────────────── */
function ArtifactStation({ artifact, position, isActive, onClick }) {
  const groupRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.intensity = isActive
        ? 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5
        : 0.8 + Math.sin(state.clock.elapsedTime * 1.5 + position[2]) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pedestal base */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 0.3, 16]} />
        <meshStandardMaterial color="#2a1e0a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.3, 16]} />
        <meshStandardMaterial color="#3a2e1a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, -1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.02, 8, 32]} />
        <meshBasicMaterial color={artifact.color} transparent opacity={isActive ? 0.9 : 0.4} />
      </mesh>
      {/* Artifact */}
      <Artifact3D shape={artifact.shape} color={artifact.color} size={isActive ? 0.9 : 0.7} rotationSpeed={isActive ? 0.012 : 0.006} />
      {/* Spotlight */}
      <pointLight ref={glowRef} position={[0, 2, 0]} color={artifact.color} intensity={1} distance={4} />
    </group>
  );
}

/* ─────────────────────────────────────────────
   FIRST-PERSON WALK CONTROLLER
───────────────────────────────────────────── */
function WalkController({ walkMode }) {
  const { camera } = useThree();
  const keys = useRef({});
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!walkMode) return;
    camera.position.set(0, 0.5, 12);
    camera.rotation.set(0, 0, 0);
    yaw.current = 0;
    pitch.current = 0;
  }, [walkMode, camera]);

  useEffect(() => {
    if (!walkMode) return;
    const onKey = (e) => { keys.current[e.code] = e.type === 'keydown'; };
    const onMouseDown = (e) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.003;
      pitch.current = Math.max(-0.8, Math.min(0.8, pitch.current - dy * 0.003));
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [walkMode]);

  useFrame(() => {
    if (!walkMode) return;
    const speed = 0.06;
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    if (keys.current['KeyW'] || keys.current['ArrowUp']) camera.position.addScaledVector(forward, speed);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) camera.position.addScaledVector(forward, -speed);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) camera.position.addScaledVector(right, -speed);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) camera.position.addScaledVector(right, speed);

    // Clamp bounds
    camera.position.x = Math.max(-15, Math.min(15, camera.position.x));
    camera.position.y = 0.5;
    camera.position.z = Math.max(-25, Math.min(14, camera.position.z));

    // Apply rotation
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
  });

  return null;
}

/* ─────────────────────────────────────────────
   MUSEUM ROOM SCENE
───────────────────────────────────────────── */
function MuseumRoom({ exhibits, activeIdx, setActiveIdx, walkMode }) {
  const positions = [
    [0, 0, -20],
    [-6, 0, -14],
    [6, 0, -14],
    [-6, 0, -7],
    [6, 0, -7],
  ];

  return (
    <>
      <ambientLight intensity={0.2} color="#c9963a" />
      <pointLight position={[0, 6, -14]} intensity={2} color="#f0c060" distance={20} />
      <pointLight position={[0, 6, -7]} intensity={1.5} color="#a855f7" distance={15} />
      <pointLight position={[0, 6, 0]} intensity={1} color="#60a5fa" distance={12} />
      <fog attach="fog" args={['#050402', 15, 40]} />
      <Particles />
      <MuseumHall />
      {exhibits.map((ex, i) => (
        <ArtifactStation
          key={ex.id}
          artifact={ex}
          position={positions[i] || [0, 0, -20 - i * 6]}
          isActive={i === activeIdx}
          onClick={() => setActiveIdx(i)}
        />
      ))}
      <WalkController walkMode={walkMode} />
    </>
  );
}

/* ─────────────────────────────────────────────
   ARTIFACT DATA
───────────────────────────────────────────── */
const EXHIBITS = [
  {
    id: 1, name: 'الهرم الأكبر', name_en: 'Great Pyramid',
    shape: 'pyramid', color: '#c9963a', size: 1.2,
    era: '2560 قبل الميلاد', material: 'حجر الجير',
    description: 'أحد عجائب الدنيا السبع وأكثرها حفظاً من الزمن. بُني خلال عهد الفرعون خوفو ويبلغ ارتفاعه الأصلي 146 متراً.',
    fact: 'يحتوي الهرم على 2.3 مليون كتلة حجرية، وزن كل منها ما بين 2.5 و15 طناً.',
    location: 'الجيزة', glow: 'rgba(201,150,58,0.5)',
  },
  {
    id: 2, name: 'المسلة', name_en: 'Obelisk',
    shape: 'obelisk', color: '#f97316', size: 1.3,
    era: '1450 قبل الميلاد', material: 'الجرانيت الأسواني',
    description: 'رمز للشمس وقوة الفراعنة. كانت تُنصب أمام المعابد وتُغطى قممها بالإلكتروم.',
    fact: 'تم نقل العديد من المسلات المصرية إلى روما ولندن وباريس ونيويورك.',
    location: 'الأقصر', glow: 'rgba(249,115,22,0.5)',
  },
  {
    id: 3, name: 'أبو الهول', name_en: 'The Sphinx',
    shape: 'sphinx', color: '#a16207', size: 1.1,
    era: '2500 قبل الميلاد', material: 'حجر الجير المحلي',
    description: 'التمثال الأكبر في التاريخ القديم. يمثل جسم أسد ورأس إنسان.',
    fact: 'طول أبو الهول 73 متراً وارتفاعه 20 متراً.',
    location: 'الجيزة', glow: 'rgba(161,98,7,0.5)',
  },
  {
    id: 4, name: 'عنخ الحياة', name_en: 'Ankh of Life',
    shape: 'ankh', color: '#34d399', size: 1.0,
    era: '3000 قبل الميلاد', material: 'الذهب والفيروز',
    description: 'رمز الحياة الأبدية عند المصريين القدماء. حمله الآلهة والفراعنة دلالة على الخلود.',
    fact: 'العنخ من أقدم الرموز الدينية في تاريخ البشرية ولا يزال يُستخدم حتى اليوم.',
    location: 'المتحف المصري', glow: 'rgba(52,211,153,0.5)',
  },
  {
    id: 5, name: 'الجعران المقدس', name_en: 'Sacred Scarab',
    shape: 'scarab', color: '#a855f7', size: 0.9,
    era: '2000 قبل الميلاد', material: 'اللازورد والذهب',
    description: 'رمز الإعادة والتجديد. كان المصريون يعتقدون أن الجعران يجسد إله الشمس خبري.',
    fact: 'وُجدت آلاف الجعارين في المقابر المصرية كتمائم للحماية وضمان البعث.',
    location: 'متحف اللوفر - باريس', glow: 'rgba(168,85,247,0.5)',
  },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Museum3D() {
  const [current, setCurrent] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [walkMode, setWalkMode] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const artifact = EXHIBITS[current];

  const next = () => setCurrent(i => (i + 1) % EXHIBITS.length);
  const prev = () => setCurrent(i => (i - 1 + EXHIBITS.length) % EXHIBITS.length);

  useEffect(() => {
    if (!autoRotate || walkMode) return;
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [autoRotate, walkMode]);

  const enterWalk = () => {
    setWalkMode(true);
    setShowControls(true);
    setTimeout(() => setShowControls(false), 4000);
  };

  const exitWalk = () => {
    setWalkMode(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase mb-1">// IMMERSIVE 3D MUSEUM</p>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-100 mb-2">المتحف المصري الافتراضي</h1>
        <p className="text-stone-500 text-sm font-mono">جول داخل المتحف · شاهد القطع الأثرية بالأبعاد الثلاثة</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex justify-center gap-3 mb-6">
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setWalkMode(false); setAutoRotate(true); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${!walkMode ? 'text-stone-900' : 'text-stone-400'}`}
          style={!walkMode ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 20px rgba(201,150,58,0.4)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,150,58,0.2)' }}>
          <Eye className="w-4 h-4" /> عرض القطع
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={enterWalk}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${walkMode ? 'text-stone-900' : 'text-stone-400'}`}
          style={walkMode ? { background: 'linear-gradient(135deg,#a855f7,#6b21a8)', boxShadow: '0 0 20px rgba(168,85,247,0.4)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,150,58,0.2)' }}>
          <MousePointer2 className="w-4 h-4" /> جول في المتحف
        </motion.button>
      </div>

      <div className={`grid ${walkMode ? '' : 'lg:grid-cols-3'} gap-6`}>

        {/* Main 3D Canvas */}
        <div className={`${fullscreen ? 'fixed inset-0 z-50' : walkMode ? 'w-full' : 'lg:col-span-2'} relative`}>
          <div
            className={`${fullscreen ? 'h-full' : walkMode ? 'h-[70vh]' : 'h-[480px] sm:h-[580px]'} rounded-2xl overflow-hidden relative`}
            style={{ background: 'radial-gradient(ellipse at center, rgba(10,8,6,0.98) 0%, rgb(5,3,8) 100%)', border: '1px solid rgba(201,150,58,0.2)' }}>

            {/* Gold glow */}
            {!walkMode && (
              <div className="absolute inset-0 pointer-events-none z-10"
                style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${artifact.glow} 0%, transparent 60%)`, opacity: 0.12 }} />
            )}

            {/* Top controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {!walkMode && (
                <button onClick={() => setAutoRotate(v => !v)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-[#f0c060] transition-all"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)' }}>
                  {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              {!walkMode && (
                <button onClick={() => setShowInfo(v => !v)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all`}
                  style={showInfo ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)', color: '#1a1208' } : { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)', color: '#a8a29e' }}>
                  <Info className="w-4 h-4" />
                </button>
              )}
              {walkMode && (
                <button onClick={exitWalk}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white transition-all"
                  style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.25)' }}>
                  <X className="w-3.5 h-3.5" /> خروج
                </button>
              )}
              <button onClick={() => setFullscreen(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-[#f0c060] transition-all"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)' }}>
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Walk mode instructions */}
            <AnimatePresence>
              {walkMode && showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 text-center"
                  style={{ pointerEvents: 'none' }}>
                  <div className="px-5 py-3 rounded-2xl text-xs"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,150,58,0.25)' }}>
                    <p className="text-[#f0c060] font-bold mb-1.5 flex items-center gap-2 justify-center">
                      <Keyboard className="w-3.5 h-3.5" /> أزرار التنقل
                    </p>
                    <div className="flex gap-4 text-stone-400">
                      <span>W/↑ تقدم</span>
                      <span>S/↓ تأخر</span>
                      <span>A/← يسار</span>
                      <span>D/→ يمين</span>
                    </div>
                    <p className="text-stone-500 mt-1">اسحب الماوس للنظر حولك</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Walk mode mini-map */}
            {walkMode && (
              <div className="absolute bottom-4 left-4 z-20"
                style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)', borderRadius: '12px', padding: '8px' }}>
                <p className="text-[#c9963a] text-[9px] font-mono uppercase tracking-widest mb-1">// خريطة</p>
                <div className="w-24 h-32 relative bg-stone-950 rounded-lg overflow-hidden">
                  {EXHIBITS.map((ex, i) => {
                    const positions = [[50, 10], [20, 30], [80, 30], [20, 55], [80, 55]];
                    const pos = positions[i] || [50, 50];
                    return (
                      <div key={ex.id}
                        className="absolute w-3 h-3 rounded-full cursor-pointer transition-all"
                        style={{ left: `${pos[0]}%`, top: `${pos[1]}%`, transform: 'translate(-50%,-50%)', background: ex.color, boxShadow: i === current ? `0 0 8px ${ex.color}` : 'none', opacity: i === current ? 1 : 0.5 }}
                        onClick={() => setCurrent(i)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Artifact name (non-walk) */}
            {!walkMode && (
              <>
                <button onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-[#f0c060] transition-all"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)' }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-stone-300 hover:text-[#f0c060] transition-all"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)' }}>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-center">
                  <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,150,58,0.2)' }}>
                    <p className="text-[#f0c060] font-black text-base">{artifact.name}</p>
                    <p className="text-stone-500 text-[10px] font-mono">{artifact.name_en} · {artifact.era}</p>
                  </div>
                </div>
              </>
            )}

            {/* 3D Canvas */}
            <Canvas
              camera={walkMode ? { position: [0, 0.5, 12], fov: 75 } : { position: [0, 0.5, 3.5], fov: 45 }}
              shadows
              gl={{ antialias: true, alpha: false }}
            >
              <Suspense fallback={null}>
                {walkMode ? (
                  <MuseumRoom exhibits={EXHIBITS} activeIdx={current} setActiveIdx={setCurrent} walkMode={walkMode} />
                ) : (
                  <>
                    <ambientLight intensity={0.35} />
                    <pointLight position={[3, 3, 3]} intensity={2.5} color="#f0c060" />
                    <pointLight position={[-3, 2, -2]} intensity={1.2} color="#a855f7" />
                    <pointLight position={[0, -2, 2]} intensity={0.6} color="#60a5fa" />
                    <Particles count={60} />
                    <Artifact3D shape={artifact.shape} color={artifact.color} rotationSpeed={0.008} size={artifact.size || 1} />
                    {/* Pedestal */}
                    <mesh position={[0, -1.2, 0]}>
                      <cylinderGeometry args={[0.5, 0.6, 0.15, 16]} />
                      <meshStandardMaterial color="#3a2e1a" metalness={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[0.5, 0.02, 8, 32]} />
                      <meshBasicMaterial color="#c9963a" />
                    </mesh>
                  </>
                )}
              </Suspense>
            </Canvas>

            {/* Info overlay */}
            <AnimatePresence>
              {showInfo && !walkMode && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="absolute inset-y-0 right-0 w-64 p-5 z-30 overflow-y-auto"
                  style={{ background: 'rgba(6,4,2,0.97)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(201,150,58,0.2)' }}>
                  <h3 className="text-[#f0c060] font-black text-lg mb-1">{artifact.name}</h3>
                  <p className="text-stone-500 text-xs font-mono mb-4">{artifact.name_en}</p>
                  <div className="space-y-3">
                    {[['التاريخ', artifact.era], ['المادة', artifact.material], ['الموقع', artifact.location]].map(([lbl, val]) => (
                      <div key={lbl} className="p-3 rounded-xl" style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.15)' }}>
                        <p className="text-stone-500 text-[10px] font-mono uppercase mb-1">// {lbl}</p>
                        <p className="text-stone-200 text-sm font-bold">{val}</p>
                      </div>
                    ))}
                    <p className="text-stone-300 text-xs leading-relaxed">{artifact.description}</p>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                      <p className="text-purple-300 text-[10px] font-mono uppercase mb-1">// حقيقة مثيرة</p>
                      <p className="text-stone-300 text-xs leading-relaxed">{artifact.fact}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          {!walkMode && (
            <div className="flex justify-center gap-2 mt-4">
              {EXHIBITS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2' : 'w-2 h-2 hover:bg-stone-500'}`}
                  style={i === current ? { background: 'linear-gradient(90deg,#c9963a,#f0c060)' } : { background: 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!walkMode && (
          <div className="space-y-3">
            <p className="text-stone-500 text-xs font-mono tracking-widest uppercase mb-2">// EXHIBIT COLLECTION</p>
            {EXHIBITS.map((ex, i) => (
              <motion.button key={ex.id} onClick={() => setCurrent(i)} whileHover={{ x: -4 }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left"
                style={i === current
                  ? { background: `${ex.color}15`, border: `1px solid ${ex.color}50`, boxShadow: `0 0 20px ${ex.glow}` }
                  : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,150,58,0.1)' }}>
                <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                  <Canvas camera={{ position: [0, 0, 3] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[2, 2, 2]} intensity={2} color={ex.color} />
                    <Artifact3D shape={ex.shape} color={ex.color} size={0.7} rotationSpeed={0.01} />
                  </Canvas>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm ${i === current ? 'text-[#f0c060]' : 'text-stone-300'}`}>{ex.name}</p>
                  <p className="text-stone-600 text-[10px] font-mono">{ex.era}</p>
                  <p className="text-stone-500 text-[10px] font-mono">{ex.location}</p>
                </div>
                {i === current && <Eye className="w-4 h-4 text-[#f0c060] flex-shrink-0" />}
              </motion.button>
            ))}

            <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-stone-300 font-bold text-sm">وضع الجولة الافتراضية</p>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed mb-3">
                اضغط "جول في المتحف" للمشي فعلياً داخل القاعة ثلاثية الأبعاد واستكشاف كل القطع!
              </p>
              <button onClick={enterWalk}
                className="w-full py-2 rounded-xl text-xs font-bold text-stone-900 transition-all"
                style={{ background: 'linear-gradient(135deg,#a855f7,#6b21a8)', boxShadow: '0 0 12px rgba(168,85,247,0.4)' }}>
                ادخل المتحف →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Walk mode artifact selector */}
      {walkMode && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {EXHIBITS.map((ex, i) => (
            <motion.button key={ex.id} onClick={() => setCurrent(i)} whileHover={{ y: -2 }}
              className="p-3 rounded-xl transition-all text-center"
              style={i === current
                ? { background: `${ex.color}20`, border: `1px solid ${ex.color}60`, boxShadow: `0 0 12px ${ex.glow}` }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,150,58,0.1)' }}>
              <p className={`text-xs font-bold ${i === current ? 'text-[#f0c060]' : 'text-stone-400'}`}>{ex.name}</p>
              <p className="text-stone-600 text-[9px] font-mono mt-0.5">{ex.era}</p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Timeline */}
      {!walkMode && (
        <div className="mt-12">
          <p className="text-stone-500 text-xs font-mono tracking-widest uppercase mb-6 text-center">// TIMELINE OF ANCIENT EGYPT</p>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,150,58,0.4), transparent)' }} />
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                { year: '3100 قبل الميلاد', event: 'توحيد مصر العليا والسفلى', color: '#c9963a' },
                { year: '2560 قبل الميلاد', event: 'بناء هرم خوفو بالجيزة', color: '#f97316' },
                { year: '1350 قبل الميلاد', event: 'عهد توت عنخ آمون', color: '#a855f7' },
                { year: '332 قبل الميلاد', event: 'فتح الإسكندر الأكبر لمصر', color: '#60a5fa' },
                { year: '30 قبل الميلاد', event: 'انتهاء عهد كليوباترا السابعة', color: '#34d399' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {i % 2 === 0 ? (
                    <>
                      <div className="max-w-[200px] p-3 rounded-xl text-right" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                        <p className="font-black text-xs" style={{ color: item.color }}>{item.year}</p>
                        <p className="text-stone-300 text-xs mt-0.5">{item.event}</p>
                      </div>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <div className="max-w-[200px] p-3 rounded-xl text-left" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                        <p className="font-black text-xs" style={{ color: item.color }}>{item.year}</p>
                        <p className="text-stone-300 text-xs mt-0.5">{item.event}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}