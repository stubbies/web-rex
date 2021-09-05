import * as THREE from 'three';
import { Body, Box, Plane, Vec3, World, ContactMaterial, Material } from 'cannon-es';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import animate from './utils/animate';
import Controls, { ControlKey } from './Controls';
import createCamera from './utils/createCamera';
import createLights from './utils/createLights';
import createRenderer from './utils/createRenderer';
import createScene from './utils/createScene';
import ground, { groundHelpers } from './utils/ground';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getModels, Model, Enemy } from './utils/models';
import getRandomInt from './utils/helpers';

interface Player {
  group: THREE.Group;
  body: Body;
}

export default class Game {
  config = {
    debug: true
  };
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  stats: Stats;
  light: THREE.DirectionalLight;
  speed = 10;
  jumpVelocity = 550;
  cube: THREE.Mesh;
  platformSize = 2000;
  enemiesSize = 500;
  platform: THREE.Group;
  controls: Controls;
  world: World;
  timeStep = 1 / 60;
  rex: Player = {
    group: new THREE.Group(),
    body: null
  }
  cannonDebug: any;
  enemies: Enemy[] = [];
  groundMaterial = new Material();
  mixer: THREE.AnimationMixer;
  animations: {
    iddle: THREE.AnimationAction;
    run: THREE.AnimationAction;
    jump: THREE.AnimationAction
  }
  models: Model[];
  level = 1;
  lastCallTime: number;
  fixedTimeStep = 1 / 60; // seconds
  maxSubSteps = 10; // Max sub steps to catch up with the wall clock
  runInterval = 0.4;
  isGameOver = false;
  isPlaying = false;
  score = 0
  scoreEl = document.querySelector('.score__value');
  scoreInterval: number
  levelEl = document.querySelector('.level__value');
  levels = ['easy', 'medium', 'hard'];
  ui = document.querySelector('.ui');

  constructor(_options) {
    this.config.debug = window.location.hash === '#debug'
    this.canvas = _options.canvas;
    this.renderer = createRenderer(this.canvas);
    this.scene = createScene();
    this.camera = createCamera();
    this.light = createLights(this.scene);
    this.setupWorld();
    this.addRex();
    this.renderer.render(this.scene, this.camera);
    this.gameControls();

    if (this.config.debug) {
      this.stats = Stats();
      const statsContainer = document.getElementById('stats')
      statsContainer.appendChild(this.stats.dom);
    }

    animate((deltaTime) => {
      if (!this.isGameOver) {
        this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
        if (this.mixer) {
          this.mixer.update(deltaTime);
        }
        if (this.rex.body) {
          if (this.rex.body.position.x > 525) {
            this.rex.body.position.x = -25
            if (this.level < 3) {
              this.speed += 1.5
              this.rex.body.velocity = new Vec3(this.speed, 0, 0)
              this.runInterval -= 0.05
              this.animations.run.setDuration(this.runInterval).play()
              this.level++
              this.levelEl.innerHTML = this.levels[this.level -1]
            }
          }
          this.rex.group.position.set(this.rex.body.position.x, this.rex.body.position.y, this.rex.body.position.z)
          this.rex.group.quaternion.set(this.rex.body.quaternion.x, this.rex.body.quaternion.y, this.rex.body.quaternion.z, this.rex.body.quaternion.w);
          this.camera.position.x = this.rex.body.position.x + 6;
          this.light.position.x = this.rex.body.position.x - 30;
        }
      }
      this.renderer.render(this.scene, this.camera);
      if (this.config.debug) {
        this.stats.update();
      }
    });

    if (window.location.hash === '#retry') {
      this.start()
    } else {
      this.ui.classList.add('menu')
    }
  }

  updateScore() {
    this.scoreInterval = setInterval(() => {
      if (!this.isGameOver) {
        this.score += 1;
        this.scoreEl.innerHTML = String(this.score).padStart(6, '0')
      }
    }, 20)
  }

