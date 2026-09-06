// 3D Gaussian Splatting rasteriser.
//
// Each splat is an anisotropic 3D Gaussian (position, scale, rotation quaternion,
// colour, opacity). Per frame we project its 3D covariance into screen space,
// eigen-decompose the resulting 2x2 covariance to get the major/minor screen axes,
// and expand a billboard quad over +-2 sigma. The fragment shader evaluates the
// Gaussian analytically. Splats arrive already sorted back-to-front, so ordinary
// premultiplied "over" blending resolves them correctly.

export const SPLAT_VERT = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

layout(location = 0) in vec2 a_corner;   // quad corner, in sigma units
layout(location = 1) in uint a_index;    // per-instance: index into the splat textures

uniform highp sampler2D u_texPos;    // xyz = world position,  w = opacity
uniform highp sampler2D u_texScale;  // xyz = scale,           w = group id
uniform highp sampler2D u_texQuat;   // xyzw = rotation quaternion
uniform highp sampler2D u_texColor;  // rgb = base colour,     a = per-splat seed

uniform mat4 u_view;
uniform mat4 u_proj;
uniform vec2 u_focal;      // pixel focal length
uniform vec2 u_viewport;   // pixel size of the render target
uniform int  u_texWidth;

uniform float u_time;
uniform float u_dissolve;      // 0 = solid object, 1 = fully scattered
uniform float u_breathe;       // subtle idle motion
uniform vec3  u_lightDir;      // key light, driven by the cursor
uniform float u_focusDist;     // depth-of-field focus plane, in world units
uniform float u_dofStrength;   // px^2 of blur per world unit out of focus
uniform float u_dofMax;
uniform float u_exposure;
uniform float u_groupOpacity[6];
uniform vec4  u_groupTint[6];  // rgb = shade, a = how much of it to apply

out vec4 v_color;
out vec2 v_corner;

