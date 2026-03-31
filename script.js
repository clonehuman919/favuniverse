// ==========================================
// === KÜTÜPHANELER (GÜVENLİ CDN GEÇİŞİ) ===
// ==========================================
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, PerspectiveCamera, Points, RawShaderMaterial, Scene, WebGLRenderer, Vector3, DoubleSide, Mesh, ShaderMaterial, HalfFloatType, RepeatWrapping, MathUtils } from "three-old";
import { OrbitControls } from "three-old/addons/controls/OrbitControls.js";
import * as TWEEN from "tween";

// PEMBE SAHNE İÇİN (Importmap CDN - Sürüm 0.162.0)
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

// ==========================================
// === ARAYÜZ VE SAHNE GEÇİŞ KONTROLÜ ===
// ==========================================
const magicBtn = document.getElementById('magic-trigger');
const backBtn = document.getElementById('back-trigger');
const pinkScene = document.getElementById('scene-pink');
const galaxyScene = document.getElementById('scene-galaxy');
window.currentActiveScene = 'pink';

// 1. Sihirli Yıldıza Tıklanınca (Galaksiye Geç)
magicBtn.addEventListener('click', () => {
  document.body.className = 'theme-black';
  pinkScene.style.display = 'none';
  galaxyScene.style.display = 'block';
  
  // Arayüz geçişi
  magicBtn.style.display = 'none'; // Yıldızı gizle
  backBtn.style.display = 'flex';  // Geri okunu göster
  
  window.currentActiveScene = 'galaxy';
});

// 2. Geri Okuna Tıklanınca (Kuşlara Dön)
backBtn.addEventListener('click', () => {
  document.body.className = 'theme-pink';
  galaxyScene.style.display = 'none';
  pinkScene.style.display = 'block';
  
  // Arayüz geçişi
  backBtn.style.display = 'none';   // Geri okunu gizle
  magicBtn.style.display = 'block'; // Yıldızı tekrar göster
  
  window.currentActiveScene = 'pink';
});


// ==========================================
// === 1. REACT & ANIME.JS YILDIZ KODLARI (PEMBE SAHNE) ===
// ==========================================
function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} 

class StarrySky extends React.Component {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "state", { num: 60, vw: Math.max(document.documentElement.clientWidth, window.innerWidth || 0), vh: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) });
    _defineProperty(this, "starryNight", () => { anime({ targets: ["#sky .star"], opacity: [{duration: 700, value: "0"}, {duration: 700, value: "1"}], easing: "linear", loop: true, delay: (el, i) => 50 * i }); });
    _defineProperty(this, "shootingStars", () => { anime({ targets: ["#shootingstars .wish"], easing: "linear", loop: true, delay: (el, i) => 1000 * i, opacity: [{duration: 700, value: "1"}], width: [{value: "150px"}, {value: "0px"}], translateX: 350 }); });
    _defineProperty(this, "randomRadius", () => Math.random() * 0.7 + 0.6);
    _defineProperty(this, "getRandomX", () => Math.floor(Math.random() * Math.floor(this.state.vw)).toString());
    _defineProperty(this, "getRandomY", () => Math.floor(Math.random() * Math.floor(this.state.vh)).toString());
  }
  componentDidMount() { this.starryNight(); this.shootingStars(); }
  render() {
    const { num } = this.state;
    return React.createElement("div", { id: "App" }, 
      React.createElement("svg", { id: "sky" }, [...Array(num)].map((x, y) => React.createElement("circle", { cx: this.getRandomX(), cy: this.getRandomY(), r: this.randomRadius(), stroke: "none", strokeWidth: "0", fill: "white", key: y, className: "star" }))), 
      React.createElement("div", { id: "shootingstars" }, [...Array(60)].map((x, y) => React.createElement("div", { key: y, className: "wish", style: { left: `${this.getRandomY()}px`, top: `${this.getRandomX()}px` } })))
    );
  }
}
ReactDOM.render(React.createElement(StarrySky, null), document.getElementById("root"));


