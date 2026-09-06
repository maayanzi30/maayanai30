import { createProgram, createDataTexture, createBlitProgram, bindTexture } from '../core/gl.js';
import { SPLAT_VERT, SPLAT_FRAG, BACKDROP_FRAG } from './shaders.js';

const GROUP_COUNT = 6;

export class SplatRenderer {
  constructor(gl, data) {
    this.gl = gl;
    this.count = data.count;
    this.texWidth = data.texWidth;

    this.program = createProgram(gl, SPLAT_VERT, SPLAT_FRAG, 'splats');
    this.backdrop = createBlitProgram(gl, BACKDROP_FRAG, 'backdrop');

    this.texPos = createDataTexture(gl, data.texWidth, data.texHeight, data.posOpacity);
    this.texScale = createDataTexture(gl, data.texWidth, data.texHeight, data.scaleGroup);
    this.texQuat = createDataTexture(gl, data.texWidth, data.texHeight, data.quat);
    this.texColor = createDataTexture(gl, data.texWidth, data.texHeight, data.colorSeed);

    // --- geometry: one instanced quad, corners in sigma units -------------------
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.cornerBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-2, -2, 2, -2, -2, 2, 2, 2]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.count * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribIPointer(1, 1, gl.UNSIGNED_INT, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Until the first sort lands, draw in storage order so nothing pops in late.
    const identity = new Uint32Array(this.count);
    for (let i = 0; i < this.count; i++) identity[i] = i;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, identity);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // --- depth sorting ----------------------------------------------------------
    this.sortPending = false;
    this.sortGeneration = 0;
    this.lastSortKey = null;
    // A single-file build has no separate worker script to point at, so it
    // installs a factory that returns a same-interface sorter instead.
    const injected = globalThis.__splatSorterFactory;
    this.worker = injected
      ? injected()
      : new Worker(new URL('./sort.worker.js', import.meta.url));
    this.worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.type !== 'sorted') return;
      this.sortPending = false;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, msg.indices);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      this.worker.postMessage({ type: 'recycle', indices: msg.indices }, [msg.indices.buffer]);
    };

    const positions = data.positions.slice();
    this.worker.postMessage({ type: 'init', positions }, [positions.buffer]);

    // --- per-group state, driven by the scroll director -------------------------
    this.groupOpacity = new Float32Array(GROUP_COUNT).fill(1);
    this.groupTint = new Float32Array(GROUP_COUNT * 4);
    for (let g = 0; g < GROUP_COUNT; g++) {
      this.groupTint[g * 4 + 0] = 1;
      this.groupTint[g * 4 + 1] = 1;
      this.groupTint[g * 4 + 2] = 1;
      this.groupTint[g * 4 + 3] = 0;
    }
  }

  setGroupOpacity(group, value) {
    this.groupOpacity[group] = value;
  }

  setGroupTint(group, r, g, b, amount) {
    const o = group * 4;
    this.groupTint[o] = r;
    this.groupTint[o + 1] = g;
    this.groupTint[o + 2] = b;
    this.groupTint[o + 3] = amount;
  }

  requestSort(view) {
    if (this.sortPending) return;
    // Re-sort only when the camera has actually moved; a static shot costs nothing.
    const key = `${view[2].toFixed(3)},${view[6].toFixed(3)},${view[10].toFixed(3)},` +
                `${view[12].toFixed(2)},${view[13].toFixed(2)},${view[14].toFixed(2)}`;
    if (key === this.lastSortKey) return;
    this.lastSortKey = key;
    this.sortPending = true;
    this.worker.postMessage({ type: 'sort', view: Array.from(view), generation: ++this.sortGeneration });
  }

  drawBackdrop(quad, palette, time, aspect) {
    const { gl } = this;
    const { program, uniforms } = this.backdrop;
    gl.useProgram(program);
    gl.disable(gl.BLEND);
    gl.uniform3fv(uniforms.u_top, palette.top);
    gl.uniform3fv(uniforms.u_bottom, palette.bottom);
    gl.uniform3fv(uniforms.u_glowColor, palette.glowColor);
    gl.uniform2fv(uniforms.u_glowPos, palette.glowPos);
    gl.uniform1f(uniforms.u_glowStrength, palette.glowStrength);
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform2f(uniforms.u_aspect, aspect, 1);
    quad.draw();
  }

  draw(state) {
    const { gl } = this;
    const { program, uniforms } = this.program;

    gl.useProgram(program);
    gl.bindVertexArray(this.vao);

    gl.enable(gl.BLEND);
    // Premultiplied "over". The index buffer is sorted back-to-front, so this
    // resolves the Gaussians in the correct order.
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);

    bindTexture(gl, 0, this.texPos, uniforms.u_texPos);
    bindTexture(gl, 1, this.texScale, uniforms.u_texScale);
    bindTexture(gl, 2, this.texQuat, uniforms.u_texQuat);
    bindTexture(gl, 3, this.texColor, uniforms.u_texColor);

    gl.uniformMatrix4fv(uniforms.u_view, false, state.view);
    gl.uniformMatrix4fv(uniforms.u_proj, false, state.proj);
    gl.uniform2f(uniforms.u_focal, state.focalX, state.focalY);
    gl.uniform2f(uniforms.u_viewport, state.width, state.height);
    gl.uniform1i(uniforms.u_texWidth, this.texWidth);

    gl.uniform1f(uniforms.u_time, state.time);
    gl.uniform1f(uniforms.u_dissolve, state.dissolve);
    gl.uniform1f(uniforms.u_breathe, state.breathe);
    gl.uniform3fv(uniforms.u_lightDir, state.lightDir);
    gl.uniform1f(uniforms.u_focusDist, state.focusDist);
    gl.uniform1f(uniforms.u_dofStrength, state.dofStrength);
    gl.uniform1f(uniforms.u_dofMax, state.dofMax);
    gl.uniform1f(uniforms.u_exposure, state.exposure);
    gl.uniform1fv(uniforms.u_groupOpacity, this.groupOpacity);
    gl.uniform4fv(uniforms.u_groupTint, this.groupTint);

    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);

    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }

  dispose() {
    const { gl } = this;
    this.worker.terminate();
    gl.deleteTexture(this.texPos);
    gl.deleteTexture(this.texScale);
    gl.deleteTexture(this.texQuat);
    gl.deleteTexture(this.texColor);
    gl.deleteBuffer(this.cornerBuffer);
    gl.deleteBuffer(this.indexBuffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program.program);
    gl.deleteProgram(this.backdrop.program);
  }
}
