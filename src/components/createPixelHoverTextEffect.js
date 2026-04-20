const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;
uniform float u_intensity;

vec4 sampleTexture(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }

  return texture2D(u_texture, uv);
}

void main() {
  vec2 grid = vec2(18.0, 18.0);
  vec2 gridUv = floor(v_uv * grid) / grid;
  vec2 cellCenter = gridUv + (0.5 / grid);

  vec2 direction = u_mouse - u_prevMouse;
  vec2 toMouse = cellCenter - u_mouse;
  vec2 radiusScale = vec2(1.85, 0.72);
  float distanceToMouse = length(toMouse * radiusScale);
  float strength = smoothstep(0.18, 0.0, distanceToMouse) * u_intensity;

  vec2 blockDrift = normalize(direction + vec2(0.0001)) * strength * 0.085;
  vec2 uv = mix(v_uv, gridUv, strength * 0.9) - blockDrift;
  vec4 colorSample = sampleTexture(uv);
  float alpha = colorSample.a;
  vec3 color = colorSample.rgb;

  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Shader creation failed.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || 'Shader compilation failed.');
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Program creation failed.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || 'Program linking failed.');
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function drawTextTexture(sourceElement, canvas, text) {
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const style = window.getComputedStyle(sourceElement);
  const width = Math.max(Math.ceil(sourceElement.clientWidth), 1);
  const height = Math.max(Math.ceil(sourceElement.clientHeight), 1);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.max(Math.round(width * pixelRatio), 1);
  canvas.height = Math.max(Math.round(height * pixelRatio), 1);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.fillStyle = style.color;
  context.textBaseline = 'top';
  context.fillText(text, 0, 0);
}

export function createPixelHoverTextEffect(root, sourceElement, text) {
  if (!root || !sourceElement) {
    return () => {};
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'pixel-hover-title__canvas';
  root.appendChild(canvas);

  const textureCanvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true }) ||
    canvas.getContext('experimental-webgl', { alpha: true, antialias: true, premultipliedAlpha: true });

  if (!gl) {
    return () => {
      canvas.remove();
    };
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]);

  const uvs = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

  const uvLocation = gl.getAttribLocation(program, 'a_uv');
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const uniformLocations = {
    mouse: gl.getUniformLocation(program, 'u_mouse'),
    prevMouse: gl.getUniformLocation(program, 'u_prevMouse'),
    intensity: gl.getUniformLocation(program, 'u_intensity'),
    texture: gl.getUniformLocation(program, 'u_texture'),
  };

  gl.uniform1i(uniformLocations.texture, 0);
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const state = {
    mouse: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.5 },
    previous: { x: 0.5, y: 0.5 },
    intensity: 0,
    autonomous: {
      active: false,
      startTime: 0,
      duration: 0,
      from: { x: 0.06, y: 0.5 },
      to: { x: 0.94, y: 0.5 },
      nextTriggerAt: performance.now() + 2200,
    },
  };

  let rafId = 0;
  let isDisposed = false;

  const updateTexture = () => {
    drawTextTexture(sourceElement, textureCanvas, text);

    const width = Math.max(sourceElement.clientWidth, 1);
    const height = Math.max(sourceElement.clientHeight, 1);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(Math.round(width * pixelRatio), 1);
    canvas.height = Math.max(Math.round(height * pixelRatio), 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
  };

  const resizeObserver = new ResizeObserver(updateTexture);
  resizeObserver.observe(sourceElement);
  updateTexture();

  const getRelativePosition = (event) => {
    const bounds = root.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  };

  const onPointerMove = (event) => {
    state.autonomous.active = false;
    state.autonomous.nextTriggerAt = performance.now() + 2800 + Math.random() * 1800;
    state.target = getRelativePosition(event);
    state.intensity = 1;
  };

  const onPointerEnter = (event) => {
    state.autonomous.active = false;
    state.autonomous.nextTriggerAt = performance.now() + 2800 + Math.random() * 1800;
    const next = getRelativePosition(event);
    state.mouse = next;
    state.target = next;
    state.previous = next;
    state.intensity = 0.8;
  };

  const onPointerLeave = () => {
    state.intensity = Math.max(state.intensity, 0.35);
  };

  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  root.classList.add('pixel-hover-title--webgl-ready');

  const render = () => {
    if (isDisposed) {
      return;
    }

    const now = performance.now();

    if (!state.autonomous.active && state.intensity < 0.08 && now >= state.autonomous.nextTriggerAt) {
      state.autonomous.active = true;
      state.autonomous.startTime = now;
      state.autonomous.duration = 960;
      state.autonomous.from = {
        x: 0.06,
        y: 0.5,
      };
      state.autonomous.to = {
        x: 0.94,
        y: 0.5,
      };
      state.mouse = {
        x: state.autonomous.from.x,
        y: state.autonomous.from.y,
      };
      state.previous = {
        x: state.autonomous.from.x,
        y: state.autonomous.from.y,
      };
      state.target = {
        x: state.autonomous.from.x,
        y: state.autonomous.from.y,
      };
      state.intensity = 0;
    }

    if (state.autonomous.active) {
      const progress = Math.min((now - state.autonomous.startTime) / state.autonomous.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      state.target = {
        x: state.autonomous.from.x + (state.autonomous.to.x - state.autonomous.from.x) * eased,
        y: state.autonomous.from.y + (state.autonomous.to.y - state.autonomous.from.y) * eased,
      };

      state.intensity = Math.max(state.intensity, 0.42 * Math.sin(progress * Math.PI));

      if (progress >= 1) {
        state.autonomous.active = false;
        state.autonomous.nextTriggerAt = now + 2200;
      }
    }

    state.previous.x += (state.mouse.x - state.previous.x) * 0.18;
    state.previous.y += (state.mouse.y - state.previous.y) * 0.18;
    state.mouse.x += (state.target.x - state.mouse.x) * 0.1;
    state.mouse.y += (state.target.y - state.mouse.y) * 0.1;
    state.intensity = Math.max(0, state.intensity * 0.94);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniformLocations.mouse, state.mouse.x, 1 - state.mouse.y);
    gl.uniform2f(uniformLocations.prevMouse, state.previous.x, 1 - state.previous.y);
    gl.uniform1f(uniformLocations.intensity, state.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    rafId = window.requestAnimationFrame(render);
  };

  rafId = window.requestAnimationFrame(render);

  return () => {
    isDisposed = true;
    window.cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerenter', onPointerEnter);
    root.removeEventListener('pointerleave', onPointerLeave);
    root.classList.remove('pixel-hover-title--webgl-ready');
    canvas.remove();

    if (positionBuffer) {
      gl.deleteBuffer(positionBuffer);
    }

    if (uvBuffer) {
      gl.deleteBuffer(uvBuffer);
    }

    if (texture) {
      gl.deleteTexture(texture);
    }

    if (program) {
      gl.deleteProgram(program);
    }
  };
}
