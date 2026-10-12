// Real-time procedural molecule for the hero (Three.js / WebGL).
// Stylised and scientifically inspired, not a specific chemical structure.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export function createMolecule(canvas, { reducedMotion = false } = {}) {
  const lowTier =
    matchMedia('(pointer: coarse)').matches ||
    innerWidth < 860 ||
    (navigator.hardwareConcurrency || 8) <= 4;
  const finePointer = matchMedia('(pointer: fine)').matches;

  let dprCap = lowTier ? 1.25 : 1.5;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowTier, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x090d15, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = lowTier ? 0.5 : 0.75;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const baseCamZ = 12.5;
  camera.position.set(0, 0, baseCamZ);
  scene.add(camera);

  // Backdrop: a camera-locked gradient plane in the page canvas colour, so the
  // glass has something to refract and the canvas edges blend into the page.
  const backdropTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#090D15'; g.fillRect(0, 0, 512, 512);
    const grd = g.createRadialGradient(290, 230, 0, 256, 256, 250);
    grd.addColorStop(0, '#34497A'); grd.addColorStop(0.3, '#1E2C4D'); grd.addColorStop(0.7, '#0E1424'); grd.addColorStop(1, '#090D15');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
    const v = g.createRadialGradient(150, 380, 0, 150, 380, 140);
    v.addColorStop(0, 'rgba(182,155,242,.16)'); v.addColorStop(1, 'rgba(182,155,242,0)');
    g.fillStyle = v; g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const backdropMat = new THREE.MeshBasicMaterial({ map: backdropTex, toneMapped: false, depthWrite: false });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backdropMat);
  const backdropDist = 40;
  backdrop.position.z = -backdropDist;
  backdrop.renderOrder = -1;
  camera.add(backdrop);

  // Lights: cool key, violet rim
  const key = new THREE.PointLight(0xa6bfff, 40, 30); key.position.set(4, 3, 5); scene.add(key);
  const rim = new THREE.PointLight(0xb69bf2, 35, 30); rim.position.set(-5, -2, -3); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x22304a, 0.6));

  const seg = lowTier ? 48 : 96;
  const molecule = new THREE.Group();
  scene.add(molecule);

  // Glass nucleus with a glowing core visible through refraction
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xeef2ff, metalness: 0, roughness: 0.12,
    transmission: 1, thickness: 0.9, ior: 1.42, dispersion: 0.25,
    attenuationColor: new THREE.Color(0xa6bfff), attenuationDistance: 3,
    iridescence: 0.45, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 480],
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2,
  });
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(1.25, seg, seg), glass);
  molecule.add(nucleus);

  const coreMat = new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x8fa9ff, emissiveIntensity: 1.6, roughness: 0.4 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, lowTier ? 2 : 4), coreMat);
  molecule.add(core);
  const core2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0xb69bf2, emissiveIntensity: 2 }));
  core2.position.set(0.5, 0.35, 0.2);
  molecule.add(core2);

  const pearl = new THREE.MeshPhysicalMaterial({
    color: 0xb9c8ff, metalness: 0.15, roughness: 0.22,
    iridescence: 0.8, iridescenceIOR: 1.4, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.6, sheenColor: new THREE.Color(0xb69bf2),
  });
  const violetGlass = glass.clone();
  violetGlass.color = new THREE.Color(0xf1ebff);
  violetGlass.attenuationColor = new THREE.Color(0xd9c9ff);
  violetGlass.attenuationDistance = 1.5;
  violetGlass.thickness = 0.45;
  violetGlass.emissive = new THREE.Color(0x3a2d66);
  violetGlass.emissiveIntensity = 0.35;
  const bondMat = new THREE.MeshPhysicalMaterial({ color: 0xc9d6ff, metalness: 0.35, roughness: 0.28, clearcoat: 0.6 });

  const satellites = [
    { pos: [2.35, 1.15, 0.4], r: 0.55, mat: violetGlass },
    { pos: [-2.1, 1.45, -0.6], r: 0.45, mat: pearl },
    { pos: [-1.55, -1.95, 0.7], r: 0.6, mat: violetGlass },
    { pos: [1.6, -1.85, -0.9], r: 0.4, mat: pearl },
  ];
  const sphereGeo = new THREE.SphereGeometry(1, seg / 2, seg / 2);
  const up = new THREE.Vector3(0, 1, 0);
  const satMeshes = [];

  function bond(a, b, rA, rB, radius = 0.075) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    dir.normalize();
    const start = a.clone().addScaledVector(dir, rA * 0.85);
    const end = b.clone().addScaledVector(dir, -rB * 0.85);
    const l = start.distanceTo(end);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, l, 20, 1), bondMat);
    m.position.copy(start).add(end).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, dir);
    return len > 0 ? m : null;
  }

  const origin = new THREE.Vector3();
  satellites.forEach((s) => {
    const p = new THREE.Vector3(...s.pos);
    const mesh = new THREE.Mesh(sphereGeo, s.mat);
    mesh.scale.setScalar(s.r);
    mesh.position.copy(p);
    molecule.add(mesh);
    satMeshes.push(mesh);
    molecule.add(bond(origin, p, 1.25, s.r));
  });
  // A small secondary atom bonded to the first satellite
  const tipPos = new THREE.Vector3(3.35, 2.15, 0.1);
  const tip = new THREE.Mesh(sphereGeo, pearl);
  tip.scale.setScalar(0.24);
  tip.position.copy(tipPos);
  molecule.add(tip);
  molecule.add(bond(new THREE.Vector3(...satellites[0].pos), tipPos, 0.55, 0.24, 0.05));

  molecule.rotation.set(0.12, -0.35, 0.05);
  molecule.position.x = -0.35;

  // Supporting particles
  const count = lowTier ? 140 : 380;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3.2 + Math.random() * 3.5;
    const t = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(ph) * Math.cos(t);
    positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(ph) * 0.6 - 1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(200,214,255,.6)'); grd.addColorStop(1, 'rgba(166,191,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const pMat = new THREE.PointsMaterial({ size: 0.07, map: sprite, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // State
  let progress = 0; // 0 = hero in view, 1 = hero scrolled away
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const clock = new THREE.Clock();
  let running = false, visible = true, rafId = 0;
  const DEG = Math.PI / 180;

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const bh = 2 * backdropDist * Math.tan((camera.fov * Math.PI) / 360);
    backdrop.scale.set(bh * camera.aspect, bh, 1);
    if (!running) renderFrame(0);
  }

  function renderFrame(t) {
    // Breathing: 13s cycle
    const breathe = reducedMotion ? 0 : Math.sin((t / 13) * Math.PI * 2);
    const s = 0.84 * (1 + breathe * 0.025) * (1 - progress * 0.18);
    molecule.scale.setScalar(s);
    if (!reducedMotion) {
      molecule.rotation.y = -0.35 + Math.sin((t / 22) * Math.PI * 2) * 0.14;
      molecule.rotation.x = 0.12 + Math.sin((t / 17) * Math.PI * 2) * 0.05;
      core.rotation.y = t * 0.25;
      particles.rotation.y = t * 0.012;
      satMeshes.forEach((m, i) => { m.position.y = satellites[i].pos[1] + Math.sin(t * 0.6 + i) * 0.04; });
    }
    // Camera drift <= 3 degrees, plus low-amplitude pointer parallax
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const yaw = (reducedMotion ? 0 : Math.sin((t / 16) * Math.PI * 2) * 2 * DEG) + pointer.x * 1 * DEG;
    const pitch = (reducedMotion ? 0 : Math.cos((t / 14) * Math.PI * 2) * 1 * DEG) + pointer.y * 0.8 * DEG;
    const dist = baseCamZ + progress * 3.2;
    camera.position.set(Math.sin(yaw) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * dist);
    camera.lookAt(0, 0, 0);

    const dim = 1 - progress * 0.6;
    scene.environmentIntensity = dim;
    key.intensity = 40 * dim; rim.intensity = 35 * dim;
    coreMat.emissiveIntensity = 1.6 * dim;
    pMat.opacity = 0.7 * Math.max(0, 1 - progress * 1.6);
    renderer.render(scene, camera);
  }

  // Frame-time guard: drop resolution if the device struggles
  let samples = 0, acc = 0, degraded = false;
  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    const dt = clock.getDelta();
    if (!degraded && samples < 90) {
      acc += dt; samples++;
      if (samples === 90 && acc / samples > 1 / 40) { degraded = true; dprCap = 1; resize(); }
    }
    renderFrame(clock.elapsedTime);
  }

  function start() {
    if (running || reducedMotion || !visible || document.hidden) return;
    running = true; clock.getDelta(); loop();
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { rootMargin: '100px' });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new ResizeObserver(resize).observe(canvas);

  if (finePointer && !reducedMotion) {
    addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / innerHeight) * 2 - 1);
    }, { passive: true });
  }

  resize();
  renderFrame(0);
  start();

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      if (!running) renderFrame(clock.elapsedTime);
    },
    renderer,
  };
}
