import { HemisphereLight, DirectionalLight } from "three";

export default function createLights(scene) {
  const light = new HemisphereLight(0xf6e86d, 0x404040, 0.8);
  light.position.set( 0, 50, 0 );
  scene.add(light)
  const dirLight = new DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set( -1, 2.75, 2 );
  dirLight.position.multiplyScalar( 30 );
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  const d = 50;
  dirLight.shadow.camera.left = - d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = - d;
  dirLight.shadow.camera.far = 3500;
  dirLight.shadow.bias = - 0.0001;
  scene.add(dirLight)
  return dirLight
}