// ==========================================
// === 2. THREE.JS KUŞ KODLARI (PEMBE SAHNE) ===
// ==========================================
!(function () {
  const canvasBirds = document.getElementById('canvas-birds');
  function n() { (h = window.innerWidth / 2), (y = window.innerHeight / 2), (u.aspect = window.innerWidth / window.innerHeight), u.updateProjectionMatrix(), m.setSize(window.innerWidth, window.innerHeight); }
  function t(e) { !1 !== e.isPrimary && ((v = e.clientX - h), (p = e.clientY - y)); }
  const o = { color1: "pink", color2: "hotpink", colorMode: "lerpGradient", alphaBackground: !0, separation: 21, alignment: 20, cohesion: 20, freedom: 0.75, speedLimit: 10, birdSize: 1, wingSpan: 20, numRatio: 0.3 };
  
  const _startDate = new Date('2026-03-25'); _startDate.setHours(0, 0, 0, 0);
  const _today = new Date(); _today.setHours(0, 0, 0, 0);
  const _daysElapsed = Math.max(0, Math.floor((_today - _startDate) / 86400000)) + 1;
  const _birdCount = Math.min(85 + _daysElapsed, 1024); 
  o.numRatio = _birdCount / (32 * 32);

  const i = 32, r = Math.round(i * i * o.numRatio);
  const a = "uniform float time;\nuniform float delta;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec4 tmpPos = texture2D( texturePosition, uv );\n  vec3 position = tmpPos.xyz;\n  vec3 velocity = texture2D( textureVelocity, uv ).xyz;\n\n  float phase = tmpPos.w;\n\n  phase = mod( ( phase + delta +\n    length( velocity.xz ) * delta * 3. +\n    max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );\n\n  gl_FragColor = vec4( position + velocity * delta * 15. , phase );\n\n}";
  const l = "uniform float time;\nuniform float testing;\nuniform float delta;\nuniform float separationDistance;\nuniform float alignmentDistance;\nuniform float cohesionDistance;\nuniform float speedLimit;\nuniform float freedomFactor;\nuniform vec3 predator;\n\nconst float width = resolution.x;\nconst float height = resolution.y;\n\nconst float PI = 3.141592653589793;\nconst float PI_2 = PI * 2.0;\n\nfloat zoneRadius = 40.0;\nfloat zoneRadiusSquared = 1600.0;\n\nfloat separationThresh = 0.45;\nfloat alignmentThresh = 0.65;\n\nconst float UPPER_BOUNDS = BOUNDS;\nconst float LOWER_BOUNDS = -UPPER_BOUNDS;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\n  zoneRadius = separationDistance + alignmentDistance + cohesionDistance;\n  separationThresh = separationDistance / zoneRadius;\n  alignmentThresh = ( separationDistance + alignmentDistance ) / zoneRadius;\n  zoneRadiusSquared = zoneRadius * zoneRadius;\n\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec3 birdPosition, birdVelocity;\n\n  vec3 selfPosition = texture2D( texturePosition, uv ).xyz;\n  vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;\n\n  float dist;\n  vec3 dir;\n  float distSquared;\n\n  float f;\n  float percent;\n\n  vec3 velocity = selfVelocity;\n\n  float limit = speedLimit;\n  \n  dir = predator * UPPER_BOUNDS - selfPosition;\n  dir.z = 0.;\n  dist = length( dir );\n  distSquared = dist * dist;\n\n  float preyRadius = 150.0;\n  float preyRadiusSq = preyRadius * preyRadius;\n\n  if (dist < preyRadius) {\n    f = ( distSquared / preyRadiusSq - 1.0 ) * delta * 100.;\n    velocity += normalize( dir ) * f;\n    limit += 5.0;\n  }\n\n  vec3 central = vec3( 0., 0., 0. );\n  dir = selfPosition - central;\n  dist = length( dir );\n\n  dir.y *= 2.5;\n  velocity -= normalize( dir ) * delta * 5.;\n\n  for (float y=0.0;y<height;y++) {\n    for (float x=0.0;x<width;x++) {\n\n      vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;\n      birdPosition = texture2D( texturePosition, ref ).xyz;\n\n      dir = birdPosition - selfPosition;\n      dist = length(dir);\n\n      if (dist < 0.0001) continue;\n\n      distSquared = dist * dist;\n\n      if (distSquared > zoneRadiusSquared ) continue;\n\n      percent = distSquared / zoneRadiusSquared;\n\n      if ( percent < separationThresh ) {\n        f = (separationThresh / percent - 1.0) * delta;\n        velocity -= normalize(dir) * f;\n      } else if ( percent < alignmentThresh ) {\n        float threshDelta = alignmentThresh - separationThresh;\n        float adjustedPercent = ( percent - separationThresh ) / threshDelta;\n        birdVelocity = texture2D( textureVelocity, ref ).xyz;\n        f = ( 0.5 - cos( adjustedPercent * PI_2 ) * 0.5 + 0.5 ) * delta;\n        velocity += normalize(birdVelocity) * f;\n      } else {\n        float threshDelta = 1.0 - alignmentThresh;\n        float adjustedPercent = ( percent - alignmentThresh ) / threshDelta;\n        f = ( 0.5 - ( cos( adjustedPercent * PI_2 ) * -0.5 + 0.5 ) ) * delta;\n        velocity += normalize(dir) * f;\n      }\n    }\n  }\n\n  if ( length( velocity ) > limit ) {\n    velocity = normalize( velocity ) * limit;\n  }\n\n  gl_FragColor = vec4( velocity, 1.0 );\n}";
  const s = "attribute vec2 reference;\nattribute float birdVertex;\nattribute vec3 birdColor;\nuniform sampler2D texturePosition;\nuniform sampler2D textureVelocity;\nvarying vec4 vColor;\nvarying float z;\nuniform float time;\nuniform float birdSize;\n\nvoid main() {\n  vec4 tmpPos = texture2D( texturePosition, reference );\n  vec3 pos = tmpPos.xyz;\n  vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);\n  vec3 newPosition = position;\n\n  if ( birdVertex == 4.0 || birdVertex == 7.0 ) {\n    newPosition.y = sin( tmpPos.w ) * 5. * birdSize;\n  }\n\n  newPosition = mat3( modelMatrix ) * newPosition;\n  velocity.z *= -1.;\n  float xz = length( velocity.xz );\n  float xyz = 1.;\n  float x = sqrt( 1. - velocity.y * velocity.y );\n  float cosry = velocity.x / xz;\n  float sinry = velocity.z / xz;\n  float cosrz = x / xyz;\n  float sinrz = velocity.y / xyz;\n\n  mat3 maty =  mat3(cosry, 0, -sinry, 0, 1, 0, sinry, 0, cosry);\n  mat3 matz =  mat3(cosrz , sinrz, 0, -sinrz, cosrz, 0, 0, 0, 1);\n  \n  newPosition =  maty * matz * newPosition;\n  newPosition += pos;\n  z = newPosition.z;\n  vColor = vec4( birdColor, 1.0 );\n  gl_Position = projectionMatrix * viewMatrix  * vec4( newPosition, 1.0 );\n}";
  const d = "varying vec4 vColor;\nvarying float z;\nuniform vec3 color;\nvoid main() {\n  gl_FragColor = vec4( vColor.rgb, 1. );\n}";
  
  class c extends THREE.BufferGeometry {
    constructor() {
      function e() { for (let e = 0; e < arguments.length; e++) l.array[u++] = arguments[e]; }
      function n(e) {
        const n = o; n.colorMode = n.colorMode || "variance";
        const t = n.color1, i = n.color2, r = new THREE.Color(t), a = new THREE.Color(i);
        let l, s;
        if (((s = -1 != n.colorMode.indexOf("Gradient") ? Math.random() : e), 0 == n.colorMode.indexOf("variance"))) {
          const e = THREE.MathUtils.clamp(0, r.r + Math.random() * a.r, 1), n = THREE.MathUtils.clamp(0, r.g + Math.random() * a.g, 1), t = THREE.MathUtils.clamp(0, r.b + Math.random() * a.b, 1);
          l = new THREE.Color(e, n, t);
        } else l = 0 == n.colorMode.indexOf("mix") ? new THREE.Color(t + s * i) : r.lerp(a, s);
        return l;
      }
      super();
      const t = 3 * r, a = 3 * t, l = new THREE.BufferAttribute(new Float32Array(3 * a), 3), s = new THREE.BufferAttribute(new Float32Array(3 * a), 3), d = new THREE.BufferAttribute(new Float32Array(2 * a), 2), c = new THREE.BufferAttribute(new Float32Array(a), 1);
      this.setAttribute("position", l), this.setAttribute("birdColor", s), this.setAttribute("reference", d), this.setAttribute("birdVertex", c);
      let u = 0;
      const f = o.wingSpan, m = o.birdSize;
      for (let n = 0; n < r; n++) e(0, -0, -20 * m, 0, 4 * m, -20 * m, 0, 0, 30 * m), e(0, 0, -15 * m, -f * m, 0, 0, 0, 0, 15 * m), e(0, 0, 15 * m, f * m, 0, 0, 0, 0, -15 * m);
      const v = {};
      for (let e = 0; e < 3 * t; e++) {
        const t = ~~(~~(e / 3) / 3), a = (t % i) / i, l = ~~(t / i) / i, u = ~~(e / 9) / r, f = u.toString(), m = -1 != o.colorMode.indexOf("Gradient");
        let p;
        (p = !m && v[f] ? v[f] : n(u)), m || v[f] || (v[f] = p), (s.array[3 * e + 0] = p.r), (s.array[3 * e + 1] = p.g), (s.array[3 * e + 2] = p.b), (d.array[2 * e] = a), (d.array[2 * e + 1] = l), (c.array[e] = e % 9);
      }
      this.scale(0.2, 0.2, 0.2);
    }
  }
  
  let u, f, m, v = 0, p = 0, h = window.innerWidth / 2, y = window.innerHeight / 2;
  const g = 800, w = g / 2;
  let x, z, R, E, b, P, T = performance.now();
  ((u = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1e3)).position.z = 350);
  (f = new THREE.Scene()), o.alphaBackground || (f.background = new THREE.Color(o.bgColor));
  
  (m = new THREE.WebGLRenderer({ canvas: canvasBirds, alpha: o.alphaBackground })).setPixelRatio(window.devicePixelRatio);
  m.setSize(window.innerWidth, window.innerHeight);
  
  (function () {
    (x = new GPUComputationRenderer(i, i, m)), !1 === m.capabilities.isWebGL2 && x.setDataType(THREE.HalfFloatType);
    const n = x.createTexture(), t = x.createTexture();
    (function (e) {
      const n = e.image.data;
      for (let e = 0, t = n.length; e < t; e += 4) {
        const t = Math.random() * g - w, o = Math.random() * g - w, i = Math.random() * g - w;
        (n[e + 0] = t), (n[e + 1] = o), (n[e + 2] = i), (n[e + 3] = 1);
      }
    })(n),
    (function (e) {
      const n = e.image.data;
      for (let e = 0, t = n.length; e < t; e += 4) {
        const t = Math.random() - 0.5, o = Math.random() - 0.5, i = Math.random() - 0.5;
        (n[e + 0] = 10 * t), (n[e + 1] = 10 * o), (n[e + 2] = 10 * i), (n[e + 3] = 1);
      }
    })(t),
    (z = x.addVariable("textureVelocity", l, t)), (R = x.addVariable("texturePosition", a, n)),
    x.setVariableDependencies(z, [R, z]), x.setVariableDependencies(R, [R, z]),
    (E = R.material.uniforms), (b = z.material.uniforms),
    (E.time = { value: 0 }), (E.delta = { value: 0 }), (b.time = { value: 1 }), (b.delta = { value: 0 }),
    (b.testing = { value: 1 }), (b.separationDistance = { value: 1 }), (b.alignmentDistance = { value: 1 }),
    (b.cohesionDistance = { value: 1 }), (b.freedomFactor = { value: 1 }), (b.speedLimit = { value: o.speedLimit }),
    (b.predator = { value: new THREE.Vector3() }),
    (z.material.defines.BOUNDS = g.toFixed(2)), (z.wrapS = THREE.RepeatWrapping), (z.wrapT = THREE.RepeatWrapping),
    (R.wrapS = THREE.RepeatWrapping), (R.wrapT = THREE.RepeatWrapping), x.init();
  })();
  
  window.addEventListener("pointermove", t); window.addEventListener("pointerdown", t); window.addEventListener("resize", n);
  (b.separationDistance.value = o.separation), (b.alignmentDistance.value = o.alignment), (b.cohesionDistance.value = o.cohesion);
  
  (function () {
    const e = new c();
    P = { birdSize: { value: o.birdSize }, texturePosition: { value: null }, textureVelocity: { value: null }, time: { value: 1 }, delta: { value: 0 } };
    const n = new THREE.ShaderMaterial({ uniforms: P, vertexShader: s, fragmentShader: d, side: THREE.DoubleSide }), t = new THREE.Mesh(e, n);
    (t.rotation.y = Math.PI / 2), (t.matrixAutoUpdate = !1), t.updateMatrix(), f.add(t);
  })();
  
  (function e() {
    requestAnimationFrame(e);
    if(window.currentActiveScene !== 'pink') return; // Sadece pembe sahne açıksa çalışsın

    const now = performance.now();
    let n = (now - T) / 1e3;
    n > 1 && (n = 1), (T = now),
    (E.time.value = now), (E.delta.value = n), (b.time.value = now), (b.delta.value = n), (P.time.value = now), (P.delta.value = n),
    b.predator.value.set((0.5 * v) / h, (-0.5 * p) / y, 0),
    (v = 1e4), (p = 1e4), x.compute(),
    (P.texturePosition.value = x.getCurrentRenderTarget(R).texture),
    (P.textureVelocity.value = x.getCurrentRenderTarget(z).texture),
    m.render(f, u);
  })();
})();


