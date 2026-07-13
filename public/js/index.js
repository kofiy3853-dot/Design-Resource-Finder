(function () {
  const canvas = document.getElementById('shader-canvas-ANIMATION_3');
  function syncSize() {
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const vs =
    'attribute vec2 a_position;varying vec2 v_texCoord;void main(){v_texCoord=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}';
  const fs =
    'precision highp float;varying vec2 v_texCoord;uniform float u_time;uniform vec2 u_resolution;void main(){vec2 uv=v_texCoord;float noise=0.0;vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;float t=u_time*0.2;for(float i=1.0;i<4.0;i++){p.x+=0.3/i*sin(i*3.0*p.y+t+i);p.y+=0.3/i*cos(i*3.0*p.x+t+i);}vec3 color=vec3(0.05,0.05,0.07);vec3 accent1=vec3(0.0,0.4,1.0);vec3 accent2=vec3(0.5,0.0,1.0);float glow=1.0/length(p*0.8);glow=smoothstep(0.0,4.0,glow);color=mix(color,accent1,glow*0.4*(0.5+0.5*sin(t)));color=mix(color,accent2,glow*0.3*(0.5+0.5*cos(t*0.7)));float grain=fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453);color+=grain*0.02;gl_FragColor=vec4(color,1.0);}';
  function cs(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });
  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render(0);
})();
