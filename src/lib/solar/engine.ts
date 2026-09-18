import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  BODIES,
  PLANETS,
  bodyById,
  keplerPosition,
  type Body,
  TROPICAL_YEAR,
  SYNODIC_MONTH,
} from "./bodies";
import { makeBodyTexture, makeGlowTexture, makeDotTexture, makeRingTexture, makeLabelTexture } from "./textures";
import type { CalendarCut, Mode } from "./store";

type PickCb = (id: string | null) => void;
type HoverCb = (h: { id: string; x: number; y: number } | null) => void;

type WorldObject = {
  id: string;
  group: THREE.Group;
  mesh: THREE.Object3D;
  spin: THREE.Object3D;
  body: Body;
};

const TAU = Math.PI * 2;

export class HeliosEngine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  private raf = 0;
  private disposed = false;
  private mode: Mode = "portrait";
  private simDays = 80;
  private enhanced = false;
  private calendarCut: CalendarCut = "nature";
  private selectedId: string | null = "earth";
  private textures = new Map<string, THREE.CanvasTexture>();
  private glowTex: THREE.CanvasTexture;
  private dotTex: THREE.CanvasTexture;
  private ringTex: THREE.CanvasTexture;
  private worlds: WorldObject[] = [];
  private pickables: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private clock = new THREE.Timer();
  private starField: THREE.Points | null = null;
  private sunLight = new THREE.PointLight(0xfff2d0, 2, 0, 0);
  private amb = new THREE.AmbientLight(0xc8d0dc, 0.7);
  private hemi = new THREE.HemisphereLight(0xd0d8e4, 0x1a1610, 0.55);
  private keyLight = new THREE.DirectionalLight(0xfff3dc, 2.2);
  private overlayGroup = new THREE.Group();
  private onPick: PickCb;
  private onHover: HoverCb;
  private canvas: HTMLCanvasElement;
  private blit: CanvasRenderingContext2D | null = null;
  private blitEl: HTMLCanvasElement | null = null;
  private ro: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, onPick: PickCb, onHover: HoverCb, blitCanvas?: HTMLCanvasElement | null) {
    this.canvas = canvas;
    this.onPick = onPick;
    this.onHover = onHover;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x07080c, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 20000);
    this.controls = new OrbitControls(this.camera, canvas.parentElement ?? canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 1.1;
    this.controls.panSpeed = 0.6;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    this.glowTex = makeGlowTexture();
    this.dotTex = makeDotTexture();
    this.ringTex = makeRingTexture();

    this.scene.background = new THREE.Color(0x07080c);
    this.scene.fog = null;
    this.keyLight.position.set(40, 55, 80);
    this.scene.add(this.amb, this.hemi, this.sunLight, this.keyLight, this.overlayGroup);
    this.sunLight.position.set(0, 0, 0);

    this.makeStars();
    this.build("portrait");
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.controls.addEventListener("start", () => {
      this.controls.autoRotate = false;
    });
    this.clock.connect(document);
    if (blitCanvas) {
      this.blitEl = blitCanvas;
      this.blit = blitCanvas.getContext("2d");
    }
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas.parentElement ?? this.canvas);
    this.resize();
    requestAnimationFrame(() => {
      this.resize();
      this.frameCurrent();
    });
    this.loop();
    (window as unknown as { __helios: unknown }).__helios = {
      worlds: () => this.worlds.map((w) => ({ id: w.id, x: w.group.position.x, r: this.radiusOf(w.body) })),
      cam: () => this.camera.position.toArray(),
      target: () => this.controls.target.toArray(),
      size: () => [this.renderer.domElement.width, this.renderer.domElement.height],
      calls: () => ({ ...this.renderer.info.render }),
      ndc: () => {
        const v = new THREE.Vector3();
        return this.worlds.map((w) => {
          w.group.getWorldPosition(v);
          v.project(this.camera);
          return { id: w.id, ndc: [Number(v.x.toFixed(3)), Number(v.y.toFixed(3)), Number(v.z.toFixed(3))] };
        });
      },
    };
  }

  setMode(mode: Mode) {
    if (mode === "sky") return;
    if (mode === this.mode) return;
    this.mode = mode;
    this.build(mode);
  }

  setSimDays(d: number) {
    this.simDays = d;
  }

  setEnhanced(v: boolean) {
    if (v === this.enhanced) return;
    this.enhanced = v;
    this.rebuildMaterials();
  }

  setCalendarCut(c: CalendarCut) {
    this.calendarCut = c;
    if (this.mode === "time") this.rebuildCalendar();
  }

  setSelected(id: string | null) {
    this.selectedId = id;
    this.updateSelection();
    if (id && (this.mode === "orbits" || this.mode === "void")) {
      const w = this.worlds.find((o) => o.id === id);
      if (w) {
        const p = new THREE.Vector3();
        w.group.getWorldPosition(p);
        this.controls.target.lerp(p, 1);
        const offset = this.camera.position.clone().sub(this.controls.target);
        if (offset.length() < 0.4) offset.set(0, 2, 6);
        this.camera.position.copy(p).add(offset);
      }
    }
  }

  focusBody(id: string) {
    this.setSelected(id);
    const w = this.worlds.find((o) => o.id === id);
    if (!w) return;
    this.controls.autoRotate = false;
    this.frame([w], this.mode === "void" ? 12 : 2.6);
  }

  resize = () => {
    const parent = this.canvas.parentElement ?? this.canvas;
    const w = Math.max(1, parent.clientWidth || window.innerWidth || 1);
    const h = Math.max(1, parent.clientHeight || window.innerHeight || 1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.blitEl) {
      this.blitEl.width = w;
      this.blitEl.height = h;
    }
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.controls.dispose();
    this.clearWorld();
    this.glowTex.dispose();
    this.dotTex.dispose();
    this.ringTex.dispose();
    this.textures.forEach((t) => t.dispose());
    this.starField?.geometry.dispose();
    (this.starField?.material as THREE.Material | undefined)?.dispose();
    this.renderer.dispose();
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    this.clock.update();
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.tick(dt);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    if (this.blit && this.blitEl) {
      this.blit.drawImage(this.canvas, 0, 0, this.blitEl.width, this.blitEl.height);
    }
  };

  private tick(dt: number) {
    const days = this.simDays;
    for (const w of this.worlds) {
      const hours = w.body.rotationHours || 24;
      const spins = (days * 24) / hours;
      w.spin.rotation.y = spins * TAU;
      if (this.mode === "orbits" || this.mode === "void") {
        this.placeOrbit(w, days);
      }
      if (this.mode === "time" && w.id === "moon") {
        const phase = (days / SYNODIC_MONTH) * TAU;
        w.group.position.set(Math.cos(phase) * 8, 0, Math.sin(phase) * 8);
      }
      if (this.mode === "portrait") {
        w.spin.rotation.y += dt * 0.12 * Math.sign(w.body.rotationHours || 1);
      }
    }
    if (this.mode === "time") this.updateTimeMarkers(days);
  }

  private placeOrbit(w: WorldObject, days: number) {
    if (w.body.kind === "star") {
      w.group.position.set(0, 0, 0);
      return;
    }
    if (w.body.kind === "moon") {
      const earth = this.worlds.find((o) => o.id === "earth");
      if (!earth) return;
      const m = (days / w.body.periodDays) * TAU;
      const { x, z } = keplerPosition(this.mode === "void" ? w.body.au : 0.18, w.body.eccentricity, m);
      w.group.position.set(earth.group.position.x + x, 0, earth.group.position.z + z);
      return;
    }
    if (!w.body.periodDays) return;
    const m = (days / w.body.periodDays) * TAU;
    const scale = this.mode === "void" ? 1 : 8;
    const { x, z } = keplerPosition(w.body.au * scale, w.body.eccentricity, m);
    const inc = (w.body.inclination * Math.PI) / 180;
    w.group.position.set(x, z * Math.sin(inc), z * Math.cos(inc));
  }

  private build(mode: Mode) {
    this.clearWorld();
    this.overlayGroup.clear();
    this.mode = mode;
    if (mode === "portrait") this.buildPortrait();
    else if (mode === "orbits") this.buildOrbits();
    else if (mode === "void") this.buildVoid();
    else if (mode === "time") this.buildTime();
    else this.buildEdge();
    this.updateSelection();
  }

  private tex(body: Body) {
    const key = `${body.id}:${this.enhanced ? 1 : 0}`;
    let t = this.textures.get(key);
    if (!t) {
      t = makeBodyTexture(body, this.enhanced, body.id === "sun" ? 128 : 256);
      this.textures.set(key, t);
    }
    return t;
  }

  private rebuildMaterials() {
    for (const w of this.worlds) {
      const mesh = w.mesh as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
      if ("map" in mat && mat.map) {
        const next = this.tex(w.body);
        mat.map = next;
        if ("emissiveMap" in mat && w.body.kind === "star") {
          (mat as THREE.MeshStandardMaterial).emissiveMap = next;
        }
        mat.needsUpdate = true;
      }
      if ("color" in mat) {
        mat.color.set(this.enhanced ? w.body.enhanced : w.body.color);
      }
    }
  }

  private addWorld(body: Body, radius: number, pos: THREE.Vector3, opts?: { basic?: boolean; pick?: boolean }) {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.name = body.id;

    const spin = new THREE.Group();
    const tilt = (body.tilt * Math.PI) / 180;
    spin.rotation.z = tilt;

    const geo = new THREE.SphereGeometry(radius, body.kind === "star" ? 64 : 48, body.kind === "star" ? 48 : 32);
    const map = this.tex(body);
    const unlit = this.mode === "portrait" || this.mode === "time" || this.mode === "edge" || opts?.basic;
    let mesh: THREE.Mesh;
    if (body.kind === "star" || unlit) {
      const mat = new THREE.MeshBasicMaterial({ map, color: 0xffffff, toneMapped: false });
      mesh = new THREE.Mesh(geo, mat);
    } else {
      const mat = new THREE.MeshStandardMaterial({
        map,
        roughness: body.kind === "planet" && body.id !== "venus" ? 0.72 : 0.45,
        metalness: 0.02,
        emissive: body.id === "sun" ? 0x221800 : 0x101014,
        emissiveIntensity: 0.15,
      });
      mesh = new THREE.Mesh(geo, mat);
    }
    mesh.userData.id = body.id;
    spin.add(mesh);

    if (body.id === "saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.2, radius * 2.25, 64),
        new THREE.MeshBasicMaterial({
          map: this.ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      spin.add(ring);
    }

    if (body.id === "uranus") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.4, radius * 1.7, 48),
        new THREE.MeshBasicMaterial({
          color: 0x9bb8b8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
        }),
      );
      ring.rotation.y = Math.PI / 2;
      spin.add(ring);
    }

    const axis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -radius * 1.6, 0),
        new THREE.Vector3(0, radius * 1.6, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0x8a909c, transparent: true, opacity: 0.45 }),
    );
    axis.visible = this.mode === "portrait" || this.mode === "time";
    spin.add(axis);

    group.add(spin);
    this.scene.add(group);
    const world: WorldObject = { id: body.id, group, mesh, spin, body };
    this.worlds.push(world);
    if (opts?.pick !== false) this.pickables.push(mesh);
    return world;
  }

  private addOrbitPath(body: Body, scale: number, color: number, opacity = 0.22) {
    const pts: THREE.Vector3[] = [];
    const inc = (body.inclination * Math.PI) / 180;
    for (let i = 0; i <= 128; i++) {
      const m = (i / 128) * TAU;
      const { x, z } = keplerPosition(body.au * scale, body.eccentricity, m);
      pts.push(new THREE.Vector3(x, z * Math.sin(inc), z * Math.cos(inc)));
    }
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    );
    this.overlayGroup.add(line);
  }

  private buildPortrait() {
    this.sunLight.intensity = 0;
    this.keyLight.intensity = 2.6;
    this.keyLight.position.set(20, 40, 90);
    this.amb.intensity = 1.05;
    this.hemi.intensity = 0.7;
    this.hemi.color.setHex(0xe0e6ee);
    this.hemi.groundColor.setHex(0x2a2418);
    this.camera.near = 0.2;
    this.camera.far = 4000;
    this.camera.fov = 42;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.55;

    const sun = bodyById("sun")!;
    const sunR = 22;
    this.addWorld(sun, sunR, new THREE.Vector3(0, 0, 0), { basic: true });
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, depthWrite: false }));
    glow.scale.set(sunR * 4.8, sunR * 4.8, 1);
    this.worlds[0].group.add(glow);

    const lineup = BODIES.filter((b) => b.id !== "sun");
    let x = sunR + 10;
    let maxR = sunR;
    for (const b of lineup) {
      const r = Math.max((b.diameterKm / 12756) * 1.65, 0.38);
      x += r + 1.35;
      const world = this.addWorld(b, r, new THREE.Vector3(x, 0, 0));
      this.addLabel(world, r);
      maxR = Math.max(maxR, r);
      x += r + 1.35;
    }
    this.addLabel(this.worlds[0], sunR);

    const last = this.worlds[this.worlds.length - 1];
    const span = (last?.group.position.x ?? 80) + 8;
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(span + sunR, 0.35, 14),
      new THREE.MeshBasicMaterial({ color: 0x12151c }),
    );
    plinth.position.set(span * 0.42, -maxR - 2.2, 0);
    this.overlayGroup.add(plinth);
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(span + sunR, 0.04, 14.4),
      new THREE.MeshBasicMaterial({ color: 0x2a3140 }),
    );
    rail.position.set(span * 0.42, -maxR - 2.0, 0);
    this.overlayGroup.add(rail);

    this.frame(
      this.worlds.filter((w) => ["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn"].includes(w.id)),
      1.18,
    );
  }

  private buildOrbits() {
    this.sunLight.intensity = 3.4;
    this.sunLight.distance = 0;
    this.sunLight.decay = 0;
    this.keyLight.intensity = 0.35;
    this.amb.intensity = 0.22;
    this.hemi.intensity = 0.28;
    this.camera.near = 0.2;
    this.camera.far = 8000;
    this.camera.fov = 50;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.25;

    const scale = 8;
    const sun = bodyById("sun")!;
    this.addWorld(sun, 2.4, new THREE.Vector3(), { basic: true });
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, depthWrite: false }));
    glow.scale.set(9, 9, 1);
    this.worlds[0].group.add(glow);

    const sizeOf = (b: Body) => {
      if (b.id === "jupiter") return 1.35;
      if (b.id === "saturn") return 1.15;
      if (b.id === "uranus" || b.id === "neptune") return 0.7;
      if (b.id === "earth" || b.id === "venus") return 0.32;
      if (b.id === "mars") return 0.22;
      if (b.id === "mercury") return 0.16;
      if (b.id === "moon") return 0.1;
      if (b.id === "pluto" || b.id === "ceres") return 0.12;
      return 0.3;
    };

    for (const b of BODIES) {
      if (b.id === "sun") continue;
      if (b.kind !== "moon") this.addOrbitPath(b, scale, 0x5a6574, b.kind === "dwarf" ? 0.14 : 0.28);
      this.addWorld(b, sizeOf(b), new THREE.Vector3(b.au * scale, 0, 0));
    }
    this.addBelt(2.2, 3.2, scale, 900, 0.018);
    this.placeAll(this.simDays);

    this.frame(
      this.worlds.filter((w) => ["sun", "mercury", "venus", "earth", "mars", "jupiter"].includes(w.id)),
      1.55,
    );
    this.camera.position.set(this.camera.position.x, Math.max(this.camera.position.y, 28), this.camera.position.z);
    this.controls.update();
  }

  private buildVoid() {
    this.sunLight.intensity = 2.2;
    this.keyLight.intensity = 0.1;
    this.amb.intensity = 0.12;
    this.hemi.intensity = 0.14;
    this.camera.near = 0.002;
    this.camera.far = 500;
    this.camera.fov = 50;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotate = false;

    const sun = bodyById("sun")!;
    const sunR = 0.00465;
    this.addWorld(sun, sunR, new THREE.Vector3(), { basic: true });
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, depthWrite: false }));
    glow.scale.set(0.08, 0.08, 1);
    this.worlds[0].group.add(glow);

    for (const b of BODIES) {
      if (b.id === "sun") continue;
      if (b.kind !== "moon") this.addOrbitPath(b, 1, 0x3a4250, 0.35);
      const marker = this.addWorld(b, 0.0008, new THREE.Vector3(b.au, 0, 0));
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: this.enhanced ? b.enhanced : b.color,
          transparent: true,
          depthWrite: false,
          sizeAttenuation: false,
        }),
      );
      spr.scale.set(18, 18, 1);
      spr.userData.id = b.id;
      marker.group.add(spr);
      this.pickables.push(spr);
    }
    this.placeAll(this.simDays);

    this.camera.position.set(1.15, 0.55, 1.35);
    this.controls.target.set(0.7, 0, 0);
    this.controls.minDistance = 0.02;
    this.controls.maxDistance = 80;
    this.controls.update();
  }

  private buildTime() {
    this.sunLight.intensity = 0;
    this.keyLight.intensity = 2.4;
    this.keyLight.position.set(50, 18, 12);
    this.amb.intensity = 0.55;
    this.hemi.intensity = 0.45;
    this.camera.near = 0.1;
    this.camera.far = 400;
    this.camera.fov = 46;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;

    const sunDir = new THREE.DirectionalLight(0xfff1d2, 2.1);
    sunDir.position.set(40, 8, 0);
    sunDir.name = "time-sun";
    this.overlayGroup.add(sunDir);
    const sunBall = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0xffe8b0 }),
    );
    sunBall.position.set(48, 6, 0);
    this.overlayGroup.add(sunBall);
    const sg = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, depthWrite: false }));
    sg.position.copy(sunBall.position);
    sg.scale.set(14, 14, 1);
    this.overlayGroup.add(sg);

    const earth = bodyById("earth")!;
    this.addWorld(earth, 1.6, new THREE.Vector3(0, 0, 0));
    const moon = bodyById("moon")!;
    this.addWorld(moon, 0.44, new THREE.Vector3(8, 0, 0));

    const moonPath = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 80 }, (_, i) => {
          const a = (i / 80) * TAU;
          return new THREE.Vector3(Math.cos(a) * 8, 0, Math.sin(a) * 8);
        }),
      ),
      new THREE.LineBasicMaterial({ color: 0x6a7380, transparent: true, opacity: 0.4 }),
    );
    this.overlayGroup.add(moonPath);

    this.rebuildCalendar();

    this.frame(this.worlds, 1.65);
  }

  private rebuildCalendar() {
    const old = this.overlayGroup.children.filter((c) => c.userData.cal);
    old.forEach((c) => this.overlayGroup.remove(c));
    const radius = 3.6;
    const pts = (n: number, r = radius) =>
      Array.from({ length: n + 1 }, (_, i) => {
        const a = (i / n) * TAU - Math.PI / 2;
        return new THREE.Vector3(Math.cos(a) * r, 0.02, Math.sin(a) * r);
      });

    const ring = (points: THREE.Vector3[], color: number, opacity: number) => {
      const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
      );
      line.userData.cal = true;
      this.overlayGroup.add(line);
    };

    ring(pts(120, radius), 0x4a5360, 0.5);

    const tick = (angle: number, inner: number, outer: number, color: number) => {
      const a = angle - Math.PI / 2;
      const g = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * inner, 0.03, Math.sin(a) * inner),
          new THREE.Vector3(Math.cos(a) * outer, 0.03, Math.sin(a) * outer),
        ]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }),
      );
      g.userData.cal = true;
      this.overlayGroup.add(g);
    };

    const cut = this.calendarCut;
    if (cut === "nature") {
      for (let i = 0; i < 4; i++) tick((i / 4) * TAU, radius - 0.15, radius + 0.45, 0xd7dde6);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12.37) * TAU;
        tick(a, radius, radius + 0.18, 0x8a94a3);
      }
    } else if (cut === "gregorian") {
      const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let acc = 0;
      for (const d of days) {
        tick((acc / TROPICAL_YEAR) * TAU, radius - 0.1, radius + 0.38, 0xc8ccd4);
        acc += d;
      }
    } else if (cut === "fixed13") {
      for (let i = 0; i < 13; i++) tick((i / 13) * TAU * (364 / TROPICAL_YEAR), radius - 0.1, radius + 0.32, 0xc8ccd4);
      tick((364 / TROPICAL_YEAR) * TAU, radius - 0.05, radius + 0.55, 0xe8e6e1);
    } else {
      const months = 10;
      for (let i = 0; i < months; i++) tick((i / months) * TAU, radius - 0.1, radius + 0.35, 0xb8c0cc);
    }
  }

  private calNeedle: THREE.Mesh | null = null;
  private updateTimeMarkers(days: number) {
    if (!this.calNeedle) {
      this.calNeedle = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.35, 8),
        new THREE.MeshBasicMaterial({ color: 0xe8e6e1 }),
      );
      this.calNeedle.userData.cal = true;
    }
    if (!this.calNeedle.parent) this.overlayGroup.add(this.calNeedle);
    const frac = (days % TROPICAL_YEAR) / TROPICAL_YEAR;
    const a = frac * TAU - Math.PI / 2;
    const r = 3.85;
    this.calNeedle.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
    this.calNeedle.lookAt(0, 0.12, 0);
  }

  private buildEdge() {
    this.sunLight.intensity = 1.6;
    this.keyLight.intensity = 1.1;
    this.amb.intensity = 0.4;
    this.hemi.intensity = 0.35;
    this.camera.near = 0.2;
    this.camera.far = 2000;
    this.camera.fov = 48;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.2;

    const sun = bodyById("sun")!;
    this.addWorld(sun, 0.35, new THREE.Vector3(), { basic: true });
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, depthWrite: false }));
    glow.scale.set(2.2, 2.2, 1);
    this.worlds[0].group.add(glow);

    const logR = (au: number) => Math.max(0.4, (Math.log10(au) + 1) * 3.4);

    const shells: { au: number; label: string; color: number; opacity: number }[] = [
      { au: 1, label: "Earth", color: 0x6a7380, opacity: 0.35 },
      { au: 5.2, label: "Jupiter", color: 0x5a6270, opacity: 0.28 },
      { au: 30, label: "Neptune", color: 0x4a5360, opacity: 0.28 },
      { au: 50, label: "Kuiper", color: 0x3a4450, opacity: 0.22 },
      { au: 120, label: "Heliopause", color: 0x8a94a3, opacity: 0.4 },
      { au: 1000, label: "Inner Oort", color: 0x3a4250, opacity: 0.18 },
      { au: 20000, label: "Oort", color: 0x2a323c, opacity: 0.12 },
    ];
    for (const s of shells) {
      const r = logR(s.au);
      const circle = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 96 }, (_, i) => {
            const a = (i / 96) * TAU;
            return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
          }),
        ),
        new THREE.LineBasicMaterial({ color: s.color, transparent: true, opacity: s.opacity }),
      );
      this.overlayGroup.add(circle);
    }

    for (const b of PLANETS.concat(BODIES.filter((x) => x.kind === "dwarf"))) {
      const r = logR(b.au);
      const w = this.addWorld(b, 0.12 + earthish(b), new THREE.Vector3(r, 0, 0));
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.dotTex,
          color: b.color,
          transparent: true,
          depthWrite: false,
        }),
      );
      spr.scale.set(0.55, 0.55, 1);
      w.group.add(spr);
    }

    const v1 = logR(166);
    const voy = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshBasicMaterial({ color: 0xe8e6e1 }),
    );
    voy.position.set(v1 * 0.72, 0.4, v1 * 0.7);
    voy.userData.id = "voyager1";
    this.overlayGroup.add(voy);

    this.frame(this.worlds, 1.45);
  }

  private addBelt(inner: number, outer: number, scale: number, count: number, size: number) {
    const geo = new THREE.SphereGeometry(size, 5, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x6a6560 });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const p = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const au = inner + Math.random() * (outer - inner);
      const a = Math.random() * TAU;
      p.set(Math.cos(a) * au * scale, (Math.random() - 0.5) * 0.4, Math.sin(a) * au * scale);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    this.overlayGroup.add(mesh);
  }

  private placeAll(days: number) {
    for (const w of this.worlds) this.placeOrbit(w, days);
  }

  private addLabel(world: WorldObject, radius: number) {
    const tex = makeLabelTexture(world.body.name);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    const spr = new THREE.Sprite(mat);
    const w = Math.max(radius * 2.8, 2.6);
    spr.scale.set(w, w * 0.25, 1);
    spr.position.set(0, -radius - w * 0.2, 0);
    spr.userData.label = true;
    world.group.add(spr);
  }

  private frame(worlds: WorldObject[], pad = 1.25) {
    if (!worlds.length) return;
    const box = new THREE.Box3();
    const p = new THREE.Vector3();
    for (const w of worlds) {
      w.group.updateWorldMatrix(true, true);
      w.group.getWorldPosition(p);
      const r = this.radiusOf(w.body);
      box.expandByPoint(new THREE.Vector3(p.x - r, p.y - r, p.z - r));
      box.expandByPoint(new THREE.Vector3(p.x + r, p.y + r, p.z + r));
    }
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const fov = (this.camera.fov * Math.PI) / 180;
    const aspect = Math.max(this.camera.aspect, 0.55);
    const dist =
      Math.max(
        size.y * 0.5 / Math.tan(fov * 0.5),
        size.x * 0.5 / (Math.tan(fov * 0.5) * aspect),
        size.z * 0.7,
        6,
      ) * pad;
    this.controls.target.copy(center);
    this.camera.position.set(center.x - dist * 0.08, center.y + dist * 0.22, center.z + dist);
    this.camera.near = Math.max(0.05, dist / 250);
    this.camera.far = Math.max(4000, dist * 50);
    this.camera.updateProjectionMatrix();
    this.controls.minDistance = Math.max(2, dist * 0.12);
    this.controls.maxDistance = dist * 10;
    this.controls.update();
  }

  private frameCurrent() {
    if (!this.worlds.length) return;
    if (this.mode === "portrait") {
      this.frame(
        this.worlds.filter((w) =>
          ["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn"].includes(w.id),
        ),
        1.18,
      );
    } else if (this.mode === "orbits") {
      this.frame(
        this.worlds.filter((w) => ["sun", "mercury", "venus", "earth", "mars", "jupiter"].includes(w.id)),
        1.55,
      );
    } else if (this.mode === "time") {
      this.frame(this.worlds, 1.65);
    } else if (this.mode === "edge") {
      this.frame(this.worlds, 1.45);
    }
  }

  private radiusOf(body: Body) {
    const w = this.worlds.find((o) => o.id === body.id);
    if (!w) return 1;
    const mesh = w.mesh as THREE.Mesh;
    const geo = mesh.geometry as THREE.SphereGeometry;
    geo.computeBoundingSphere();
    return geo.boundingSphere?.radius ?? 1;
  }

  private updateSelection() {
    for (const w of this.worlds) {
      const mesh = w.mesh as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if ("emissive" in mat && w.body.kind !== "star") {
        mat.emissive.setHex(w.id === this.selectedId ? 0x1a2430 : 0x000000);
      }
      w.group.scale.setScalar(w.id === this.selectedId && this.mode !== "void" ? 1.04 : 1);
    }
  }

  private onPointerDown = (e: PointerEvent) => {
    this.setPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, true);
    if (hits[0]) {
      const id = (hits[0].object.userData.id as string) ?? hits[0].object.parent?.userData.id;
      if (id) this.onPick(id);
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    this.setPointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, true);
    const id = hits[0]
      ? ((hits[0].object.userData.id as string) ?? null)
      : null;
    if (id) {
      this.canvas.style.cursor = "pointer";
      this.onHover({ id, x: e.clientX, y: e.clientY });
    } else {
      this.canvas.style.cursor = "grab";
      this.onHover(null);
    }
  };

  private setPointer(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private makeStars() {
    const n = 1800;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 400 + Math.random() * 800;
      const th = Math.random() * TAU;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.starField = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xc8cdd6, size: 1.6, sizeAttenuation: true }),
    );
    this.scene.add(this.starField);
  }

  private clearWorld() {
    for (const w of this.worlds) {
      this.scene.remove(w.group);
      w.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else if (m && m !== this.ringTex) {
            /* keep shared maps */
            m.dispose();
          }
        }
      });
    }
    this.worlds = [];
    this.pickables = [];
    this.overlayGroup.clear();
    this.calNeedle = null;
    this.scene.children
      .filter((c) => c.name === "time-sun")
      .forEach((c) => this.scene.remove(c));
  }
}

function earthish(b: Body) {
  return Math.min(0.55, (b.diameterKm / 142984) * 1.1);
}