// ==========================================
// === 3. THREE.JS GALAKSİ KODLARI (TAMAMEN ORİJİNAL) ===
// ==========================================

// --- ZAMAN VE YILDIZ HESABI ---
const startDate = new Date("2004-09-12");
const today = new Date();
const diffInMs = today - startDate;
const starCount = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

// Sayacı ekrana yazdır (Beyaz tema ile uyumlu)
document.getElementById('star-counter').innerText = `STARS: ${starCount.toLocaleString()}`;

// --- SAHNE KURULUMU ---
const canvas = document.querySelector('#canvas-galaxy');
const scene = new Scene()
const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2, 3)

const renderer = new WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const orbit = new OrbitControls(camera, canvas)
orbit.enableDamping = true

const ctx = document.createElement("canvas").getContext("2d")
ctx.canvas.width = ctx.canvas.height = 32
ctx.fillStyle = "#000"
ctx.fillRect(0, 0, 32, 32)
let grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
grd.addColorStop(0.0, "#fff")
grd.addColorStop(1.0, "#000")
ctx.fillStyle = grd
ctx.beginPath()
ctx.rect(15, 0, 2, 32)
ctx.fill()
ctx.beginPath()
ctx.rect(0, 15, 32, 2)
ctx.fill()
grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
grd.addColorStop(0.1, "#ffff")
grd.addColorStop(0.6, "#0000")
ctx.fillStyle = grd
ctx.fillRect(0, 0, 32, 32)
const alphaMap = new CanvasTexture(ctx.canvas)

