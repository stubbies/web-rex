import { Box, Body, Vec3 } from 'cannon-es'
import { Mesh } from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const loader = new GLTFLoader();

export interface Enemy {
  mesh: Mesh;
  body: Body[];
}

export interface Model {
  scene: THREE.Group;
  prob: number;
  coef?: number;
  collides: [{
    shape: Box
    position: Vec3
  }]
}

const models = [
  {
    name: 'cactus1',
    prob: 25,
    collides: [
      {
        shape: new Box(new Vec3(0.30, 1, 0.30)),
        position: new Vec3(0, 1, 1)
      }
    ]
  },
  {
    name: 'cactus2',
    prob: 25,
    collides: [
      {
        shape: new Box(new Vec3(0.30, 0.6, 0.30)),
        position: new Vec3(0, 0.6, 1)
      }
    ]
  },
  {
    name: 'column1',
    prob: 15,
    collides: [
      {
        shape: new Box(new Vec3(0.30, 1.6, 0.30)),
        position: new Vec3(0, 1.6, 1)
      }
    ]
  },
  {
    name: 'column2',
    prob: 15,
    collides: [
      {
        shape: new Box(new Vec3(0.30, 0.6, 0.30)),
        position: new Vec3(0, 0.6, 1)
      }
    ]
  },
  {
    name: 'column3',
    prob: 10,
    collides: [
      {
        shape: new Box(new Vec3(0.30, 2, 0.30)),
        position: new Vec3(0, 2, 1)
      },
      {
        shape: new Box(new Vec3(0.30, 2, 0.30)),
        position: new Vec3(0, 2, -1.6)
      },
      {
        shape: new Box(new Vec3(0.6, 0.5, 4)),
        position: new Vec3(0, 4, 0)
      }
    ]
  },
  {
    name: 'column4',
    prob: 10,
    collides: [
      {
        shape: new Box(new Vec3(0.30, 0.30, 0.30)),
        position: new Vec3(0, 0.5, 0)
      },
      {
        shape: new Box(new Vec3(0.30, 2, 0.30)),
        position: new Vec3(0, 2, 2.2)
      }
    ]
  }
]

export const getModels = async (): Promise<Model[]> => {
  return Promise.all(models.map(model => loadModel(model)))
}

const loadModel = async (model): Promise<Model> => {
  return new Promise((resolve, reject) => {
    loader.load(`models/${model.name}.glb`, (gltf) => {
      gltf.scene.children.map((c, k) => {
        if (c.type === 'Mesh') {
          gltf.scene.children[k].castShadow = true;
          gltf.scene.children[k].receiveShadow = true;
        }
      })
      resolve({
        scene: gltf.scene,
        prob: model.prob,
        collides: model.collides
      });
    });
  });
}

