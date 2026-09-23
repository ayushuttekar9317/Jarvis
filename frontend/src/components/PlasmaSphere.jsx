import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Theme color definitions for the sphere
const THEME_PRESETS = {
  cyan: {
    colorDeep: 0x001433,
    colorMid: 0x0084ff,
    colorBright: 0x00ffe1,
    shellColor: 0x0066ff,
    shellBack: 0x000055,
    lightColor: 0x0088ff,
  },
  quantum: {
    colorDeep: 0x18002e,
    colorMid: 0x9333ea,
    colorBright: 0xf0abfc,
    shellColor: 0xc084fc,
    shellBack: 0x2e0854,
    lightColor: 0xa855f7,
  },
  solar: {
    colorDeep: 0x2e1000,
    colorMid: 0xea580c,
    colorBright: 0xfde047,
    shellColor: 0xf59e0b,
    shellBack: 0x451a03,
    lightColor: 0xf59e0b,
  },
  emerald: {
    colorDeep: 0x002611,
    colorMid: 0x059669,
    colorBright: 0x6ee7b7,
    shellColor: 0x10b981,
    shellBack: 0x022c22,
    lightColor: 0x10b981,
  },
  overdrive: {
    colorDeep: 0x3b020a,
    colorMid: 0xf43f5e,
    colorBright: 0xfef08a,
    shellColor: 0xff0055,
    shellBack: 0x4c0519,
    lightColor: 0xff0055,
  }
};