const galaxyGeometry = new BufferGeometry()
const galaxyPosition = new Float32Array(starCount * 3)
const galaxySeed = new Float32Array(starCount * 3)
const galaxySize = new Float32Array(starCount)

for (let i = 0; i < starCount; i++) {
  galaxyPosition[i * 3] = i / starCount
  galaxySeed[i * 3 + 0] = Math.random()
  galaxySeed[i * 3 + 1] = Math.random()
  galaxySeed[i * 3 + 2] = Math.random()
  galaxySize[i] = Math.random() * 2 + 0.5
}
galaxyGeometry.setAttribute("position", new BufferAttribute(galaxyPosition, 3))
galaxyGeometry.setAttribute("size", new BufferAttribute(galaxySize, 1))
galaxyGeometry.setAttribute("seed", new BufferAttribute(galaxySeed, 3))

const galaxyMaterial = new RawShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: 0 },
    uBranches: { value: 5 },
    uRadius: { value: 0 },
    uSpin: { value: 0 },
    uRandomness: { value: 0 },
    uAlphaMap: { value: alphaMap },
    uColorInn: { value: new Color("#ff4400") },
    uColorOut: { value: new Color("#ff75f4") },
  },
  vertexShader: `
precision highp float;
attribute vec3 position;
attribute float size;
attribute vec3 seed;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime;
uniform float uSize;
uniform float uBranches;
uniform float uRadius;
uniform float uSpin;
uniform float uRandomness;
varying float vDistance;
#define PI 3.14159265359
#define PI2 6.28318530718
#include <random, scatter>
void main() {
  vec3 p = position;
  float st = sqrt(p.x);
  float qt = p.x * p.x;
  float mt = mix(st, qt, p.x);
  float angle = qt * uSpin * (2.0 - sqrt(1.0 - qt));
  float branchOffset = (PI2 / uBranches) * floor(seed.x * uBranches);
  p.x = position.x * cos(angle + branchOffset) * uRadius;
  p.z = position.x * sin(angle + branchOffset) * uRadius;
  p += scatter(seed) * random(seed.zx) * uRandomness * mt;
  p.y *= 0.5 + qt * 0.5;
  vec3 temp = p;
  float ac = cos(-uTime * (2.0 - st) * 0.5);
  float as = sin(-uTime * (2.0 - st) * 0.5);
  p.x = temp.x * ac - temp.z * as;
  p.z = temp.x * as + temp.z * ac;
  vDistance = mt;
  vec4 mvp = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvp;
  gl_PointSize = (10.0 * size * uSize) / -mvp.z;
}`,
  fragmentShader: `
precision highp float;
uniform vec3 uColorInn;
uniform vec3 uColorOut;
uniform sampler2D uAlphaMap;
varying float vDistance;
#define PI 3.14159265359
void main() {
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  float a = texture2D(uAlphaMap, uv).g;
  if (a < 0.1) discard;
  vec3 color = mix(uColorInn, uColorOut, vDistance);
  float c = step(0.99, (sin(gl_PointCoord.x * PI) + sin(gl_PointCoord.y * PI)) * 0.5);
  color = max(color, vec3(c));
  gl_FragColor = vec4(color, a);
}`,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: AdditiveBlending,
})

