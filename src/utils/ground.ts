import { PlaneGeometry, Group, MeshLambertMaterial, Mesh } from "three";

export default function ground(w: number, h: number) {
  const groundGeometry = new PlaneGeometry(w, h);
  const groundMaterial = new MeshLambertMaterial({ color: 0xffffff });
  groundMaterial.color.setHSL( 0.095, 1, 0.75 );
  const groundMesh = new Mesh(groundGeometry, groundMaterial);
  groundMesh.position.y = 0.0; //this value must be slightly lower than the planeConstant (0.01) parameter above
  groundMesh.rotation.x = - Math.PI / 2;
  groundMesh.receiveShadow = true;
  return groundMesh;
}

export function groundHelpers() {
  const helpers = new Group()
  const groundGeometry = new PlaneGeometry(2000, 1);
  const strip1 = new Mesh(groundGeometry, new MeshLambertMaterial({ color: 0xffffff }));
  strip1.position.y = 0.01;
  strip1.position.z = -1;
  strip1.rotation.x = - Math.PI / 2;
  strip1.material.color.setHSL( 0.095, 1, 0.70 );
  strip1.receiveShadow = true;
  const strip2 = new Mesh(groundGeometry, new MeshLambertMaterial({ color: 0xffffff }));
  strip2.position.y = 0.01;
  strip2.position.z = 0;
  strip2.rotation.x = - Math.PI / 2;
  strip2.material.color.setHSL( 0.095, 1, 0.65 );
  strip2.receiveShadow = true;
  const strip3 = new Mesh(groundGeometry, new MeshLambertMaterial({ color: 0xffffff }));
  strip3.position.y = 0.01;
  strip3.position.z = 1;
  strip3.rotation.x = - Math.PI / 2;
  strip3.material.color.setHSL( 0.095, 1, 0.70 );
  strip3.receiveShadow = true;
  helpers.add(strip1)
  helpers.add(strip2)
  helpers.add(strip3)
  return helpers;
}