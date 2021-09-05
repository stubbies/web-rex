import { PerspectiveCamera } from "three";

export default function createCamera() {
  const camera = new PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 7 );
  camera.lookAt(0,0,0);
  return camera;
}