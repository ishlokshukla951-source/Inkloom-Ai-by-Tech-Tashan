import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Rotate3d,
  Layers,
  Palette,
  Camera,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  Eye,
  Sliders,
} from 'lucide-react';

interface ThreeBrandSceneViewProps {
  onBackToDashboard?: () => void;
}

type MaterialFinish = 'titanium' | 'obsidian' | 'gold' | 'cobalt';
type CameraView = 'hero' | 'top' | 'core' | 'front';

export const ThreeBrandSceneView: React.FC<ThreeBrandSceneViewProps> = ({
  onBackToDashboard,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI state for bottom dock
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 (assembled) to 1 (fully exploded)
  const [currentFinish, setCurrentFinish] = useState<MaterialFinish>('titanium');
  const [currentCameraView, setCurrentCameraView] = useState<CameraView>('hero');
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Mutable refs to bridge React state to Three.js loop without re-triggering useEffect
  const stateRef = useRef({
    explodedTarget: 0,
    explodedCurrent: 0,
    finish: 'titanium' as MaterialFinish,
    cameraView: 'hero' as CameraView,
    autoRotate: true,
    targetCamPos: new THREE.Vector3(7, 5, 8),
    targetLookAt: new THREE.Vector3(0, 1.8, 0),
  });

  // Keep stateRef in sync with React state
  useEffect(() => {
    stateRef.current.explodedTarget = explodedFactor;
  }, [explodedFactor]);

  useEffect(() => {
    stateRef.current.finish = currentFinish;
  }, [currentFinish]);

  useEffect(() => {
    stateRef.current.autoRotate = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    stateRef.current.cameraView = currentCameraView;
    if (currentCameraView === 'hero') {
      stateRef.current.targetCamPos.set(7, 4.8, 8);
      stateRef.current.targetLookAt.set(0, 1.8, 0);
    } else if (currentCameraView === 'top') {
      stateRef.current.targetCamPos.set(0.1, 10, 0.1);
      stateRef.current.targetLookAt.set(0, 1.5, 0);
    } else if (currentCameraView === 'core') {
      stateRef.current.targetCamPos.set(2.8, 2.2, 3.2);
      stateRef.current.targetLookAt.set(0, 2.0, 0);
    } else if (currentCameraView === 'front') {
      stateRef.current.targetCamPos.set(0, 2.2, 9.5);
      stateRef.current.targetLookAt.set(0, 2.0, 0);
    }
  }, [currentCameraView]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software-WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);
    scene.fog = new THREE.Fog(0x0b0f19, 14, 38);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(7, 4.8, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (Warm Key + Cool Hemisphere Fill)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
    keyLight.position.set(8, 12, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 30;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x6366f1, 0x0f172a, 1.2);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    rimLight.position.set(-8, 6, -8);
    scene.add(rimLight);

    // 5. Procedural Ground Dial Texture
    const createFloorDialTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      ctx.clearRect(0, 0, 1024, 1024);
      const cx = 512;
      const cy = 512;

      // Concentric governance dial tracks
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 480, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 380, 0, Math.PI * 2);
      ctx.arc(cx, cy, 260, 0, Math.PI * 2);
      ctx.stroke();

      // Degree tick marks
      for (let i = 0; i < 360; i += 5) {
        const rad = (i * Math.PI) / 180;
        const isMajor = i % 30 === 0;
        const len = isMajor ? 24 : 10;
        const r1 = 480;
        const r2 = r1 - len;

        ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
        ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
        ctx.stroke();
      }

      // Cardinal Governance Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TRUTH CORE · INKLOOM', cx, cy - 430);
      ctx.fillText('DETERMINISTIC RULE ENGINE', cx + 430, cy);
      ctx.fillText('SEMANTIC GEMINI PIPELINE', cx, cy + 430);
      ctx.fillText('REGULATORY DISCLOSURES', cx - 430, cy);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    // Ground Disc with Dial Texture
    const floorGeo = new THREE.CircleGeometry(6, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createFloorDialTexture(),
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    floorMat.polygonOffset = true;
    floorMat.polygonOffsetFactor = -1;
    floorMat.polygonOffsetUnits = -1;
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0.02;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Radial Contact Shadow Plane
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 256;
    contactCanvas.height = 256;
    const cCtx = contactCanvas.getContext('2d')!;
    const cGrad = cCtx.createRadialGradient(128, 128, 10, 128, 128, 128);
    cGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    cGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    cCtx.fillStyle = cGrad;
    cCtx.fillRect(0, 0, 256, 256);

    const contactTex = new THREE.CanvasTexture(contactCanvas);
    const contactGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.y = 0.01;
    scene.add(contactMesh);

    // 6. Assemble Composite 8-Part Procedural Model (THREE.Group)
    // "The Inkloom Brand Governance Monolith"
    const monolithGroup = new THREE.Group();
    scene.add(monolithGroup);

    // Materials Palette Dictionary
    const getFinishProps = (finish: MaterialFinish) => {
      switch (finish) {
        case 'obsidian':
          return {
            primaryColor: 0x18181b,
            primaryMetalness: 0.9,
            primaryRoughness: 0.2,
            accentColor: 0x6366f1,
            coreColor: 0xa855f7,
          };
        case 'gold':
          return {
            primaryColor: 0xd4af37,
            primaryMetalness: 0.95,
            primaryRoughness: 0.18,
            accentColor: 0xffffff,
            coreColor: 0xf59e0b,
          };
        case 'cobalt':
          return {
            primaryColor: 0x1e3a8a,
            primaryMetalness: 0.85,
            primaryRoughness: 0.22,
            accentColor: 0x38bdf8,
            coreColor: 0x06b6d4,
          };
        case 'titanium':
        default:
          return {
            primaryColor: 0x94a3b8,
            primaryMetalness: 0.92,
            primaryRoughness: 0.15,
            accentColor: 0x6366f1,
            coreColor: 0x38bdf8,
          };
      }
    };

    const initialProps = getFinishProps('titanium');

    // Part 1: Stepped Base Pedestal (Primary silhouette)
    const baseGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.45, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.6,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.225;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    monolithGroup.add(baseMesh);

    // Part 2: Lower Chamfered Vault Plinth
    const plinthGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.4, 8);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: initialProps.primaryColor,
      metalness: initialProps.primaryMetalness,
      roughness: initialProps.primaryRoughness,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = 0.65;
    plinthMesh.castShadow = !isSoftwareGl;
    monolithGroup.add(plinthMesh);

    // Part 3: Octagonal Governance Vault Body (Primary Silhouette)
    const bodyGeo = new THREE.CylinderGeometry(1.2, 1.45, 1.8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: initialProps.primaryColor,
      metalness: initialProps.primaryMetalness,
      roughness: initialProps.primaryRoughness,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 1.75;
    bodyMesh.castShadow = !isSoftwareGl;
    monolithGroup.add(bodyMesh);

    // Part 4: Inner Sentinel Gimbal Ring (Rule Engine Axis - Secondary Read)
    const innerRingGeo = new THREE.TorusGeometry(1.85, 0.08, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: initialProps.accentColor,
      metalness: 0.95,
      roughness: 0.12,
      emissive: initialProps.accentColor,
      emissiveIntensity: 0.25,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, ringMat);
    innerRingMesh.position.y = 2.1;
    innerRingMesh.rotation.x = Math.PI / 4;
    monolithGroup.add(innerRingMesh);

    // Part 5: Outer Sentinel Gimbal Ring (Semantic Gemini Horizon - Secondary Read)
    const outerRingGeo = new THREE.TorusGeometry(2.35, 0.06, 16, 64);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xc7d2fe,
      metalness: 0.98,
      roughness: 0.1,
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.position.y = 2.1;
    outerRingMesh.rotation.y = Math.PI / 3;
    monolithGroup.add(outerRingMesh);

    // Part 6: Floating Crystalline "Truth Core" (Octahedron with Emissive Glow)
    const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: initialProps.coreColor,
      emissive: initialProps.coreColor,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 2.1;
    monolithGroup.add(coreMesh);

    // Part 7: Top Laser Alignment Crown with Emitter Ring
    const crownGeo = new THREE.CylinderGeometry(0.9, 1.2, 0.35, 8);
    const crownMat = new THREE.MeshStandardMaterial({
      color: initialProps.primaryColor,
      metalness: initialProps.primaryMetalness,
      roughness: initialProps.primaryRoughness,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.y = 2.85;
    crownMesh.castShadow = !isSoftwareGl;
    monolithGroup.add(crownMesh);

    // Part 8: 4 Accent Anchor Pylons (Accent details)
    const pylonGroup = new THREE.Group();
    const pylonGeo = new THREE.BoxGeometry(0.18, 1.1, 0.18);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.3,
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(Math.cos(angle) * 1.9, 0.8, Math.sin(angle) * 1.9);
      pylon.castShadow = !isSoftwareGl;
      pylonGroup.add(pylon);
    }
    monolithGroup.add(pylonGroup);

    // Keep references to update materials and exploded positions
    const parts = {
      baseMesh,
      plinthMesh,
      bodyMesh,
      innerRingMesh,
      outerRingMesh,
      coreMesh,
      crownMesh,
      pylonGroup,
    };

    // 7. Interaction: Mouse drag to rotate camera orbit
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraOrbit = { azimuth: 0.85, elevation: 0.38, distance: 13.5 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraOrbit.azimuth -= deltaX * 0.006;
      cameraOrbit.elevation = Math.max(0.1, Math.min(1.4, cameraOrbit.elevation + deltaY * 0.006));

      previousMousePosition = { x: e.clientX, y: e.clientY };
      stateRef.current.autoRotate = false;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domCanvas = renderer.domElement;
    domCanvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Handle Window Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 8. Animation & Render Loop with Software-WebGL pacing
    let frameId = 0;
    let lastTime = performance.now();
    let currentLookAt = new THREE.Vector3(0, 1.8, 0);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const clock = new THREE.Clock();

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const state = stateRef.current;

      // Exponential damping for Exploded View separation
      state.explodedCurrent = THREE.MathUtils.damp(
        state.explodedCurrent,
        state.explodedTarget,
        6,
        delta
      );
      const ef = state.explodedCurrent;

      // Apply exploded offsets to parts
      parts.crownMesh.position.y = 2.85 + ef * 1.6;
      parts.bodyMesh.position.y = 1.75 + ef * 0.8;
      parts.innerRingMesh.position.y = 2.1 + ef * 0.4;
      parts.innerRingMesh.scale.setScalar(1 + ef * 0.4);
      parts.outerRingMesh.position.y = 2.1 + ef * 0.15;
      parts.outerRingMesh.scale.setScalar(1 + ef * 0.25);
      parts.coreMesh.position.y = 2.1 + ef * 1.1;
      parts.plinthMesh.position.y = 0.65 - ef * 0.2;
      parts.pylonGroup.position.y = -ef * 0.35;

      // Gimbal Rings & Core Rotations
      parts.innerRingMesh.rotation.z += delta * 0.8;
      parts.outerRingMesh.rotation.x += delta * 0.5;
      parts.coreMesh.rotation.y += delta * 1.2;
      parts.coreMesh.rotation.x += delta * 0.6;

      // Material finish dynamic sync
      const p = getFinishProps(state.finish);
      (parts.plinthMesh.material as THREE.MeshStandardMaterial).color.setHex(p.primaryColor);
      (parts.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(p.primaryColor);
      (parts.crownMesh.material as THREE.MeshStandardMaterial).color.setHex(p.primaryColor);
      (parts.innerRingMesh.material as THREE.MeshStandardMaterial).color.setHex(p.accentColor);
      (parts.innerRingMesh.material as THREE.MeshStandardMaterial).emissive.setHex(p.accentColor);
      (parts.coreMesh.material as THREE.MeshPhysicalMaterial).color.setHex(p.coreColor);
      (parts.coreMesh.material as THREE.MeshPhysicalMaterial).emissive.setHex(p.coreColor);

      // Auto-rotation or orbit
      if (state.autoRotate) {
        cameraOrbit.azimuth += delta * 0.25;
      }

      // Smooth camera position damping
      const camTargetX =
        cameraOrbit.distance * Math.cos(cameraOrbit.elevation) * Math.sin(cameraOrbit.azimuth);
      const camTargetY = cameraOrbit.distance * Math.sin(cameraOrbit.elevation);
      const camTargetZ =
        cameraOrbit.distance * Math.cos(cameraOrbit.elevation) * Math.cos(cameraOrbit.azimuth);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, camTargetX, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camTargetY, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, camTargetZ, 4, delta);

      currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, state.targetLookAt.x, 5, delta);
      currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, state.targetLookAt.y, 5, delta);
      currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, state.targetLookAt.z, 5, delta);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    // Start loop
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      domCanvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);

      // Dispose Three.js resources
      renderer.dispose();
      scene.clear();
      if (container.contains(domCanvas)) {
        container.removeChild(domCanvas);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount (100% Unobstructed Center) */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top-Left Minimal Specification Badge */}
      <div className="absolute top-5 left-5 z-20 pointer-events-auto">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-white shadow-xl max-w-xs space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold tracking-tight text-white uppercase whitespace-normal">
              Brand Governance Core Monolith
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Real-time 3D interactive model representing the dual-pipeline architecture: Deterministic Rule Anchor + Gemini Semantic Horizon.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
            <span>PBR Studio Environment</span>
            <span>·</span>
            <span>Composite 8-Part Mesh</span>
          </div>
        </div>
      </div>

      {/* Top-Right Help / Quick Action */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition-colors shadow-lg"
          >
            ← Exit to Dashboard
          </button>
        )}
      </div>

      {/* Ergonomic Bottom Control Dock: Collapsible, <=15% viewport height, centered */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 transition-transform duration-300 pointer-events-auto ${
          isDockCollapsed ? 'translate-y-[calc(100%-2.25rem)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden text-xs text-white">
          {/* Collapse / Expand Toggle Bar */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="w-full py-1.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-between border-b border-slate-700/60 transition-colors"
          >
            <span className="text-[11px] font-medium tracking-wide flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspection Controls & Materials</span>
            </span>
            <span className="text-[10px] font-mono flex items-center gap-1 text-slate-400">
              {isDockCollapsed ? '▴ Show Controls' : '▾ Collapse Dock (Zen Mode)'}
            </span>
          </button>

          {/* Controls Bar Content */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Control 1: Exploded View Separation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Exploded Separation</span>
                </span>
                <span className="font-mono text-indigo-300">{Math.round(explodedFactor * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Control 2: Material Finish Swatches */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Alloy Finish</span>
              </span>
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: 'titanium', label: 'Titanium', color: 'bg-slate-400' },
                    { id: 'obsidian', label: 'Obsidian', color: 'bg-zinc-900 border border-slate-600' },
                    { id: 'gold', label: 'Gold', color: 'bg-amber-400' },
                    { id: 'cobalt', label: 'Cobalt', color: 'bg-blue-600' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCurrentFinish(f.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 border ${
                      currentFinish === f.id
                        ? 'border-indigo-400 bg-indigo-950/80 text-white'
                        : 'border-slate-700 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${f.color}`} />
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Camera Angle Presets */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Camera Angle</span>
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => setCurrentCameraView('hero')}
                  className={`px-2 py-1 rounded border transition-colors ${
                    currentCameraView === 'hero'
                      ? 'border-indigo-400 bg-indigo-950/80 text-white font-semibold'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}
                >
                  Perspective
                </button>
                <button
                  onClick={() => setCurrentCameraView('top')}
                  className={`px-2 py-1 rounded border transition-colors ${
                    currentCameraView === 'top'
                      ? 'border-indigo-400 bg-indigo-950/80 text-white font-semibold'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}
                >
                  Governance Dial
                </button>
              </div>
            </div>

            {/* Control 4: Auto-Orbit Toggle */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Rotate3d className="w-3.5 h-3.5 text-indigo-400" />
                <span>Turntable Motion</span>
              </span>
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`w-full py-1.5 px-3 rounded text-[11px] font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  isAutoRotate
                    ? 'border-indigo-400 bg-indigo-900/60 text-indigo-200'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>{isAutoRotate ? 'Auto-Orbiting' : 'Paused (Manual Drag)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