const shaderUtils = `
float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
vec3 scatter (vec3 seed) {
  float u = random(seed.xy);
  float v = random(seed.yz);
  float theta = u * 6.28318530718;
  float phi = acos(2.0 * v - 1.0);
  return vec3(sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi));
}`

const galaxy = new Points(galaxyGeometry, galaxyMaterial)
galaxy.material.onBeforeCompile = (sh) => sh.vertexShader = sh.vertexShader.replace("#include <random, scatter>", shaderUtils)
scene.add(galaxy)

const universeGeometry = new BufferGeometry()
const uniCount = Math.floor(starCount / 2);
const uniSeed = new Float32Array(uniCount * 3)
const uniSize = new Float32Array(uniCount)
for (let i = 0; i < uniCount; i++) {
  uniSeed[i * 3 + 0] = Math.random()
  uniSeed[i * 3 + 1] = Math.random()
  uniSeed[i * 3 + 2] = Math.random()
  uniSize[i] = Math.random() * 2 + 0.5
}
universeGeometry.setAttribute("position", new BufferAttribute(new Float32Array(uniCount * 3), 3))
universeGeometry.setAttribute("seed", new BufferAttribute(uniSeed, 3))
universeGeometry.setAttribute("size", new BufferAttribute(uniSize, 1))

