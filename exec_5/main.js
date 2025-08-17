var cube;

// Criamos um array para todos os pontos que compõem o cubo. 
// Eles foram separados por linhas que representam os 4 vértices de uma face (6 linhas: uma para cada face).
// Veja que dei um espaço maior entre os valores, para indicar cada um dos vértices.
// Temos, então, 72 valores nesse array, sendo 3 para cada vértice (x, y e z), 4 vértices por face e 6 faces.
// Em seguida, as cores são determinadas para cada um dos pontos criados anteriormente.
// Veja que dividimos visualmente na mesma sequência, para ter uma compreensão mais rápida. 
// Veja os 3 primeiros valores, por exemplo (0, 0, 1), representam o azul, pois têm o menor valor nos canais R e G e o maior no canal B.
// Por fim, temos um array com os índices dos vértices que compõem cada face.
// Se fizermos um relativo com o arquivo OBJ, apresentado no começo da Unidade, 
// podemos perceber que esse Código poderia ser criado fazendo uma varredura das linhas do arquivo, 
// acrescentando os valores encontrados nos vetores correspondentes.
var vertices = [
    -1, -1, -1,        1, -1, -1,     1, 1, -1,    -1,1, -1,
    -1, -1, 1,         1, -1, 1,      1, 1,  1,    -1, 1, 1,
    -1, -1, -1,        -1, 1, -1,     -1, 1,  1,    -1,-1, 1,
     1, -1, -1,         1, 1, -1,      1, 1,  1,     1,-1, 1,
    -1, -1, -1,        -1, -1,  1,    1, -1,  1,    1,-1,-1,
    -1, 1, -1,         -1, 1,  1,     1, 1,   1,    1, 1,-1,
]

var colors = [
    0,0,1,      0,0,1,    0,0,1,    0,0,1, // Azul
    1,0,1,      1,0,1,    1,0,1,    1,0,1,  // rosa
    1,1,1,      1,1,1,    1,1,1,    1,1,1, // branco
    1,0,0,      1,0,0,    1,0,0,    1,0,0, // vermelho
    0,1,0,      0,1,0,    0,1,0,    0,1,0  // verde
    
]

var indexes = [
    0, 1,2,   0,2,3, // face azul
    4, 5,6,   4,6,7, // face rosa
    8, 9,10,  8,10,11, // face branca
    12,13,14, 12,14,15, // face vermelha
    16,17,18, 16,18,19, // face verde
    20,21,22, 20,22,23  // face preta
]


function main() {
    const canvas = document.getElementById('canvas')
    if (!canvas) {
        console.error('Canvas element not found')
        return
    }
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const gl = canvas.getContext('webgl')
    if (!gl) {
        console.error('WebGL not supported')
        return
    }
    
    // Armazenamos os dados dos vértices no buffer de vértices.
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    var vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    // Armazenando dados color no buffer de cores.
    var color_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

    // Armazenando os índices no buffer de índices.
    var index_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW)

    // SHADERS
    const vertCode = `attribute vec3 position;
    uniform mat4 pMatrix;
    uniform mat4 VMatrix;
    uniform mat4 MMatrix;
    attribute vec3 color;
    varying vec3 vColor;
    
    void main(void) {
        gl_Position = pMatrix * VMatrix * MMatrix * vec4(position, 1.0);
        vColor = color;
    }`

    const fragCode = `precision mediump float;
    varying vec3 vColor;
    
    void main(void) {
        gl_FragColor = vec4(vColor, 1.0);
    }`

    const vertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertShader, vertCode)
    gl.compileShader(vertShader)

    const fragSharder = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragSharder, fragCode)
    gl.compileShader(fragSharder)

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertShader)
    gl.attachShader(shaderProgram, fragSharder)
    gl.linkProgram(shaderProgram)

    const pMatrix = gl.getUniformLocation(shaderProgram, 'pMatrix')
    const VMatrix = gl.getUniformLocation(shaderProgram, 'VMatrix')
    const MMatrix = gl.getUniformLocation(shaderProgram, 'MMatrix')

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    const position = gl.getAttribLocation(shaderProgram, 'position')
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)

    // position
    gl.enableVertexAttribArray(position)
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    const color = gl.getAttribLocation(shaderProgram, 'color')
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(color)
    gl.useProgram(shaderProgram)
}

window.onload = main