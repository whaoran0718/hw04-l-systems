import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './LSystem';
import Background from './Background';

function hex2vec4(col: string) {
  let hexCol = parseInt(col.slice(1), 16);
  let r = (hexCol >> 16) & 255;
  let g = (hexCol >> 8) & 255;
  let b = hexCol & 255;
  return vec4.fromValues(r / 255.0, g / 255.0, b / 255.0, 1);
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  generation: 7,
  heart_density: 0.5,
  branch_angle: 60,
  heart_color: '#e3564e',
  branch_color: '#393939',
  dot_color: '#d4b5b5',

  get HeartColor() { return hex2vec4(this.heart_color); },
  get BranchColor() { return hex2vec4(this.branch_color); },
  get DotColor() { return hex2vec4(this.dot_color); }
};

let screenQuad: ScreenQuad;
let time: number = 0.0;
let lsys: LSystem;
let curGen: number = controls.generation;
let bg: Background;

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();

  lsys = new LSystem('./obj/cylinder.obj', './obj/heart.obj');
  lsys.branchCol = controls.BranchColor;
  lsys.heartCol = controls.HeartColor;
  lsys.heartThreshold = controls.heart_density;
  lsys.branchAngle = controls.branch_angle;
  lsys.process(controls.generation);

  bg = new Background('./obj/heart.obj');
  bg.heartCol = controls.DotColor;
  bg.render();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, "generation", 0, 7).step(1);
  gui.add(controls, "heart_density", 0, 1);
  gui.add(controls, "branch_angle", 0, 180);
  gui.addColor(controls, "heart_color");
  gui.addColor(controls, "branch_color");
  gui.addColor(controls, "dot_color");

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(30, 15, 30), vec3.fromValues(0, 15, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const flatInstanced = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-instanced-frag.glsl')),
  ]);

  const fallInstanced = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/fall-instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/fall-instanced-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    fallInstanced.setTime(time);
    instancedShader.setTime(time);
    flatInstanced.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if(curGen != controls.generation) {1
      curGen = controls.generation;
      lsys.process(curGen);
    }

    if(lsys.heartThreshold != controls.heart_density) {
      lsys.heartThreshold = controls.heart_density;
      lsys.process(curGen);
    }

    if(lsys.branchAngle != controls.branch_angle) {
      lsys.branchAngle = controls.branch_angle;
      lsys.process(curGen);
    }

    if(!vec4.equals(lsys.branchCol, controls.BranchColor) ||
       !vec4.equals(lsys.heartCol, controls.HeartColor))
    {
      lsys.branchCol = controls.BranchColor;
      lsys.heartCol = controls.HeartColor;
      lsys.render();
    }

    if(!vec4.equals(bg.heartCol, controls.DotColor)) {
      bg.heartCol = controls.DotColor;
      bg.render();
    }

    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, flatInstanced, [bg.heartGeom]);
    renderer.render(camera, instancedShader, [lsys.branchGeom]);
    renderer.render(camera, fallInstanced, [lsys.heartGeom]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
    flatInstanced.setDimensions(window.innerWidth, window.innerHeight);
    bg.render();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);
  flatInstanced.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
