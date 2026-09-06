// The scroll-scrubbed footage layer.
//
// Two sources, one interface:
//   * an image sequence (default) - frames preloaded and uploaded on change
//   * a video file - scrubbed by setting currentTime from the scroll position
// The composite shader consumes whatever this exposes as `texture`.

export class SequenceLayer {
  constructor(gl) {
    this.gl = gl;
    this.texture = null;
    this.aspect = 16 / 9;
    this.ready = false;
    this.frames = [];
    this.frameCount = 0;
    this.currentFrame = -1;
    this.mode = 'none';
    this.video = null;
    this.videoDuration = 0;
    this._lastVideoTime = -1;
  }

  _createTexture() {
    const { gl } = this;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.texture = texture;
    return texture;
  }

  /**
   * @param {string} manifestUrl  JSON with { pattern, pad, frames, width, height }
   * @param {function} onProgress 0..1
   */
  async loadSequence(manifestUrl, onProgress) {
    let manifest;
    try {
      const response = await fetch(manifestUrl, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      manifest = await response.json();
    } catch (error) {
      console.warn('[sequence] manifest unavailable, layer disabled:', error.message);
      if (onProgress) onProgress(1);
      return false;
    }

    // `pattern` is stored relative to the site root, so it resolves as-is.
    const urls = [];
    for (let i = 0; i < manifest.frames; i++) {
      const index = String(i).padStart(manifest.pad ?? 4, '0');
      urls.push(manifest.pattern.replace('{i}', index));
    }

    this.aspect = (manifest.width || 16) / (manifest.height || 9);

    let loaded = 0;
    const CONCURRENCY = 8;
    const images = new Array(urls.length);
    let cursor = 0;

    const worker = async () => {
      for (;;) {
        const index = cursor++;
        if (index >= urls.length) return;
        try {
          images[index] = await loadImage(urls[index]);
        } catch {
          images[index] = null;
        }
        loaded++;
        if (onProgress) onProgress(loaded / urls.length);
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    this.frames = images.filter(Boolean);
    this.frameCount = this.frames.length;
    if (!this.frameCount) {
      console.warn('[sequence] no frames decoded, layer disabled');
      return false;
    }

    this._createTexture();
    this.mode = 'sequence';
    this.ready = true;
    this.setPhase(0);
    return true;
  }

  /** Scrub a video instead of an image sequence. */
  async loadVideo(url) {
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    const ok = await new Promise((resolve) => {
      const done = () => resolve(true);
      video.addEventListener('loadeddata', done, { once: true });
      video.addEventListener('error', () => resolve(false), { once: true });
      setTimeout(() => resolve(video.readyState >= 2), 8000);
    });
    if (!ok) {
      console.warn('[sequence] video unavailable, layer disabled');
      return false;
    }

    this.video = video;
    this.videoDuration = video.duration || 0;
    this.aspect = (video.videoWidth || 16) / (video.videoHeight || 9);
    this._createTexture();
    this.mode = 'video';
    this.ready = true;
    return true;
  }

  /** @param {number} phase 0..1 through the clip. */
  setPhase(phase) {
    if (!this.ready) return;
    const { gl } = this;

    if (this.mode === 'sequence') {
      const index = Math.min(
        this.frameCount - 1,
        Math.max(0, Math.round(phase * (this.frameCount - 1)))
      );
      if (index === this.currentFrame) return;
      this.currentFrame = index;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.frames[index]);
      gl.bindTexture(gl.TEXTURE_2D, null);
      return;
    }

    if (this.mode === 'video') {
      const time = Math.min(this.videoDuration - 0.05, Math.max(0, phase * this.videoDuration));
      if (Math.abs(time - this._lastVideoTime) > 1 / 60) {
        this._lastVideoTime = time;
        try { this.video.currentTime = time; } catch { /* seek in flight */ }
      }
      if (this.video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    }
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`failed to load ${url}`));
    image.src = url;
  });
}