  addRex() {
    const loader = new GLTFLoader();
    var newMaterial = new THREE.MeshStandardMaterial({ color: 0xff1d6a });
    loader.load('models/rex.glb', (gltf) => {
      gltf.scene.traverse((o: THREE.Mesh) => {
        if (o.material) o.material = newMaterial
      });
      this.mixer = new THREE.AnimationMixer(gltf.scene)
      this.animations = {
        iddle: this.mixer.clipAction(gltf.animations[0]),
        run: this.mixer.clipAction(gltf.animations.find(a => a.name === 'Run')),
        jump: this.mixer.clipAction(gltf.animations.find(a => a.name === 'Jump'))
      }
      this.animations.run.setDuration(this.runInterval).play()
      this.animations.jump.setLoop(THREE.LoopOnce, 1);
      const chara = gltf.scene.children.find(f => f.name === 'Armature')
      chara.rotation.set(0, Math.PI / 0.5, 0);
      chara.scale.set(0.03, 0.03, 0.03);
      chara.children.find(f => f.name === 'Root').children.map(c => {
        if (c.type === 'Mesh') {
          c.castShadow = true;
        } else {
          c.children.map(c2 => {
            if (c2.type === 'Mesh') {
              c2.castShadow = true;
            }
          })
        }
      })
      chara.position.set(0, -0.5, 0);
      this.rex.group.add(chara);
      this.scene.add(this.rex.group);
      this.light.target = this.rex.group
      const shape = new Box(new Vec3(0.4, 0.5, 0.4));
      let mat1 = new Material();
      this.rex.body = new Body({
        mass: 0.5,
        type: Body.DYNAMIC,
        position: new Vec3(-1, 1, 0),
        linearDamping: 0,
        material: mat1
      });

      let mat1_ground = new ContactMaterial(this.groundMaterial, mat1, {
        friction: 0.0,
        restitution: 0.0,
        contactEquationRelaxation: 100,
        frictionEquationStiffness: 100
      });
      this.world.addContactMaterial(mat1_ground);
      this.rex.body.addShape(shape);
      this.world.addBody(this.rex.body);
      this.rex.body.addEventListener("collide", (e: any) => {
        if (e.body.id === 0) { // hit ground
          this.animations.jump.fadeOut(0.1)
        } else { // hit somth
          this.rex.body.linearDamping = 0.5;
          this.rex.body.angularDamping = 0.5;
          this.gameOver();
        }
      });
      // move player
      this.rex.body.velocity = new Vec3(this.speed, 0, 0)
    }, undefined, (error) => {
      console.error(error);
    });
  }

  start() {
    this.rex.body ? this.rex.body.position.x = -25 : null
    this.createPlatform();
    this.isPlaying = true
    this.isGameOver = false
    this.updateScore()
    this.ui.classList.remove('game-over', 'menu')
    this.ui.classList.add('game-on')
  }

  retry() {
    window.location.hash = '#retry';
    window.location.reload()
  }

  gameOver() {
    clearInterval(this.scoreInterval);
    this.isGameOver = true;
    this.ui.classList.remove('game-on')
    this.ui.classList.add('game-over')
    document.body.classList.add('failed')
  }

  setupWorld() {
    this.world = new World();
    this.world.gravity.set(0, -50, 0);
    this.world.allowSleep = true;
    this.world.defaultContactMaterial.friction = 0
    this.world.defaultContactMaterial.restitution = 0.2

    // Ground
    const groundBody = new Body({
      mass: 0,
      material: this.groundMaterial
    });
    const groundShape = new Plane();
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    groundBody.addShape(groundShape);
    this.world.addBody(groundBody);

    const groupMesh = ground(this.platformSize, 1000);
    this.scene.add(groundHelpers())
    this.scene.add(groupMesh);
  }

  createPlatform() {
    getModels()
      .then(models => {
        this.models = models
        this.enemies = this.addModels()
      })
  }

  addModels() {
    const distance = 15
    const arr = []
    let lastCoef = 0;
    this.models.map((m, k) => {
      this.models[k].coef = lastCoef + this.models[k].prob / 100;
      lastCoef = this.models[k].coef;
    })

    for (var i = 0; i < this.enemiesSize; i++) {
      if (i % distance === distance - 1) {
        const m = this.getRandomModel()
        const enemy = m.scene.clone();
        const posOffset = getRandomInt(-1, 2)
        enemy.position.set(i, 0, enemy.position.z + posOffset);
        this.scene.add(enemy);
        const bodies = []
        m.collides.map(c => {
          const body = new Body({
            mass: 0,
            type: Body.STATIC,
            allowSleep: true,
            position: new Vec3(enemy.position.x, c.position.y, c.position.z + (enemy.position.z - 1)),
            shape: c.shape
          });
          this.world.addBody(body);
          bodies.push(body)
        })
        arr.push({
          mesh: enemy,
          body: bodies
        });
      }
    }
    return arr;
  }

  getRandomModel() {
    const randomNum = Math.random();
    for (var i = 0; i < this.models.length; i++) {
      if (randomNum < this.models[i].coef) {
        return this.models[i];
      }
    }
  }

  gameControls() {
    this.controls = new Controls();
    document.addEventListener('onmove', (e: CustomEvent) => {
      const { move, direction } = e.detail
      switch (move) {
        case ControlKey.UP:
          if (this.rex.body.position.z > 0 && this.rex.body.position.y < 0.6) {
            this.rex.body.position.z -= 1;
          }
          break;

        case ControlKey.DOWN:
          if (this.rex.body.position.z < 1 && this.rex.body.position.y < 0.6) {
            this.rex.body.position.z += 1;
          }
          break;

        case ControlKey.JUMP:
          if (this.rex.body.position.y < 0.6) {
            this.animations.jump.stop()
            this.animations.jump.fadeIn(0.1).play()
            this.rex.body.applyForce(new Vec3(0, this.jumpVelocity, 0))
          }
          break;
      }
    }, true)
  }
}