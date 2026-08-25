import * as THREE from 'three'
import { useGLStage } from '../../lib/useGLStage.js'
import { SNOISE_2D, NOISE_3D } from '../../lib/glsl.js'

/**
 * The studio's signature object: a sphere displaced by animated noise and
 * shaded as a solid surface — wrapped diffuse, a fresnel rim and topographic
 * contours read straight off the displacement field.
 *
 * Normals are solved in the vertex shader from two tangential samples rather
 * than shipped as an attribute, so the surface stays correctly lit while it
 * deforms.
 */

const vert = /* glsl */ `
uniform float uTime;
uniform float uAmp;

varying vec3  vNormalV;
varying vec3  vViewV;
varying float vD;

${SNOISE_2D}
${NOISE_3D}

float field(vec3 dir){
  float a = noise3(dir * 1.45 + vec3(0.0, uTime * 0.10, uTime * 0.055));
  float b = noise3(dir * 3.10 - vec3(uTime * 0.075, 0.0, uTime * 0.035)) * 0.42;
  return a + b;
}

vec3 surface(vec3 dir){
  return dir * (1.0 + field(dir) * uAmp);
}

void main(){
  vec3 dir = normalize(position);
  float d = field(dir);
  vD = d;

  vec3 p = dir * (1.0 + d * uAmp);

  // Two tangential probes give the deformed normal. cross(t1, t2) points
  // outward by construction, so the surface never lights inside-out.
  vec3 up = abs(dir.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(up, dir));
  vec3 t2 = cross(dir, t1);
  float e = 0.02;
  vec3 pa = surface(normalize(dir + t1 * e));
  vec3 pb = surface(normalize(dir + t2 * e));
  vec3 nrm = normalize(cross(pa - p, pb - p));

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormalV = normalize(normalMatrix * nrm);
  vViewV = normalize(-mv.xyz);

  gl_Position = projectionMatrix * mv;
}
`

const frag = /* glsl */ `
precision highp float;

varying vec3  vNormalV;
varying vec3  vViewV;
varying float vD;

uniform vec3  uDeep;
uniform vec3  uMid;
uniform vec3  uEdge;
uniform float uOpacity;

void main(){
  vec3 N = normalize(vNormalV);
  vec3 V = normalize(vViewV);
  vec3 key = normalize(vec3(-0.42, 0.70, 0.62));
  vec3 fill = normalize(vec3(0.75, -0.30, 0.35));

  // A true lambert term for the terminator plus a wrapped one for the
  // shadow side: form first, then just enough fill to keep it from going flat.
  float lam = max(dot(N, key), 0.0);
  float diff = dot(N, key) * 0.5 + 0.5;
  float bounce = clamp(dot(N, fill) * 0.5 + 0.5, 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-key, N), V), 0.0, 1.0), 42.0);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

  vec3 col = mix(uDeep, uMid, smoothstep(-0.60, 0.40, vD));
  col *= 0.15 + 1.12 * lam + 0.20 * diff;
  col += uDeep * bounce * bounce * 0.28;
  col += uEdge * fres * 0.42;
  col += vec3(0.85, 0.88, 1.0) * spec * 0.30;

  // Contours drawn straight off the displacement field. fwidth keeps them a
  // constant width on screen instead of pooling where the surface flattens.
  float scaled = vD * 5.0;
  float w = fwidth(scaled);
  float f = fract(scaled);
  float line = 1.0 - smoothstep(0.0, w * 1.7, min(f, 1.0 - f));
  col += uEdge * line * 0.34 * (0.22 + 0.78 * lam);

  // Pull the saturation back off neon — the object belongs to the palette,
  // it is not trying to win against it.
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 0.84);

  gl_FragColor = vec4(col * uOpacity, uOpacity);
}
`

const c = (hex) => new THREE.Color(hex)

export default function Relief({ className = '' }) {
  const ref = useGLStage(
    ({ scene, camera, size }) => {
      const detail = size.w < 700 ? 12 : 20

      const uniforms = {
        uTime: { value: 0 },
        uAmp: { value: 0.185 },
        uOpacity: { value: 0 },
        uDeep: { value: c('#242a63') },
        uMid: { value: c('#7059cf') },
        uEdge: { value: c('#ccf553') },
      }

      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, detail),
        new THREE.ShaderMaterial({
          vertexShader: vert,
          fragmentShader: frag,
          uniforms,
          transparent: true,
          depthWrite: true,
        })
      )

      const group = new THREE.Group()
      group.add(mesh)
      group.rotation.z = -0.2
      scene.add(group)

      camera.position.set(0, 0, 3.35)

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
      const onMove = (e) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('pointermove', onMove, { passive: true })

      return {
        update(t, dt, age) {
          uniforms.uTime.value = t
          uniforms.uOpacity.value = Math.min(1, age / 0.9)

          const k = 1 - Math.pow(0.006, dt)
          pointer.x += (pointer.tx - pointer.x) * k
          pointer.y += (pointer.ty - pointer.y) * k

          group.rotation.y = t * 0.10 + pointer.x * 0.32
          group.rotation.x = pointer.y * -0.22
        },
        resize(w, h) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        },
        dispose() {
          window.removeEventListener('pointermove', onMove)
        },
      }
    },
    {
      alpha: true,
      camera: (size) => new THREE.PerspectiveCamera(42, size.w / size.h, 0.1, 100),
    }
  )

  return <div ref={ref} className={`gl-host ${className}`} aria-hidden="true" />
}
