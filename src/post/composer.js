import { RenderTarget, createBlitProgram, createFullscreenQuad, bindTexture } from '../core/gl.js';
import { BRIGHT_FRAG, BLUR_FRAG, DOWNSAMPLE_FRAG, COMPOSITE_FRAG } from './shaders.js';

const LEVELS = 3;

export class Composer {
  constructor(gl, caps) {
    this.gl = gl;
    this.float = caps.colorBufferFloat;
    this.quad = createFullscreenQuad(gl);

    this.brightProgram = createBlitProgram(gl, BRIGHT_FRAG, 'bright');
    this.blurProgram = createBlitProgram(gl, BLUR_FRAG, 'blur');
    this.downProgram = createBlitProgram(gl, DOWNSAMPLE_FRAG, 'downsample');
    this.compositeProgram = createBlitProgram(gl, COMPOSITE_FRAG, 'composite');

    const opts = { float: this.float, linear: true };
    this.scene = new RenderTarget(gl, 2, 2, opts);
    this.levels = [];
    for (let i = 0; i < LEVELS; i++) {
      this.levels.push({
        a: new RenderTarget(gl, 2, 2, opts),
        b: new RenderTarget(gl, 2, 2, opts),
      });
    }

    // 1x1 black stand-in so the composite shader always has a sequence texture.
    this.blackTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.blackTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  resize(width, height) {
    this.scene.resize(width, height);
    for (let i = 0; i < LEVELS; i++) {
      const scale = 2 << i;   // 1/2, 1/4, 1/8
      const w = Math.max(1, Math.floor(width / scale));
      const h = Math.max(1, Math.floor(height / scale));
      this.levels[i].a.resize(w, h);
      this.levels[i].b.resize(w, h);
    }
  }

  bindScene() {
    const { gl } = this;
    this.scene.bind();
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /** Bright pass + progressive blur, then composite to the default framebuffer. */
  render(grade, sequenceTexture, sequenceAspect, time) {
    const { gl } = this;
    gl.disable(gl.BLEND);

    // --- bright pass into level 0 ------------------------------------------------
    {
      const { program, uniforms } = this.brightProgram;
      gl.useProgram(program);
      this.levels[0].a.bind();
      bindTexture(gl, 0, this.scene.texture, uniforms.u_scene);
      gl.uniform1f(uniforms.u_threshold, grade.bloomThreshold);
      gl.uniform1f(uniforms.u_knee, 0.35);
      this.quad.draw();
    }

    // --- blur each level, feeding the next from the previous ---------------------
    for (let i = 0; i < LEVELS; i++) {
      if (i > 0) {
        const { program, uniforms } = this.downProgram;
        gl.useProgram(program);
        this.levels[i].a.bind();
        bindTexture(gl, 0, this.levels[i - 1].a.texture, uniforms.u_source);
        gl.uniform2f(uniforms.u_texel, 1 / this.levels[i - 1].a.width, 1 / this.levels[i - 1].a.height);
        this.quad.draw();
      }

      const { program, uniforms } = this.blurProgram;
      const level = this.levels[i];
      gl.useProgram(program);

      level.b.bind();
      bindTexture(gl, 0, level.a.texture, uniforms.u_source);
      gl.uniform2f(uniforms.u_direction, 1 / level.a.width, 0);
      this.quad.draw();

      level.a.bind();
      bindTexture(gl, 0, level.b.texture, uniforms.u_source);
      gl.uniform2f(uniforms.u_direction, 0, 1 / level.b.height);
      this.quad.draw();
    }

    // --- composite ---------------------------------------------------------------
    const { program, uniforms } = this.compositeProgram;
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.scene.width, this.scene.height);

    bindTexture(gl, 0, this.scene.texture, uniforms.u_scene);
    bindTexture(gl, 1, this.levels[0].a.texture, uniforms.u_bloom0);
    bindTexture(gl, 2, this.levels[1].a.texture, uniforms.u_bloom1);
    bindTexture(gl, 3, this.levels[2].a.texture, uniforms.u_bloom2);
    bindTexture(gl, 4, sequenceTexture || this.blackTexture, uniforms.u_sequence);

    gl.uniform1f(uniforms.u_time, time);
    gl.uniform1f(uniforms.u_bloomStrength, grade.bloomStrength);
    gl.uniform3fv(uniforms.u_bloomTint, grade.bloomTint);
    gl.uniform1f(uniforms.u_aberration, grade.aberration);
    gl.uniform1f(uniforms.u_grain, grade.grain);
    gl.uniform1f(uniforms.u_vignette, grade.vignette);
    gl.uniform1f(uniforms.u_letterbox, grade.letterbox);
    gl.uniform1f(uniforms.u_flash, grade.flash);
    gl.uniform1f(uniforms.u_fade, grade.fade);
    gl.uniform1f(uniforms.u_exposure, grade.exposure);
    gl.uniform1f(uniforms.u_contrast, grade.contrast);
    gl.uniform1f(uniforms.u_saturation, grade.saturation);
    gl.uniform3fv(uniforms.u_lift, grade.lift);
    gl.uniform3fv(uniforms.u_gain, grade.gain);
    gl.uniform1f(uniforms.u_sequenceOpacity, grade.sequenceOpacity);
    gl.uniform1f(uniforms.u_sequenceScale, grade.sequenceScale);
    gl.uniform1f(uniforms.u_sequenceAspect, sequenceAspect || 1.777);
    gl.uniform1f(uniforms.u_viewAspect, this.scene.width / this.scene.height);
    gl.uniform1f(uniforms.u_bleed, grade.bleed);

    this.quad.draw();
  }
}
