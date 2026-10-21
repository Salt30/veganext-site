import * as THREE from './assets/three.module.js';

// The reference's hourglass is a surface of revolution with a three-turn twist.
// Keep the surface on the GPU and adapt its density to the current viewport.
const TAU = Math.PI * 2;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const easeOut = (time, start, end) => 1 - (1 - clamp((time - start) / (end - start), 0, 1)) ** 3;

function monotoneCurve(points) {
  const slopes = points.slice(1).map((p, i) => (p[1] - points[i][1]) / (p[0] - points[i][0]));
  const tangents = [slopes[0]];
  for (let i = 1; i < points.length - 1; i++) {
    tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  }
  tangents.push(slopes.at(-1));
  for (let i = 0; i < slopes.length; i++) {
    if (Math.abs(slopes[i]) < 1e-12) { tangents[i] = tangents[i + 1] = 0; continue; }
    const a = tangents[i] / slopes[i], b = tangents[i + 1] / slopes[i];
    if (a * a + b * b > 9) {
      const factor = 3 / Math.sqrt(a * a + b * b);
      tangents[i] = factor * a * slopes[i];
      tangents[i + 1] = factor * b * slopes[i];
    }
  }
  return value => {
    if (value <= points[0][0]) return points[0][1];
    if (value >= points.at(-1)[0]) return points.at(-1)[1];
    let i = 0;
    while (i < points.length - 2 && points[i + 1][0] < value) i++;
    const width = points[i + 1][0] - points[i][0];
    const t = (value - points[i][0]) / width, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * points[i][1]
      + (t3 - 2 * t2 + t) * width * tangents[i]
      + (-2 * t3 + 3 * t2) * points[i + 1][1]
      + (t3 - t2) * width * tangents[i + 1];
  };
}

const radiusAt = monotoneCurve([
  [0, 1150 / 60], [.12, .667 * 1150 / 60], [.25, .3 * 1150 / 60],
  [.38, .08 * 1150 / 60], [.5, 53 / 60], [.65, .2 * 380 / 60],
  [.8, .44 * 380 / 60], [1, 380 / 60],
]);
const heightAt = monotoneCurve([[0, 0], [.1, .2], [.2, .8], [.35, 2], [.5, 3.8], [.75, 7], [1, 10]]);
const twistAt = monotoneCurve([[0, 0], [.15, .15], [.25, .25], [.45, .55], [.6, .7], [.8, .88], [1, 1]]);

const motionUniforms = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uStrength;
`;
const repulsion = `
  if (uStrength > 0.0001 && gl_Position.w > 0.0) {
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 delta = ndc - uMouse;
    float distanceFromMouse = length(delta * vec2(uAspect, 1.0));
    float force = uStrength * exp(-(distanceFromMouse * distanceFromMouse) / (2.0 * uRadius * uRadius));
    if (length(delta) > 0.0001) {
      ndc += normalize(delta) * force;
      gl_Position.xy = ndc * gl_Position.w;
    }
  }