const noiseFunctions = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    float fbm(vec3 p) {
        float total = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 3; i++) { 
            total += snoise(p * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        return total;
    }
`;

export default function PlasmaSphere({
  audioLevel = 0,
  isTalking = false,
  theme = 'cyan',
  isOverdrive = false,
  interactive = true,
  className = '',
}) {
  const containerRef = useRef(null);
  const audioLevelRef = useRef(audioLevel);
  const isTalkingRef = useRef(isTalking);
  const themeRef = useRef(theme);
  const overdriveRef = useRef(isOverdrive);

  // Keep refs up to date for the animation loop
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    isTalkingRef.current = isTalking;
  }, [isTalking]);

  useEffect(() => {
    themeRef.current = isOverdrive ? 'overdrive' : theme;
  }, [theme, isOverdrive]);

  useEffect(() => {
    overdriveRef.current = isOverdrive;
  }, [isOverdrive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- CONFIGURATION ---
    const params = {
      timeScale: 1.2,
      rotationSpeedX: 0.002,
      rotationSpeedY: 0.005,
      plasmaScale: 0.2,
      plasmaBrightness: 1.31,
      voidThreshold: 0.09,
      shellOpacity: 0.41,
    };

    const currentPaletteKey = isOverdrive ? 'overdrive' : (THEME_PRESETS[theme] ? theme : 'cyan');
    const palette = THEME_PRESETS[currentPaletteKey];

    // 1. SCENE SETUP
    const scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    camera.position.z = 2.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 10;
    controls.enabled = interactive;

    // --- GROUP FOR ROTATION ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 2. LIGHTS
    const pointLight = new THREE.PointLight(palette.lightColor, 2.0, 10);
    mainGroup.add(pointLight);

    // 3. OUTER SHELL (Glass with Fresnel)
    const shellGeo = new THREE.SphereGeometry(1.0, 64, 64);

    const shellShader = {
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform float uAudioLevel;
        ${noiseFunctions}

        void main() {
          vNormal = normalize(normalMatrix * normal);
          // Subtle audio pulse displacement on shell
          vec3 pos = position + normal * (snoise(position * 3.0) * uAudioLevel * 0.03);
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uAudioLevel;
        
        void main() {
          float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 2.5);
          float glow = uOpacity * (1.0 + uAudioLevel * 1.5);
          gl_FragColor = vec4(uColor, fresnel * glow);
        }
      `
    };

    const shellBackMat = new THREE.ShaderMaterial({
      vertexShader: shellShader.vertexShader,
      fragmentShader: shellShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(palette.shellBack) },
        uOpacity: { value: 0.3 },
        uAudioLevel: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });

    const shellFrontMat = new THREE.ShaderMaterial({
      vertexShader: shellShader.vertexShader,
      fragmentShader: shellShader.fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(palette.shellColor) },
        uOpacity: { value: params.shellOpacity },
        uAudioLevel: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false
    });

    const shellBackMesh = new THREE.Mesh(shellGeo, shellBackMat);
    const shellFrontMesh = new THREE.Mesh(shellGeo, shellFrontMat);
    mainGroup.add(shellBackMesh);
    mainGroup.add(shellFrontMesh);

    // 4. PLASMA (Gas / Noise)
    const plasmaGeo = new THREE.SphereGeometry(0.998, 128, 128);
    const plasmaMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: params.plasmaScale },
        uBrightness: { value: params.plasmaBrightness },
        uThreshold: { value: params.voidThreshold },
        uAudioLevel: { value: 0 },
        uColorDeep: { value: new THREE.Color(palette.colorDeep) },
        uColorMid: { value: new THREE.Color(palette.colorMid) },
        uColorBright: { value: new THREE.Color(palette.colorBright) }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform float uTime;
        uniform float uAudioLevel;

        ${noiseFunctions}

        void main() {
          // Dynamic audio acoustic wave deformation
          float wobble = snoise(position * 2.8 + vec3(uTime * 0.5)) * uAudioLevel * 0.08;
          vec3 deformed = position + normal * wobble;

          vPosition = deformed;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(deformed, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScale;
        uniform float uBrightness;
        uniform float uThreshold;
        uniform float uAudioLevel;
        uniform vec3 uColorDeep;
        uniform vec3 uColorMid;
        uniform vec3 uColorBright;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        ${noiseFunctions}

        void main() {
          vec3 p = vPosition * uScale; 
          
          vec3 q = vec3(
            fbm(p + vec3(0.0, uTime * 0.05, 0.0)),
            fbm(p + vec3(5.2, 1.3, 2.8) + uTime * 0.05),
            fbm(p + vec3(2.2, 8.4, 0.5) - uTime * 0.02)
          );
          
          float density = fbm(p + 2.0 * q);
          float t = (density + 0.4) * 0.8;
          
          // Audio dynamically lowers void threshold, letting more intense filaments shine
          float dynamicThreshold = clamp(uThreshold - uAudioLevel * 0.04, 0.01, 0.8);
          float alpha = smoothstep(dynamicThreshold, 0.7, t);

          vec3 cWhite = vec3(1.0, 1.0, 1.0);
          
          vec3 color = mix(uColorDeep, uColorMid, smoothstep(dynamicThreshold, 0.5, t));
          color = mix(color, uColorBright, smoothstep(0.5, 0.8, t));
          color = mix(color, cWhite, smoothstep(0.8, 1.0, t));

          float facing = dot(normalize(vNormal), normalize(vViewPosition));
          float depthFactor = (facing + 1.0) * 0.5;
          float finalAlpha = alpha * (0.02 + 0.98 * depthFactor);
          
          // Boost brightness when user talks
          float dynamicBrightness = uBrightness * (1.0 + uAudioLevel * 1.8);
          gl_FragColor = vec4(color * dynamicBrightness, finalAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const plasmaMesh = new THREE.Mesh(plasmaGeo, plasmaMat);
    mainGroup.add(plasmaMesh);

    // 5. PARTICLES (Floating Core Sparkles)
    const pCount = 650;
    const pPos = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);
    const sphereRadius = 0.95;

    for (let i = 0; i < pCount; i++) {
      const r = sphereRadius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);

      pSizes[i] = Math.random();
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(palette.colorBright) },
        uAudioLevel: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uAudioLevel;
        attribute float aSize;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          // Audio expansion pulse & floating motion
          pos += normalize(position) * (uAudioLevel * 0.12 * sin(uTime * 4.0 + aSize * 15.0));
          pos.y += sin(uTime * 0.25 + pos.x) * 0.02;
          pos.x += cos(uTime * 0.2 + pos.z) * 0.02;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          float baseSize = (8.0 * aSize + 4.0) * (1.0 + uAudioLevel * 1.8);
          gl_PointSize = baseSize * (1.0 / -mvPosition.z);
          
          vAlpha = 0.8 + 0.2 * sin(uTime + aSize * 10.0) + uAudioLevel * 0.4;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;
          
          float glow = 1.0 - (dist * 2.0);
          glow = pow(glow, 1.8);
          
          gl_FragColor = vec4(uColor, glow * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(pGeo, pMat);
    mainGroup.add(particles);

    // 6. ANIMATION LOOP & COLOR TRANSITIONS
    const clock = new THREE.Clock();
    let animId = null;
    let accumulatedTime = 0;

    // Smooth target colors for transitions
    const targetColors = {
      deep: new THREE.Color(palette.colorDeep),
      mid: new THREE.Color(palette.colorMid),
      bright: new THREE.Color(palette.colorBright),
      shell: new THREE.Color(palette.shellColor),
      shellBack: new THREE.Color(palette.shellBack),
      light: new THREE.Color(palette.lightColor),
    };

    function animate() {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentAudio = audioLevelRef.current;
      const talking = isTalkingRef.current;
      const isOd = overdriveRef.current;
      const currentThemeKey = isOd ? 'overdrive' : (THEME_PRESETS[themeRef.current] ? themeRef.current : 'cyan');
      const activePalette = THEME_PRESETS[currentThemeKey];

      // Update target colors
      targetColors.deep.set(activePalette.colorDeep);
      targetColors.mid.set(activePalette.colorMid);
      targetColors.bright.set(activePalette.colorBright);
      targetColors.shell.set(activePalette.shellColor);
      targetColors.shellBack.set(activePalette.shellBack);
      targetColors.light.set(activePalette.lightColor);

      // Lerp colors for ultra-smooth fluid transitions
      const lerpSpeed = 0.08;
      plasmaMat.uniforms.uColorDeep.value.lerp(targetColors.deep, lerpSpeed);
      plasmaMat.uniforms.uColorMid.value.lerp(targetColors.mid, lerpSpeed);
      plasmaMat.uniforms.uColorBright.value.lerp(targetColors.bright, lerpSpeed);
      shellFrontMat.uniforms.uColor.value.lerp(targetColors.shell, lerpSpeed);
      shellBackMat.uniforms.uColor.value.lerp(targetColors.shellBack, lerpSpeed);
      pMat.uniforms.uColor.value.lerp(targetColors.bright, lerpSpeed);
      pointLight.color.lerp(targetColors.light, lerpSpeed);

      // Dynamic Audio Speed Modulation (fluid speeds up when talking)
      const dynamicTimeScale = (params.timeScale + (currentAudio * 3.5)) * (isOd ? 1.8 : 1.0);
      accumulatedTime += delta * dynamicTimeScale;

      // Update uniforms
      plasmaMat.uniforms.uTime.value = accumulatedTime;
      plasmaMat.uniforms.uAudioLevel.value = currentAudio;
      pMat.uniforms.uTime.value = accumulatedTime;
      pMat.uniforms.uAudioLevel.value = currentAudio;
      shellFrontMat.uniforms.uAudioLevel.value = currentAudio;
      shellBackMat.uniforms.uAudioLevel.value = currentAudio;

      // Point light intensity pulsates with speech
      pointLight.intensity = (2.0 + currentAudio * 4.0) * (isOd ? 1.6 : 1.0);

      // Subtle & voice-accelerated mesh rotation
      const rotMultiplier = (1.0 + currentAudio * 2.5) * (isOd ? 2.0 : 1.0);
      plasmaMesh.rotation.y += delta * 0.12 * rotMultiplier;
      particles.rotation.y -= delta * 0.08 * rotMultiplier;

      mainGroup.rotation.x += params.rotationSpeedX * rotMultiplier;
      mainGroup.rotation.y += params.rotationSpeedY * rotMultiplier;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // 7. RESIZE OBSERVER
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // 8. CLEANUP
    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);

      controls.dispose();

      shellGeo.dispose();
      shellBackMat.dispose();
      shellFrontMat.dispose();

      plasmaGeo.dispose();
      plasmaMat.dispose();

      pGeo.dispose();
      pMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div className={`plasma-sphere-wrapper ${className}`}>
      <div ref={containerRef} className="plasma-sphere-canvas" />
    </div>
  );
}
