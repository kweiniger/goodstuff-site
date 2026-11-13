/** Tiny generated UI sounds. Off until the visitor turns them on; nothing is downloaded. */
export type SoundKind = "click" | "open" | "close" | "trash" | "pop" | "nope" | "chime";

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on && !ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      ctx = null;
    }
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.08) {
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function crumple() {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * 0.35);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * (Math.random() > 0.7 ? 1 : 0.3);
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  f.type = "bandpass";
  f.frequency.value = 1800;
  g.gain.value = 0.12;
  src.buffer = buf;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start();
}

export function play(kind: SoundKind) {
  if (!enabled || !ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  switch (kind) {
    case "click": return tone(1400, 0, 0.04, "triangle", 0.05);
    case "open": tone(520, 0, 0.09); return tone(780, 0.06, 0.12);
    case "close": tone(700, 0, 0.08); return tone(460, 0.05, 0.1);
    case "pop": return tone(900, 0, 0.07, "triangle");
    case "nope": tone(220, 0, 0.12, "square", 0.04); return tone(180, 0.1, 0.16, "square", 0.04);
    case "chime": tone(660, 0, 0.3); tone(880, 0.12, 0.3); return tone(1320, 0.24, 0.45);
    case "trash": return crumple();
  }
}