const universeMaterial = new RawShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uSize: galaxyMaterial.uniforms.uSize,
    uRadius: galaxyMaterial.uniforms.uRadius,
    uAlphaMap: { value: alphaMap },
  },
  vertexShader: `
precision highp float;
attribute vec3 seed;
attribute float size;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime;
uniform float uSize;
uniform float uRadius;
#include <random, scatter>
void main() {
  vec3 p = scatter(seed) * 3.0 * vec3(2.1, 1.3, 2.1);
  float q = random(seed.zx);
  for (int i = 0; i < 3; i++) q *= q;
  p *= q;
  float l = length(p) / 6.3;
  p = l < 0.001 ? (p / l) : p;
  vec3 temp = p;
  float ql = pow(1.0 - l, 3.0);
  float ac = cos(-uTime * ql);
  float as = sin(-uTime * ql);
  p.x = temp.x * ac - temp.z * as;
  p.z = temp.x * as + temp.z * ac;
  vec4 mvp = modelViewMatrix * vec4(p * uRadius, 1.0);
  gl_Position = projectionMatrix * mvp;
  gl_PointSize = (3.0 * size * uSize * pow(2.0 - l, 2.0)) / -mvp.z;
}`,
  fragmentShader: `precision highp float; uniform sampler2D uAlphaMap; void main() { vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y); float a = texture2D(uAlphaMap, uv).g; if (a < 0.1) discard; gl_FragColor = vec4(vec3(1.0), a); }`,
  transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending,
})

