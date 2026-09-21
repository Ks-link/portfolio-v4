const MAX_BALLS = 16
const MAX_DPR = 2

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;

uniform vec2 u_view;
uniform float u_dpr;
uniform float u_time;
uniform vec4 u_color;
uniform vec4 u_accent;
uniform vec4 u_balls[16];
uniform vec4 u_lights[16];
uniform float u_threshold;
uniform float u_merge;
uniform float u_gain;

void main() {
  vec2 p = gl_FragCoord.xy / max(u_dpr, 0.001);
  p.y = u_view.y - p.y;

  p += vec2(
    sin(p.y * 0.007 + u_time * 0.22) * 2.2,
    cos(p.x * 0.006 + u_time * 0.19) * 2.2
  );

  float field = 0.0;
  float hiW = 0.0;
  for (int i = 0; i < 16; i++) {
    vec4 b = u_balls[i];
    if (b.z >= 0.5 && b.w >= 0.5) {
      vec2 delta = (p - b.xy) / b.zw;
      float dist = length(delta);
      float rMin = min(b.z, b.w);
      float distPx = dist * rMin;
      float inner = max(1.0, rMin - 8.0);
      float outer = rMin + u_merge;
      float contrib = 1.0 - smoothstep(inner, outer, distPx);
      field += contrib;

      vec4 light = u_lights[i];
      float size = clamp(light.z, 0.08, 1.0);
      float bright = clamp(light.w, 0.12, 1.0);
      vec3 n = normalize(vec3(delta, sqrt(max(0.0, 1.0 - min(dist * dist, 1.0))) + 0.002));
      vec3 L = normalize(vec3(light.xy, 0.74));
      float ndotl = max(0.0, dot(n, L));
      float shade = pow(1.0 - ndotl, mix(1.7, 0.9, size));
      float hi = shade * mix(0.22, 0.48, bright);
      hiW += hi * contrib;
    }
  }

  float alpha = smoothstep(u_threshold - 0.12, u_threshold + 0.12, field);
  vec3 rgb = mix(u_color.rgb, u_accent.rgb, clamp(hiW / max(field, 0.001) * u_gain, 0.0, 1.0));

  float a = alpha * u_color.a;
  gl_FragColor = vec4(rgb * a, a);
}
`

const parseChannel = (value) => {
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return 0
  return value.trim().endsWith('%') ? n / 100 : n / 255
}

export const parseCssColor = (value) => {
  const raw = String(value ?? '').trim()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
    const n = Number.parseInt(h, 16)
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]
  }

  const rgb = /^rgba?\(\s*([^\s,]+)\s*,\s*([^\s,]+)\s*,\s*([^\s,]+)(?:\s*,\s*([^\s)]+))?\s*\)$/i.exec(raw)
  if (rgb) {
    const a = rgb[4] == null ? 1 : Number.parseFloat(rgb[4])
    return [parseChannel(rgb[1]), parseChannel(rgb[2]), parseChannel(rgb[3]), Number.isFinite(a) ? a : 1]
  }

  return [0.94, 0.925, 0.886, 1]
}

const compile = (gl, type, source) => {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[metaballs]', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const link = (gl, vertSrc, fragSrc) => {
  const vs = compile(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    return null
  }
  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return null
  }
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, 'a_pos')
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[metaballs]', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

export const createMetaballs = (canvas) => {
  if (!canvas || typeof canvas.getContext !== 'function') return null

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  })
  if (!gl) return null

  const program = link(gl, VERT, FRAG)
  if (!program) return null

  const buffer = gl.createBuffer()
  if (!buffer) {
    gl.deleteProgram(program)
    return null
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const uView = gl.getUniformLocation(program, 'u_view')
  const uDpr = gl.getUniformLocation(program, 'u_dpr')
  const uTime = gl.getUniformLocation(program, 'u_time')
  const uColor = gl.getUniformLocation(program, 'u_color')
  const uAccent = gl.getUniformLocation(program, 'u_accent')
  const uBalls = Array.from({ length: MAX_BALLS }, (_, i) =>
    gl.getUniformLocation(program, `u_balls[${i}]`),
  )
  const uLights = Array.from({ length: MAX_BALLS }, (_, i) =>
    gl.getUniformLocation(program, `u_lights[${i}]`),
  )
  const uThreshold = gl.getUniformLocation(program, 'u_threshold')
  const uMerge = gl.getUniformLocation(program, 'u_merge')
  const uGain = gl.getUniformLocation(program, 'u_gain')

  const packed = new Float32Array(MAX_BALLS * 4)
  const packedLight = new Float32Array(MAX_BALLS * 4)
  const color = [0.94, 0.925, 0.886, 1]
  const accent = [0.933, 0.522, 0.2, 1]
  let time = 0
  let dpr = 1
  let gain = 1
  let destroyed = false

  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  gl.useProgram(program)
  gl.uniform1f(uThreshold, 0.58)
  gl.uniform1f(uMerge, 32.0)
  gl.uniform1f(uGain, 1.0)

  const resize = () => {
    if (destroyed) return
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth)
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight)
    dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
    const w = Math.max(1, Math.round(cssW * dpr))
    const h = Math.max(1, Math.round(cssH * dpr))
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
    gl.viewport(0, 0, w, h)
  }

  const setColor = (rgba) => {
    if (!rgba) return
    color[0] = rgba[0]
    color[1] = rgba[1]
    color[2] = rgba[2]
    color[3] = rgba[3] ?? 1
  }

  const setAccent = (rgba) => {
    if (!rgba) return
    accent[0] = rgba[0]
    accent[1] = rgba[1]
    accent[2] = rgba[2]
    accent[3] = rgba[3] ?? 1
  }

  const setGain = (value) => {
    const n = Number(value)
    gain = Number.isFinite(n) ? Math.max(0, n) : 1
  }

  const setTime = (value) => {
    time = value
  }

  const draw = (balls) => {
    if (destroyed) return
    resize()
    packed.fill(0)
    packedLight.fill(0)
    const list = balls ?? []
    const count = Math.min(MAX_BALLS, list.length)
    for (let i = 0; i < count; i++) {
      const ball = list[i]
      const o = i * 4
      packed[o] = ball.x
      packed[o + 1] = ball.y
      packed[o + 2] = ball.rx
      packed[o + 3] = ball.ry
      packedLight[o] = ball.lx ?? 0
      packedLight[o + 1] = ball.ly ?? 0
      packedLight[o + 2] = ball.hiSize ?? 0.55
      packedLight[o + 3] = ball.hiBright ?? 0.7
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.uniform2f(uView, canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight)
    gl.uniform1f(uDpr, dpr)
    gl.uniform1f(uTime, time)
    gl.uniform4f(uColor, color[0], color[1], color[2], color[3])
    gl.uniform4f(uAccent, accent[0], accent[1], accent[2], accent[3])
    gl.uniform1f(uGain, gain)
    for (let i = 0; i < MAX_BALLS; i++) {
      const loc = uBalls[i]
      if (loc) gl.uniform4f(loc, packed[i * 4], packed[i * 4 + 1], packed[i * 4 + 2], packed[i * 4 + 3])
      const lightLoc = uLights[i]
      if (lightLoc) {
        gl.uniform4f(
          lightLoc,
          packedLight[i * 4],
          packedLight[i * 4 + 1],
          packedLight[i * 4 + 2],
          packedLight[i * 4 + 3],
        )
      }
    }
    gl.uniform1f(uThreshold, 0.58)
    gl.uniform1f(uMerge, 32.0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const destroy = () => {
    if (destroyed) return
    destroyed = true
    gl.deleteBuffer(buffer)
    gl.deleteProgram(program)
  }

  resize()

  return { ok: true, resize, setColor, setAccent, setGain, setTime, draw, destroy }
}
