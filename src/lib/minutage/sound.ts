/**
 * Timer sounds, synthesised with the Web Audio API: no audio files to ship or
 * license. Browsers only allow sound after a user gesture, so `unlock()` must
 * be called from a click handler (the Start button).
 */
export function createBeeper() {
  let ctx: AudioContext | null = null;

  function tone(frequency: number, delay: number, duration: number) {
    if (!ctx) return;
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    // Short fade in and out: avoids the click of an abrupt start/stop.
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.25, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  return {
    unlock() {
      ctx ??= new AudioContext();
      void ctx.resume();
    },
    /** A step begins: one short high note. */
    stepStart() {
      tone(880, 0, 0.18);
    },
    /** A step ends: one longer low note. */
    stepEnd() {
      tone(440, 0, 0.4);
    },
    /** The whole parcours is finished: three rising notes. */
    finished() {
      tone(523.25, 0, 0.2);
      tone(659.25, 0.22, 0.2);
      tone(783.99, 0.44, 0.5);
    },
    close() {
      void ctx?.close();
      ctx = null;
    },
  };
}

export type Beeper = ReturnType<typeof createBeeper>;
