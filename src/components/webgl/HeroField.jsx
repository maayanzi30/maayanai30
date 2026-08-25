import * as THREE from 'three'
import { useGLStage } from '../../lib/useGLStage.js'
import { SNOISE_2D, FBM_SOFT, DITHER } from '../../lib/glsl.js'

const vert = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const frag = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform vec2  uMouse;
uniform float uHover;
uniform float uIntro;
uniform vec3  uInk;
uniform vec3  uDeep;
uniform vec3  uViolet;
uniform vec3  uEdge;

${SNOISE_2D}
${FBM_SOFT}
${DITHER}

void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

  float t = uTime * 0.042;

  // Cursor acts as a soft attractor that warps the field and lifts its value.
  vec2 mp = (uMouse - 0.5) * vec2(uAspect, 1.0);
  float pull = exp(-length(p - mp) * 2.1) * uHover;

  // Two rounds of domain warping give the field its slow, liquid drift.
  // Frequencies stay low on purpose: broad bands sit under the headline,
  // fine turbulence competes with it.
  vec2 q = vec2(
    fbmSoft(p * 0.78 + vec2(0.0, t)),
    fbmSoft(p * 0.78 + vec2(4.70, -t))
  );
  vec2 r = vec2(
    fbmSoft(p * 0.92 + 1.05 * q + vec2(1.70, 9.20) + t * 1.10),
    fbmSoft(p * 0.92 + 1.05 * q + vec2(8.30, 2.80) - t * 0.90)
  );
  float f = fbmSoft(p * 0.86 + 1.15 * r + pull * 1.2);

  // fbm clusters hard around zero, so widen it before the ramp or the whole
  // field collapses into the first colour stop.
  float n = clamp(f * 1.15 + 0.5, 0.0, 1.0);

  // Ramp: ink -> deep blue -> violet, with a soft luminous seam on top.
  vec3 col = uInk;
  col = mix(col, uDeep,   smoothstep(0.06, 0.62, n));
  col = mix(col, uViolet, smoothstep(0.56, 0.98, n));

  float seam = smoothstep(0.600, 0.700, n) - smoothstep(0.745, 0.930, n);
  col += uEdge * seam * 0.26;
  col += uEdge * pull * 0.13;

  // Horizon lift so the type at the top always sits on darker ground.
  col *= mix(0.50, 1.0, smoothstep(0.0, 0.78, uv.y));

  // Vignette.
  vec2 vg = (uv - 0.5) * vec2(uAspect, 1.0);
  col *= 1.0 - smoothstep(0.44, 1.15, length(vg)) * 0.76;

  // Intro wipe: the field resolves out of black as the page opens.
  col *= uIntro;

  // Dither away 8-bit banding in the dark half.
  col += (hash12(gl_FragCoord.xy + uTime) - 0.5) / 255.0 * 1.6;

  gl_FragColor = vec4(col, 1.0);
}
`

// The fragment shaders write final sRGB values directly (no
// <colorspace_fragment> include), so uniforms stay unconverted.
const c = (hex) => new THREE.Color(hex)

export default function HeroField({ className = '' }) {
  const ref = useGLStage(({ renderer, scene, size }) => {
    renderer.setClearColor(0x08080b, 1)

    const uniforms = {
      uTime: { value: 0 },
      uAspect: { value: size.w / size.h },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uHover: { value: 0 },
      uIntro: { value: 0 },
      uInk: { value: c('#08080b') },
      uDeep: { value: c('#1a389c') },
      uViolet: { value: c('#7d4ff0') },
      uEdge: { value: c('#ccf553') },
    }

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms })
    )
    mesh.frustumCulled = false
    scene.add(mesh)

    const target = new THREE.Vector2(0.5, 0.55)
    let hoverTarget = 0

    const onMove = (e) => {
      target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
      hoverTarget = 1
    }
    const onLeave = () => {
      hoverTarget = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })

    return {
      update(t, dt, age) {
        uniforms.uTime.value = t
        // Critically damped follow — the field trails the cursor, never snaps.
        const k = 1 - Math.pow(0.0012, dt)
        uniforms.uMouse.value.lerp(target, k)
        uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * (1 - Math.pow(0.02, dt))
        uniforms.uIntro.value = Math.min(1, age / 1.1)
      },
      resize(w, h) {
        uniforms.uAspect.value = w / h
      },
      dispose() {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerleave', onLeave)
      },
    }
  })

  return <div ref={ref} className={`gl-host ${className}`} aria-hidden="true" />
}
