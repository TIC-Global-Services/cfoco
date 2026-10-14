// Web Audio sound design for the hero. The fry sizzle is a sample; the
// whoosh and the bucket landing are synthesised, so they need no assets.

/** seconds of white noise, shared by every noise-based voice */
function noiseBuffer(ctx: AudioContext, seconds: number) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** sparse, decaying crackles — the crust crunching as it hits the pile */
function crackleBuffer(ctx: AudioContext, seconds: number) {
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * seconds), sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const t = i / d.length;
    const density = 0.006 * Math.pow(1 - t, 2.2); // dense at the hit, thinning out
    if (Math.random() < density) {
      const amp = (0.4 + Math.random() * 0.6) * (1 - t);
      const len = 20 + Math.floor(Math.random() * 90);
      for (let k = 0; k < len && i + k < d.length; k++) d[i + k] += (Math.random() * 2 - 1) * amp * Math.exp(-k / (len * 0.3));
    }
  }
  return buf;
}

/** stereo decaying-noise impulse response — a cheap, smooth hall */
function reverbImpulse(ctx: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

/** brown noise: deep, soft room tone */
function brownNoiseBuffer(ctx: AudioContext, seconds: number) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

export type Sfx = ReturnType<typeof createSfx>;

export function createSfx(ctx: AudioContext) {
  const master = ctx.createGain();
  // gentle limiter so stacked hits never clip
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.15;
  master.connect(limiter).connect(ctx.destination);

  const noise = noiseBuffer(ctx, 2);
  const crackle = crackleBuffer(ctx, 0.6);

  // ---- fry sizzle: looped sample, gain driven from outside ----
  const fryGain = ctx.createGain();
  fryGain.gain.value = 0;
  fryGain.connect(master);
  void fetch("/frying_sound.mp3")
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))
    .then((buf) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      // skip the mp3 encoder padding at both ends so the loop has no click
      src.loopStart = 0.06;
      src.loopEnd = buf.duration - 0.06;
      src.connect(fryGain);
      src.start(0, 0.06);
    });

  // ---- whoosh: looped noise → band-pass, loudness + pitch driven from outside ----
  const whooshSrc = ctx.createBufferSource();
  whooshSrc.buffer = noise;
  whooshSrc.loop = true;
  const whooshBand = ctx.createBiquadFilter();
  whooshBand.type = "bandpass";
  whooshBand.Q.value = 1.4;
  whooshBand.frequency.value = 500;
  const whooshGain = ctx.createGain();
  whooshGain.gain.value = 0;
  whooshSrc.connect(whooshBand).connect(whooshGain).connect(master);
  whooshSrc.start();


  // ---- ambience: background music + room tone + distant kitchen ----
  const reverb = ctx.createConvolver();
  reverb.buffer = reverbImpulse(ctx, 3.2, 2.6);
  const ambBus = ctx.createGain(); // overall ambience level (fades in on start)
  ambBus.gain.value = 0;
  ambBus.connect(master);
  const wet = ctx.createGain();
  wet.gain.value = 0.9;
  reverb.connect(wet).connect(ambBus);

  // room tone
  const room = ctx.createBufferSource();
  room.buffer = brownNoiseBuffer(ctx, 4);
  room.loop = true;
  const roomLp = ctx.createBiquadFilter();
  roomLp.type = "lowpass";
  roomLp.frequency.value = 380;
  const roomGain = ctx.createGain();
  roomGain.gain.value = 0.16;
  room.connect(roomLp).connect(roomGain).connect(ambBus);
  room.start();

  // background music: streamed through an <audio> element (a 2.5-min track would
  // be ~50 MB decoded), looped, mixed very low
  const music = new Audio("/leberch-ambient.mp3");
  music.loop = true;
  music.preload = "auto";
  const musicGain = ctx.createGain();
  musicGain.gain.value = 0;
  ctx.createMediaElementSource(music).connect(musicGain).connect(master);
  void music.play().catch(() => {});

  // distant kitchen: sparse metallic pings, panned, through the hall
  let kitchen = 0;
  const clink = () => {
    if (kitchen > 0.02 && ctx.state === "running") {
      const t = ctx.currentTime;
      const f = 1800 + Math.random() * 2600;
      const car = ctx.createOscillator();
      car.frequency.value = f;
      const mod = ctx.createOscillator();
      mod.frequency.value = f * 2.76; // inharmonic → metal
      const modDepth = ctx.createGain();
      modDepth.gain.setValueAtTime(f * 0.8, t);
      modDepth.gain.exponentialRampToValueAtTime(1, t + 0.25);
      mod.connect(modDepth).connect(car.frequency);
      const g = ctx.createGain();
      const v = (0.012 + Math.random() * 0.02) * kitchen;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      car.connect(g).connect(pan);
      pan.connect(reverb);
      const dry = ctx.createGain();
      dry.gain.value = 0.25;
      pan.connect(dry).connect(ambBus);
      car.start(t);
      mod.start(t);
      car.stop(t + 0.5);
      mod.stop(t + 0.5);
      // sometimes a second, quieter clink right after (cutlery on a plate)
      if (Math.random() < 0.35) setTimeout(clink, 90 + Math.random() * 160);
    }
  };
  let clinkTimer = 0;
  const scheduleClink = () => {
    clinkTimer = window.setTimeout(() => {
      clink();
      scheduleClink();
    }, 2500 + Math.random() * 5000);
  };
  scheduleClink();

  ctx.addEventListener("statechange", () => {
    if (ctx.state === "closed") {
      music.pause();
      clearTimeout(clinkTimer);
    }
  });

  const smooth = (param: AudioParam, v: number, tc = 0.06) => param.setTargetAtTime(v, ctx.currentTime, tc);

  return {
    ctx,
    setMaster: (v: number) => smooth(master.gain, v, 0.03),
    setFry: (v: number) => smooth(fryGain.gain, v, 0.08),
    /** suspend / resume everything, including the streamed music */
    pause: () => {
      music.pause();
      return ctx.suspend();
    },
    resume: () => {
      void music.play().catch(() => {});
      return ctx.resume();
    },
    /** music: track volume · bed: room tone + kitchen level · kitchen: 0..1 · duck: 0..1 (e.g. under the sizzle) */
    setAmbience: (musicLevel: number, bed: number, kitchenLevel: number, duck: number) => {
      smooth(musicGain.gain, musicLevel * (1 - 0.5 * duck), 0.8);
      smooth(ambBus.gain, bed * (1 - 0.45 * duck), 0.6);
      smooth(roomGain.gain, 0.06 + 0.08 * kitchenLevel, 0.8);
      kitchen = kitchenLevel;
    },
    setWhoosh: (v: number, freq: number) => {
      smooth(whooshGain.gain, v, 0.05);
      smooth(whooshBand.frequency, freq, 0.05);
    },

    /** chicken lands in the bucket: thump + cardboard knock + crunch, then a small bounce knock */
    land: (vol = 1) => {
      const t = ctx.currentTime + 0.005;

      // low body thump, pitch falling
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.9 * vol, t + 0.006);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      osc.connect(og).connect(master);
      osc.start(t);
      osc.stop(t + 0.4);

      // cardboard knock: short band-passed noise bursts (hit + the bucket's dip/bounce)
      const knock = (at: number, v: number, freq: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = freq;
        bp.Q.value = 1.6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(v * vol, at + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
        src.connect(bp).connect(g).connect(master);
        src.start(at, Math.random());
        src.stop(at + 0.12);
      };
      knock(t, 0.7, 520);
      knock(t + 0.13, 0.22, 640);

      // crispy crunch
      const cr = ctx.createBufferSource();
      cr.buffer = crackle;
      cr.playbackRate.value = 0.9 + Math.random() * 0.2;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;
      const cg = ctx.createGain();
      cg.gain.value = 0.55 * vol;
      cr.connect(hp).connect(cg).connect(master);
      cr.start(t + 0.01);
    },
  };
}