const universe = new Points(universeGeometry, universeMaterial)
universe.material.onBeforeCompile = (sh) => sh.vertexShader = sh.vertexShader.replace("#include <random, scatter>", shaderUtils)
scene.add(universe)

// --- AÇILIŞ ANİMASYONU ---
new TWEEN.Tween({ s: 0, r: 0, sp: 0, rnd: 0, rot: 0 })
.to({ s: 1.34, r: 1.618, sp: -11.68, rnd: 0.7, rot: Math.PI * 4 }, 5000)
.easing(TWEEN.Easing.Cubic.InOut)
.onUpdate((obj) => {
  galaxyMaterial.uniforms.uSize.value = obj.s
  galaxyMaterial.uniforms.uRadius.value = obj.r
  galaxyMaterial.uniforms.uSpin.value = obj.sp
  galaxyMaterial.uniforms.uRandomness.value = obj.rnd
  galaxy.rotation.y = obj.rot
  universe.rotation.y = obj.rot / 3
}).start()

renderer.setAnimationLoop(() => {
  // Sadece galaksi sahnesi açıksa animasyonu oynat
  if (window.currentActiveScene === 'galaxy') {
    galaxyMaterial.uniforms.uTime.value += 0.0005
    universeMaterial.uniforms.uTime.value += 0.0003
    TWEEN.update()
    orbit.update()
    renderer.render(scene, camera)
  }
})

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
