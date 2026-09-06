// Post chain: bright pass -> separable blur (3 levels) -> cinematic grade.

export const BRIGHT_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_scene;
uniform float u_threshold;
uniform float u_knee;

void main() {
  vec3 c = texture(u_scene, v_uv).rgb;
  float brightness = max(c.r, max(c.g, c.b));
  // soft knee so highlights ramp in instead of clipping on
  float soft = clamp(brightness - u_threshold + u_knee, 0.0, 2.0 * u_knee);
  soft = soft * soft / (4.0 * u_knee + 1e-5);
  float contribution = max(soft, brightness - u_threshold) / max(brightness, 1e-5);
  fragColor = vec4(c * contribution, 1.0);
}`;

export const BLUR_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_source;
uniform vec2 u_direction;   // texel-sized step

void main() {
  // 9-tap gaussian collapsed to 5 bilinear fetches
  vec3 sum = texture(u_source, v_uv).rgb * 0.227027;
  vec2 o1 = u_direction * 1.3846153846;
  vec2 o2 = u_direction * 3.2307692308;
  sum += (texture(u_source, v_uv + o1).rgb + texture(u_source, v_uv - o1).rgb) * 0.3162162162;
  sum += (texture(u_source, v_uv + o2).rgb + texture(u_source, v_uv - o2).rgb) * 0.0702702703;
  fragColor = vec4(sum, 1.0);
}`;

export const DOWNSAMPLE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_source;
uniform vec2 u_texel;

void main() {
  vec3 sum = texture(u_source, v_uv + u_texel * vec2(-1.0, -1.0)).rgb;
  sum += texture(u_source, v_uv + u_texel * vec2(1.0, -1.0)).rgb;
  sum += texture(u_source, v_uv + u_texel * vec2(-1.0, 1.0)).rgb;
  sum += texture(u_source, v_uv + u_texel * vec2(1.0, 1.0)).rgb;
  fragColor = vec4(sum * 0.25, 1.0);
}`;

export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_scene;
uniform sampler2D u_bloom0;
uniform sampler2D u_bloom1;
uniform sampler2D u_bloom2;
uniform sampler2D u_sequence;    // scroll-scrubbed image sequence / video frame

uniform float u_time;

uniform float u_bloomStrength;
uniform vec3  u_bloomTint;
uniform float u_aberration;
uniform float u_grain;
uniform float u_vignette;
uniform float u_letterbox;       // fraction of the frame height, per bar
uniform float u_flash;           // white flash on a cut
uniform float u_fade;            // fade to black
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;
uniform vec3  u_lift;
uniform vec3  u_gain;
uniform float u_sequenceOpacity;
uniform float u_sequenceScale;
uniform float u_sequenceAspect;  // sequence width/height
uniform float u_viewAspect;      // viewport width/height
uniform float u_bleed;           // radial highlight bleed / halation

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// cover-fit the sequence frame regardless of viewport shape
vec2 coverUv(vec2 uv, float srcAspect, float dstAspect, float scale) {
  vec2 centred = uv - 0.5;
  if (dstAspect > srcAspect) {
    centred.y *= srcAspect / dstAspect;
  } else {
    centred.x *= dstAspect / srcAspect;
  }
  return centred / max(scale, 0.001) + 0.5;
}

void main() {
  vec2 uv = v_uv;
  vec2 centred = uv - 0.5;
  float radius = length(centred);

  // --- chromatic aberration, strongest at the edges -----------------------------
  vec2 offset = centred * u_aberration * (0.35 + radius * radius * 2.0) * 0.01;
  vec3 col;
  col.r = texture(u_scene, uv + offset).r;
  col.g = texture(u_scene, uv).g;
  col.b = texture(u_scene, uv - offset).b;

  // --- bloom --------------------------------------------------------------------
  vec3 bloom = texture(u_bloom0, uv).rgb * 0.5
             + texture(u_bloom1, uv).rgb * 0.32
             + texture(u_bloom2, uv).rgb * 0.18;
  col += bloom * u_bloomTint * u_bloomStrength;

  // halation: warm bleed pulled toward the frame centre
  if (u_bleed > 0.0) {
    vec3 smear = texture(u_bloom2, 0.5 + centred * 0.86).rgb;
    col += smear * vec3(1.0, 0.55, 0.35) * u_bleed;
  }

  // --- image sequence layer -----------------------------------------------------
  if (u_sequenceOpacity > 0.001) {
    vec2 suv = coverUv(uv, u_sequenceAspect, u_viewAspect, u_sequenceScale);
    if (suv.x >= 0.0 && suv.x <= 1.0 && suv.y >= 0.0 && suv.y <= 1.0) {
      vec3 seq = texture(u_sequence, vec2(suv.x, 1.0 - suv.y)).rgb;
      vec3 screened = 1.0 - (1.0 - col) * (1.0 - seq * 0.92);
      col = mix(col, screened, u_sequenceOpacity);
    }
  }

  // --- grade --------------------------------------------------------------------
  col *= u_exposure;
  col = col * u_gain + u_lift;
  col = (col - 0.5) * u_contrast + 0.5;
  float grey = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(grey), col, u_saturation);

  col = aces(max(col, 0.0));

  // --- optics -------------------------------------------------------------------
  float vig = smoothstep(0.92, 0.24, radius);
  col *= mix(1.0, vig, u_vignette);

  float grain = hash13(vec3(gl_FragCoord.xy, floor(u_time * 24.0))) - 0.5;
  col += grain * u_grain * (1.0 - 0.55 * grey);

  col = mix(col, vec3(1.0), u_flash);
  col = mix(col, vec3(0.0), u_fade);

  // --- letterbox ----------------------------------------------------------------
  float bar = step(uv.y, u_letterbox) + step(1.0 - u_letterbox, uv.y);
  col *= 1.0 - clamp(bar, 0.0, 1.0);

  fragColor = vec4(col, 1.0);
}`;
