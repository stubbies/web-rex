import * as THREE from "three";

const defaultOptions = {
  antialias: true,
  alpha: true
}

export default function createRenderer(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({
      canvas,
      ...defaultOptions,
      ...options
    })
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  return renderer;
}