`;
const lineVertex = `
  ${motionUniforms}
  uniform float uReveal;
  attribute vec4 aSurface;
  attribute vec4 aLane;
  varying float vLight;
  void main() {
    float s = aSurface.w;
    float angle = aSurface.z + aLane.x + uTime * .1 * aLane.y;
    float radius = aSurface.x * (1.0 + sin(25.0 * s + aLane.z + .3 * uTime) * .008);
    vec3 point = vec3(cos(angle) * radius, aSurface.y, sin(angle) * radius);
    float edge = min(s / .15, (1.0 - s) / .15);
    edge = min(edge, 1.0); edge *= edge;
    float reveal = clamp((uReveal - s) / .15, 0.0, 1.0);
    reveal *= reveal;
    float pulse = min(.25 * (.9 + .1 * sin(.18 * uTime + aLane.w)), .7);
    vLight = edge * .9 * pulse * reveal * min(3.0 * uReveal, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
    ${repulsion}
  }
`;
const lineFragment = `
  uniform vec3 uColor;
  varying float vLight;
  void main() {
    if (vLight < .0001) discard;
    gl_FragColor = vec4(uColor * vLight, .5);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const dotVertex = `
  ${motionUniforms}
  uniform float uReveal;
  attribute vec4 aSurface;
  attribute vec4 aLane;
  attribute vec2 aFlicker;
  varying float vLight;
  void main() {
    float angle = aSurface.z + aLane.x + uTime * .1 * aLane.y;
    float radius = aSurface.x * (1.0 + sin(25.0 * aSurface.w + aLane.z + .3 * uTime) * .008);
    vec3 point = vec3(cos(angle) * radius, aSurface.y, sin(angle) * radius);
    point += position * .02;
    float flicker = .08 + .92 * pow(max(0.0, sin(uTime * aFlicker.y + aLane.w)), 2.5);
    vLight = aFlicker.x * flicker * 4.2 * uReveal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
    ${repulsion}
  }
`;
const dotFragment = `
  uniform vec3 uColor;
  uniform float uReveal;
  varying float vLight;
  void main() {
    if (vLight < .0001) discard;
    gl_FragColor = vec4(uColor * vLight, .9 * uReveal);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function initializeVortex(wrapper) {
  const mobileViewport = matchMedia('(max-width: 800px)');
  const coarsePointer = matchMedia('(pointer: coarse)');
  const isCompact = () => mobileViewport.matches || (coarsePointer.matches && Math.min(innerWidth, innerHeight) <= 820);
  let compact = isCompact();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const footer = wrapper.id === 'footer-vortex';
  const lineCount = footer ? 72 : 240;
  const dotCount = footer ? 1800 : 8000;
  const cometCount = footer ? 5 : 10;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block', position: 'absolute', inset: '0' });
  wrapper.append(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !compact, powerPreference: 'default' });
  } catch {
    canvas.remove();
    wrapper.dataset.vortex = 'fallback';
    return;
  }
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(59, 1, .1, 500);
  const center = new THREE.Vector3(0, 5, 0);
  const cameraDirection = new THREE.Vector3(3.4, -.6, 10).normalize();
  const cameraDistance = 5 / Math.tan(67 * Math.PI / 180 / 2);
  camera.position.copy(center).addScaledVector(cameraDirection, cameraDistance);
  camera.lookAt(center);
  const shared = {
    uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() },
    uAspect: { value: 1 }, uRadius: { value: .2 }, uStrength: { value: 0 },
  };
  const resources = [];
  const retain = object => (resources.push(object), object);
  const lanes = Array.from({ length: lineCount }, (_, i) => ({
    // The first half covers the whole surface, so the compact tier stays balanced.
    angle: (i < lineCount / 2 ? i * 2 : (i - lineCount / 2) * 2 + 1) / lineCount * TAU,
    speed: .95 + .1 * Math.random(),
    wobble: Math.random() * TAU, phase: Math.random() * TAU,
  }));
  function createLineGeometry() {
    const activeLanes = compact && !footer ? lineCount / 2 : lineCount;
    const linePoints = compact || footer ? 260 : 400;
    const segments = activeLanes * (linePoints - 1) * 2;
    const surfaces = new Float32Array(segments * 4), laneAttributes = new Float32Array(segments * 4);
    let vertex = 0;
    for (const lane of lanes.slice(0, activeLanes)) {
      for (let j = 0; j < linePoints - 1; j++) {
        for (const point of [j, j + 1]) {
          const s = point / (linePoints - 1);
          surfaces.set([radiusAt(s), heightAt(s), twistAt(s) * 3 * TAU, s], vertex * 4);
          laneAttributes.set([lane.angle, lane.speed, lane.wobble, lane.phase], vertex * 4);
          vertex++;
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segments * 3), 3));
    geometry.setAttribute('aSurface', new THREE.BufferAttribute(surfaces, 4));
    geometry.setAttribute('aLane', new THREE.BufferAttribute(laneAttributes, 4));
    return geometry;
  }
  const lineGeometry = retain(createLineGeometry());
  const lineMaterial = retain(new THREE.ShaderMaterial({
    uniforms: { ...shared, uReveal: { value: 0 }, uColor: { value: new THREE.Color('#60b4e3') } },
    vertexShader: lineVertex, fragmentShader: lineFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.frustumCulled = false;
  scene.add(lines);

  const plane = retain(new THREE.PlaneGeometry(1, 1));
  const dotGeometry = retain(new THREE.InstancedBufferGeometry());
  dotGeometry.index = plane.index;
  dotGeometry.attributes.position = plane.attributes.position;
  const dotSurfaces = new Float32Array(dotCount * 4), dotLanes = new Float32Array(dotCount * 4), flicker = new Float32Array(dotCount * 2);
  for (let i = 0; i < dotCount; i++) {
    const s = Math.random() < .5 ? .2 + .4 * Math.random() : .05 + .9 * Math.random();
    const lane = lanes[Math.floor(Math.random() * lineCount)];
    dotSurfaces.set([radiusAt(s), heightAt(s), twistAt(s) * 3 * TAU, s], i * 4);
    dotLanes.set([lane.angle, lane.speed, lane.wobble, Math.random() * TAU], i * 4);
    flicker.set([.04 + Math.random() ** 1.5 * .96, .15 + 4.5 * Math.random()], i * 2);
  }
  dotGeometry.setAttribute('aSurface', new THREE.InstancedBufferAttribute(dotSurfaces, 4));
  dotGeometry.setAttribute('aLane', new THREE.InstancedBufferAttribute(dotLanes, 4));
  dotGeometry.setAttribute('aFlicker', new THREE.InstancedBufferAttribute(flicker, 2));
  dotGeometry.instanceCount = dotCount;
  const dotMaterial = retain(new THREE.ShaderMaterial({
    uniforms: { ...shared, uReveal: { value: 0 }, uColor: { value: new THREE.Color('#d9e2e9') } },
    vertexShader: dotVertex, fragmentShader: dotFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const dots = new THREE.Mesh(dotGeometry, dotMaterial);
  dots.frustumCulled = false;
  scene.add(dots);

  function addRepulsion(material) {
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, shared);
      shader.vertexShader = shader.vertexShader
        .replace('void main() {', `${motionUniforms}\nvoid main() {`)
        .replace('#include <fog_vertex>', `#include <fog_vertex>\n${repulsion}`);
    };
    material.customProgramCacheKey = () => 'veganext-vortex-repel-v1';
    return retain(material);
  }
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 32;
  const glowContext = glowCanvas.getContext('2d');
  const gradient = glowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
  [[0, 'rgba(225,247,255,.9)'], [.3, 'rgba(80,185,255,.4)'], [.7, 'rgba(35,130,245,.08)'], [1, 'rgba(0,0,0,0)']].forEach(([stop, color]) => gradient.addColorStop(stop, color));
  glowContext.fillStyle = gradient;
  glowContext.fillRect(0, 0, 32, 32);
  const glowTexture = retain(new THREE.CanvasTexture(glowCanvas));
  const cometColor = new THREE.Color('#2c9adc');
  const comets = Array.from({ length: cometCount }, (_, i) => {
    const count = 19, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const geometry = retain(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
    const trail = new THREE.Line(geometry, addRepulsion(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })));
    trail.frustumCulled = false;
    const head = new THREE.Sprite(addRepulsion(new THREE.SpriteMaterial({ map: glowTexture, color: cometColor.clone().multiplyScalar(1.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })));
    head.scale.set(.35, .35, 1);
    scene.add(trail, head);
    return { positions, colors, geometry, trail, head, lane: lanes[i % lineCount], speed: .09, s: 0, idle: 0, idleFor: .4 + i / cometCount * 8, racing: false, brightness: .7 + .3 * Math.random() };
  });
  function writePoint(target, offset, s, lane, time) {
    const angle = twistAt(s) * 3 * TAU + lane.angle + time * .1 * lane.speed;
    const radius = radiusAt(s) * (1 + Math.sin(25 * s + lane.wobble + .3 * time) * .008);
    target[offset] = Math.cos(angle) * radius;
    target[offset + 1] = heightAt(s);
    target[offset + 2] = Math.sin(angle) * radius;
  }
  function moveComets(dt, time, reveal) {
    for (const [index, comet] of comets.entries()) {
      const active = !compact || index < 5;
      comet.trail.visible = comet.head.visible = active;
      if (!active) continue;
      if (!comet.racing) {
        comet.head.material.opacity = 0;
        if (reveal < .3) continue;
        comet.idle += dt;
        if (comet.idle <= comet.idleFor) continue;
        comet.racing = true; comet.s = .03;
        comet.speed = .09 * (.7 + .6 * Math.random());
        comet.lane = lanes[Math.floor(Math.random() * lineCount)];
      }
      comet.s += dt * comet.speed;
      if (comet.s > .95) {
        comet.racing = false; comet.idle = 0; comet.idleFor = 8 * (.6 + .8 * Math.random());
        comet.colors.fill(0); comet.geometry.attributes.color.needsUpdate = true; comet.head.material.opacity = 0;
        continue;
      }
      const edge = clamp((comet.s - .03) / .1, 0, 1) * clamp((.95 - comet.s) / .1, 0, 1);
      for (let j = 0; j < 19; j++) {
        writePoint(comet.positions, j * 3, clamp(comet.s - .005 * j, .005, .995), comet.lane, time);
        const brightness = comet.brightness * .6 * (1 - j / 19) ** 2 * edge * reveal * (j < 3 ? 1.3 : 1);
        comet.colors[j * 3] = cometColor.r * brightness;
        comet.colors[j * 3 + 1] = cometColor.g * brightness;
        comet.colors[j * 3 + 2] = cometColor.b * brightness;
      }
      comet.head.position.fromArray(comet.positions);
      comet.head.material.opacity = .35 * edge * reveal;
      comet.geometry.attributes.position.needsUpdate = true;
      comet.geometry.attributes.color.needsUpdate = true;
    }
  }

  let visible = true, frame = 0, lastTime = 0, time = 0, targetStrength = 0, disposed = false;
  function render(dt) {
    shared.uTime.value = reduced.matches ? 6 : time;
    const displayTime = shared.uTime.value;
    lineMaterial.uniforms.uReveal.value = easeOut(displayTime, 0, 2);
    dotMaterial.uniforms.uReveal.value = easeOut(displayTime, 1.2, 3);
    shared.uStrength.value += (targetStrength - shared.uStrength.value) * Math.min(1, 12 * dt);
    moveComets(dt, displayTime, easeOut(displayTime, 3, 5));
    renderer.render(scene, camera);
  }
  function animate(now) {
    frame = 0;
    if (disposed || !visible || document.hidden || reduced.matches) return;
    // Phones and tablets keep the motion while doing half as many GPU draws.
    const interval = compact || footer ? 1000 / 30 : 1000 / 60;
    if (lastTime && now - lastTime < interval - 1) {
      frame = requestAnimationFrame(animate);
      return;
    }
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .08) : 0;
    lastTime = now; time += dt;
    render(dt);
    frame = requestAnimationFrame(animate);
  }
  function synchronize() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (disposed || !visible || document.hidden) return;
    if (reduced.matches) {
      time = Math.max(time, 6);
      targetStrength = 0; shared.uStrength.value = 0; render(0);
    }
    else frame = requestAnimationFrame(animate);
  }
  function resize() {
    if (disposed) return;
    const width = Math.max(1, wrapper.clientWidth), height = Math.max(1, wrapper.clientHeight);
    const nextCompact = isCompact();
    if (compact !== nextCompact) {
      compact = nextCompact;
      if (!footer) {
        resources.splice(resources.indexOf(lines.geometry), 1);
        lines.geometry.dispose();
        lines.geometry = retain(createLineGeometry());
      }
      targetStrength = 0;
      shared.uStrength.value = 0;
    }
    const pixelRatio = Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.5);
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    dotGeometry.instanceCount = footer ? 1800 : compact ? 3000 : dotCount;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Give the hourglass more breathing room in portrait while keeping its height
    // stable on wide and short screens.
    const portraitDistance = 1 + clamp((.85 - camera.aspect) * .4, 0, .2);
    camera.position.copy(center).addScaledVector(cameraDirection, cameraDistance * portraitDistance);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    shared.uAspect.value = width / height;
    shared.uRadius.value = clamp(60 / (height / 2), .01, 3);
    if (visible && !document.hidden && (reduced.matches || !frame)) render(0);
  }
  function pointerMove(event) {
    if (!visible || reduced.matches || event.pointerType === 'touch') return;
    const box = wrapper.getBoundingClientRect();
    const x = event.clientX - box.left, y = event.clientY - box.top;
    if (x < 0 || y < 0 || x > box.width || y > box.height) { targetStrength = 0; return; }
    shared.uMouse.value.set(x / box.width * 2 - 1, -(y / box.height * 2 - 1));
    targetStrength = .045;
  }
  const onPointerLeave = () => { targetStrength = 0; };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrapper);
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize(); }, { rootMargin: '80px' });
  visibilityObserver.observe(wrapper);
  document.addEventListener('pointermove', pointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', synchronize);
  window.addEventListener('resize', resize, { passive: true });
  coarsePointer.addEventListener('change', resize);
  reduced.addEventListener('change', synchronize);
  wrapper.dataset.vortex = 'ready';
  resize(); synchronize();
  return () => {
    disposed = true; cancelAnimationFrame(frame);
    resizeObserver.disconnect(); visibilityObserver.disconnect();
    document.removeEventListener('pointermove', pointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', synchronize);
    window.removeEventListener('resize', resize);
    coarsePointer.removeEventListener('change', resize);
    reduced.removeEventListener('change', synchronize);
    resources.forEach(resource => resource.dispose());
    renderer.dispose(); canvas.remove();
  };
}

function start() {
  document.querySelectorAll('#vortex, #footer-vortex').forEach(wrapper => {
    if (!wrapper.dataset.vortex) initializeVortex(wrapper);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
