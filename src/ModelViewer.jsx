import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function ModelViewer({ color, lens }) {
  const container = useRef(null);
  const modelMaterials = useRef(null);
  const currentSelection = useRef({ color, lens });
  const resetCamera = useRef(() => {});
  const [status, setStatus] = useState('Loading your frame…');
  currentSelection.current = { color, lens };
  useEffect(() => {
    const host = container.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setStatus('The 3D preview requires WebGL. Please try another browser.'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf4f3ef, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Glasses model. Drag to orbit and pinch or scroll to zoom.');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.85;
    room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc4b9a9, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.55);
    key.position.set(3, 5, 4); scene.add(key);
    let disposed = false;
    let model;
    let bounds;
    const release = (root) => {
      const textures = new Set(); const materials = new Set();
      root.traverse((mesh) => { mesh.geometry?.dispose(); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => materials.add(m)); });
      materials.forEach((m) => { Object.values(m).forEach((v) => { if (v?.isTexture) textures.add(v); }); m.dispose(); });
      textures.forEach((t) => t.dispose());
    };
    const fitCamera = () => {
      if (!bounds) return;
      const radius = bounds.getSize(new THREE.Vector3()).length() / 2;
      const center = bounds.getCenter(new THREE.Vector3());
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const fitFov = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect));
      const distance = radius / Math.sin(fitFov / 2) * 0.87975;
      controls.target.copy(center);
      const sideAngle = THREE.MathUtils.degToRad(28);
      const polarAngle = controls.maxPolarAngle;
      const viewDirection = new THREE.Vector3(
        Math.cos(sideAngle) * Math.sin(polarAngle),
        Math.cos(polarAngle),
        Math.sin(sideAngle) * Math.sin(polarAngle),
      );
      camera.position.copy(center).add(viewDirection.multiplyScalar(distance));
      camera.far = Math.max(100, distance * 10); camera.updateProjectionMatrix();
      controls.minDistance = radius * 1.4; controls.maxDistance = distance * 2.5;
      controls.update(); controls.saveState();
    };
    resetCamera.current = fitCamera;
    new GLTFLoader().load('/models/Glasses.glb', (gltf) => {
      if (disposed) { release(gltf.scene); return; }
      model = gltf.scene;
      const frame = new THREE.MeshPhysicalMaterial({ color: currentSelection.current.color, roughness: 0.28, metalness: 0, clearcoat: 0.65, clearcoatRoughness: 0.2 });
      const glass = new THREE.MeshPhysicalMaterial({ color: currentSelection.current.lens.value, transmission: currentSelection.current.lens.transmission, roughness: 0.005, metalness: 0, ior: 1.5, thickness: 0.025, side: THREE.DoubleSide });
      const productBounds = new THREE.Box3(); model.updateMatrixWorld(true);
      model.traverse((mesh) => {
        if (!mesh.isMesh) return;
        const old = mesh.material;
        if (mesh.name === 'Frame' || mesh.name === 'Lenses') {
          mesh.material = mesh.name === 'Frame' ? frame : glass;
          productBounds.union(new THREE.Box3().setFromObject(mesh)); old.dispose();
        } else if (mesh.name === 'ShadowPlane') {
          mesh.material = new THREE.MeshBasicMaterial({ map: old.map, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }); old.dispose();
        }
      });
      bounds = productBounds; modelMaterials.current = { frame, glass };
      scene.add(model); fitCamera(); setStatus('');
    }, undefined, () => { if (!disposed) setStatus('Couldn’t load the model. Please refresh to try again.'); });
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
      fitCamera();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
    return () => { disposed = true; observer.disconnect(); renderer.setAnimationLoop(null); controls.dispose(); if (model) release(model); modelMaterials.current = null; environment.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  useEffect(() => {
    if (!modelMaterials.current) return;
    modelMaterials.current.frame.color.set(color);
    modelMaterials.current.glass.color.set(lens.value);
    modelMaterials.current.glass.transmission = lens.transmission;
  }, [color, lens]);
  return <div className="model-viewer"><div className="canvas-host" ref={container} />{status && <p className="viewer-status" role="status">{status}</p>}<button type="button" className="reset-view" onClick={() => resetCamera.current()} aria-label="Reset camera view">↺ <span>Reset view</span></button></div>;
}
