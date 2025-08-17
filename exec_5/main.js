// 24 vértices (6 faces x 4 vértices)
const vertices = [
  -1,-1,-1,   1,-1,-1,   1, 1,-1,  -1, 1,-1,   // traseira
  -1,-1, 1,   1,-1, 1,   1, 1, 1,  -1, 1, 1,   // frente
  -1,-1,-1,  -1, 1,-1,  -1, 1, 1,  -1,-1, 1,   // esquerda
   1,-1,-1,   1, 1,-1,   1, 1, 1,   1,-1, 1,   // direita
  -1,-1,-1,  -1,-1, 1,   1,-1, 1,   1,-1,-1,   // baixo
  -1, 1,-1,  -1, 1, 1,   1, 1, 1,   1, 1,-1    // topo
];

const colors = [
    // azul
    0,0,1,  0,0,1,  0,0,1,  0,0,1,
    // magenta (rosa)
    1,0,1,  1,0,1,  1,0,1,  1,0,1,
    // branco
    1,1,1,  1,1,1,  1,1,1,  1,1,1,
    // vermelho
    1,0,0,  1,0,0,  1,0,0,  1,0,0,
    // verde
    0,1,0,  0,1,0,  0,1,0,  0,1,0,
    // amarelo
    1,1,0,  1,1,0,  1,1,0,  1,1,0
];

const indexes = [
  0,1,2,  0,2,3,      // traseira (azul)
  4,5,6,  4,6,7,      // frente  (magenta)
  8,9,10, 8,10,11,    // esquerda (branco)
  12,13,14, 12,14,15, // direita  (vermelho)
  16,17,18, 16,18,19, // baixo    (verde)
  20,21,22, 20,22,23  // topo     (preto)
];

/* ====== MATRIZES ====== */
function deg2rad(d){ return d * Math.PI / 180; }

function getProjectionMatrix(aspect, fovDeg=60, zNear=0.1, zFar=100){
  const f = 1 / Math.tan(deg2rad(fovDeg)/2);
  const nf = 1 / (zNear - zFar);
  return [
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (zFar+zNear)*nf, -1,
    0, 0, (2*zFar*zNear)*nf, 0
  ];
}

function identity(){
  return [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1];
}

function multiply(a,b){
  const r = new Array(16).fill(0);
  for(let i=0;i<4;i++){
    for(let j=0;j<4;j++){
      for(let k=0;k<4;k++){
        r[i*4+j]+= a[i*4+k]*b[k*4+j];
      }
    }
  }
  return r;
}

function translate(m, x, y, z){
  const t = identity();
  t[12]=x; t[13]=y; t[14]=z;
  return multiply(m, t);
}

function rotateX(m, deg){
  const c=Math.cos(deg2rad(deg)), s=Math.sin(deg2rad(deg));
  const r=[1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1];
  return multiply(m, r);
}
function rotateY(m, deg){
  const c=Math.cos(deg2rad(deg)), s=Math.sin(deg2rad(deg));
  const r=[c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1];
  return multiply(m, r);
}
function rotateZ(m, deg){
  const c=Math.cos(deg2rad(deg)), s=Math.sin(deg2rad(deg));
  const r=[c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1];
  return multiply(m, r);
}

function main(){
  const canvas = document.getElementById('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl');
  if(!gl){ console.error('WebGL não suportado'); return; }

  gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(0,0,0,1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Buffers
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

  // Shaders
  const vertCode = `
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    uniform mat4 pMatrix;
    uniform mat4 VMatrix;
    uniform mat4 MMatrix;
    void main(){
      gl_Position = pMatrix * VMatrix * MMatrix * vec4(position, 1.0);
      vColor = color;
    }
  `;
  const fragCode = `
    precision mediump float;
    varying vec3 vColor;
    void main(){
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;
  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILER_STATUS) && !gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  const vsh = compile(gl.VERTEX_SHADER, vertCode);
  const fsh = compile(gl.FRAGMENT_SHADER, fragCode);

  const program = gl.createProgram();
  gl.attachShader(program, vsh);
  gl.attachShader(program, fsh);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  // Atributos
  const aPos = gl.getAttribLocation(program, 'position');
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPos);

  const aCol = gl.getAttribLocation(program, 'color');
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aCol);

  // Uniforms
  const uP = gl.getUniformLocation(program, 'pMatrix');
  const uV = gl.getUniformLocation(program, 'VMatrix');
  const uM = gl.getUniformLocation(program, 'MMatrix');

  const proj = getProjectionMatrix(canvas.width/canvas.height, 60, 0.1, 100);
  gl.uniformMatrix4fv(uP, false, new Float32Array(proj));

  let view = identity();
  view = translate(view, 0, 0, -10);
  gl.uniformMatrix4fv(uV, false, new Float32Array(view));

  let model = identity();

  function render(timeMs){
    const t = timeMs * 1;
    model = identity();
    model = rotateX(model, 10);
    model = rotateY(model, t * 0.1);
    model = rotateZ(model, 0);
    gl.uniformMatrix4fv(uM, false, new Float32Array(model));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  window.addEventListener('resize', ()=>{
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0,0,canvas.width,canvas.height);
    const proj = getProjectionMatrix(canvas.width/canvas.height, 60, 0.1, 100);
    gl.uniformMatrix4fv(uP, false, new Float32Array(proj));
  });
}

window.addEventListener('load', main);