mat3 quatToMat3(vec4 q) {
  float x = q.x, y = q.y, z = q.z, w = q.w;
  return mat3(
    1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z),       2.0 * (x * z - w * y),
    2.0 * (x * y - w * z),       1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
    2.0 * (x * z + w * y),       2.0 * (y * z - w * x),       1.0 - 2.0 * (x * x + y * y)
  );
}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  ivec2 texel = ivec2(int(a_index) % u_texWidth, int(a_index) / u_texWidth);

  vec4 posData   = texelFetch(u_texPos, texel, 0);
  vec4 scaleData = texelFetch(u_texScale, texel, 0);
  vec4 quatData  = texelFetch(u_texQuat, texel, 0);
  vec4 colorData = texelFetch(u_texColor, texel, 0);

  vec3  center  = posData.xyz;
  float opacity = posData.w;
  vec3  scale   = scaleData.xyz;
  int   group   = int(scaleData.w + 0.5);
  float seed    = colorData.a;

  float groupAlpha = u_groupOpacity[group];
  if (groupAlpha <= 0.001) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }

  // --- idle breathing + scatter -------------------------------------------------
  float phase = seed * 6.2831853;
  vec3 drift = vec3(
    sin(u_time * 0.31 + phase),
    sin(u_time * 0.27 + phase * 1.7),
    cos(u_time * 0.23 + phase * 2.3)
  );
  center += drift * (0.008 + 0.05 * float(group == 3)) * u_breathe;

  if (u_dissolve > 0.0001) {
    // Push each splat outward along a stable pseudo-random direction.
    vec3 dir = normalize(drift + normalize(center - vec3(0.0, 1.2, 0.0)) * 1.2 + 1e-4);
    float amount = u_dissolve * (0.35 + seed * 1.65);
    center += dir * amount;
    scale *= 1.0 + u_dissolve * 1.5 * seed;
    opacity *= 1.0 - smoothstep(0.0, 0.85, u_dissolve);
  }

  vec4 cam = u_view * vec4(center, 1.0);
  float depth = -cam.z;
  if (depth < 0.15) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }

  vec4 clip = u_proj * cam;
  // Cheap frustum reject with slack for the splat footprint.
  if (abs(clip.x) > clip.w * 1.35 || abs(clip.y) > clip.w * 1.35) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return;
  }

  // --- 3D covariance ------------------------------------------------------------
  mat3 R = quatToMat3(quatData);
  mat3 S = mat3(scale.x, 0.0, 0.0, 0.0, scale.y, 0.0, 0.0, 0.0, scale.z);
  mat3 M = R * S;
  mat3 sigma = M * transpose(M);

  // --- project to 2D ------------------------------------------------------------
  // Jacobian of the pinhole projection at the splat centre.
  mat3 J = mat3(
    u_focal.x / depth, 0.0, 0.0,
    0.0, u_focal.y / depth, 0.0,
    u_focal.x * cam.x / (cam.z * cam.z), u_focal.y * cam.y / (cam.z * cam.z), 0.0
  );
  mat3 T = J * mat3(u_view);
  mat3 cov = T * sigma * transpose(T);

  float a = cov[0][0] + 0.3;   // 0.3px dilation keeps sub-pixel splats visible
  float b = cov[0][1];
  float c = cov[1][1] + 0.3;
  float det0 = max(a * c - b * b, 1e-8);

  // Analytic depth of field: convolving a Gaussian with an isotropic blur kernel
  // is just an addition on the covariance diagonal. Opacity is rescaled by the
  // area ratio so total energy is conserved.
  float coc = clamp(abs(depth - u_focusDist) * u_dofStrength, 0.0, u_dofMax);
  a += coc * coc;
  c += coc * coc;
  float det1 = max(a * c - b * b, 1e-8);
  opacity *= sqrt(det0 / det1);

  float mid = 0.5 * (a + c);
  float rad = sqrt(max(mid * mid - det1, 0.0));
  float l1 = mid + rad;
  float l2 = mid - rad;
  if (l2 < 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }

  vec2 dir1;
  if (abs(b) < 1e-9) {
    dir1 = (a >= c) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  } else {
    dir1 = normalize(vec2(b, l1 - a));
  }
  vec2 majorAxis = min(sqrt(2.0 * l1), 512.0) * dir1;
  vec2 minorAxis = min(sqrt(2.0 * l2), 512.0) * vec2(dir1.y, -dir1.x);

  // --- shading ------------------------------------------------------------------
  // The splat's shortest axis is its surface normal: exactly the surfel that a
  // clean capture (or our generator) produces.
  vec3 axis = (scale.x <= scale.y && scale.x <= scale.z) ? vec3(1.0, 0.0, 0.0)
            : (scale.y <= scale.z) ? vec3(0.0, 1.0, 0.0)
            : vec3(0.0, 0.0, 1.0);
  vec3 normal = normalize(R * axis);

  vec3 viewDir = normalize(-cam.xyz);
  vec3 nView = mat3(u_view) * normal;

  // Wrap lighting rather than a two-sided abs(): the terminator is what gives the
  // form its shape. Captures whose normals have arbitrary sign degrade to a flat
  // mid-tone, which is what you want there anyway - their colour is already lit.
  float ndl  = dot(normal, normalize(u_lightDir));
  float key  = pow(clamp(ndl * 0.5 + 0.5, 0.0, 1.0), 1.5);
  float rim  = pow(1.0 - min(abs(dot(nView, viewDir)), 1.0), 3.0);
  float fill = 0.5 + 0.5 * normal.y;

  vec3 base = colorData.rgb;
  vec4 tint = u_groupTint[group];
  vec3 tinted = tint.rgb * (0.30 + 0.95 * luma(base));
  base = mix(base, tinted, tint.a);

  vec3 warm = vec3(1.0, 0.93, 0.84);
  vec3 cool = vec3(0.62, 0.60, 0.66);
  vec3 lit = base * (0.28 + 0.84 * key) * warm;
  lit += base * cool * (0.22 * (1.0 - key) + 0.14 * fill);          // bounce
  lit += vec3(1.0, 0.92, 0.82) * rim * (0.20 + 0.60 * float(group == 1));
  lit += vec3(1.0, 0.88, 0.66) * pow(max(ndl, 0.0), 22.0) * 0.55;   // specular glint

  v_color = vec4(lit * u_exposure, clamp(opacity * groupAlpha, 0.0, 1.0));
  v_corner = a_corner;

  vec2 ndc = clip.xy / clip.w;
  vec2 offset = (a_corner.x * majorAxis + a_corner.y * minorAxis) * 2.0 / u_viewport;
  gl_Position = vec4(ndc + offset, 0.0, 1.0);
}`;

export const SPLAT_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec4 v_color;
in vec2 v_corner;
out vec4 fragColor;

void main() {
  float power = -dot(v_corner, v_corner);
  if (power < -4.0) discard;
  float alpha = exp(power) * v_color.a;
  if (alpha < 0.0025) discard;
  fragColor = vec4(v_color.rgb * alpha, alpha);   // premultiplied
}`;

export const BACKDROP_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec3  u_top;
uniform vec3  u_bottom;
uniform vec3  u_glowColor;
uniform vec2  u_glowPos;
uniform float u_glowStrength;
uniform float u_time;
uniform vec2  u_aspect;

void main() {
  vec3 col = mix(u_bottom, u_top, pow(v_uv.y, 1.25));

  vec2 d = (v_uv - u_glowPos) * u_aspect;
  float glow = exp(-dot(d, d) * 2.6);
  col += u_glowColor * glow * u_glowStrength;

  // very slow drifting haze so a static frame never looks frozen
  float haze = sin(v_uv.x * 5.0 + u_time * 0.13) * sin(v_uv.y * 3.7 - u_time * 0.09);
  col += vec3(0.012, 0.009, 0.011) * haze;

  fragColor = vec4(col, 1.0);
}`;
