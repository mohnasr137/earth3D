import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import getStarfield from "./imports/getStarfield.js";
import { getFresnelMat } from "./imports/getFresnelMat.js";

if (WebGL.isWebGL2Available()) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  document.body.appendChild(renderer.domElement);
  renderer.setAnimationLoop(animate);
  renderer.setSize(width, height);
  camera.position.z = 3;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  controls.minDistance = 1.2;
  controls.maxDistance = 10;
  window.addEventListener("resize", onWindowResize);

  const loader = new THREE.TextureLoader();
  const earthMap = loader.load("./images/earth_atmos_4096.jpg");
  earthMap.colorSpace = THREE.SRGBColorSpace;
  earthMap.anisotropy = 8;
  const earthNigth = loader.load("./images/earth_night_4096.jpg");
  earthNigth.colorSpace = THREE.SRGBColorSpace;
  earthNigth.anisotropy = 8;
  const earthCloud = loader.load("./images/earth_clouds_2048.png");
  earthCloud.colorSpace = THREE.SRGBColorSpace;
  earthCloud.anisotropy = 8;

  const geometry = new THREE.IcosahedronGeometry(1, 16);
  const material = new THREE.MeshStandardMaterial({
    map: earthMap,
  });
  const earth = new THREE.Mesh(geometry, material);
  earth.rotation.z = (-23.5 * Math.PI) / 180;
  scene.add(earth);

  const lightsMat = new THREE.MeshBasicMaterial({
    map: earthNigth,
    blending: THREE.AdditiveBlending,
  });
  const lightsMesh = new THREE.Mesh(geometry, lightsMat);
  earth.add(lightsMesh);

  const cloudsMat = new THREE.MeshStandardMaterial({
    map: earthCloud,
    blending: THREE.AdditiveBlending,
  });
  const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
  cloudsMesh.scale.setScalar(1.005);
  earth.add(cloudsMesh);

  const fresnelMat = getFresnelMat();
  const glowMesh = new THREE.Mesh(geometry, fresnelMat);
  glowMesh.scale.setScalar(1.01);
  earth.add(glowMesh);

  const stars = getStarfield({ numStars: 1500 });
  scene.add(stars);

  const sunLight = new THREE.DirectionalLight(0xffffff, 3);
  sunLight.position.set(-3, 0.75, 1.5);
  scene.add(sunLight);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  function animate() {
    earth.rotation.y += 0.002;
    cloudsMesh.rotation.y += 0.001;
    renderer.render(scene, camera);
    controls.update();
  }
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  document.getElementById("container").appendChild(warning);
}
