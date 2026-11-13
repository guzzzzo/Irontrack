let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext
    audioCtx = new AC()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone(freq = 880, duration = 0.15, type = 'sine', volume = 0.2, delay = 0) {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.02)
  } catch (err) {
    // Silencioso si el navegador no permite audio
  }
}

export function playBeep() {
  playTone(880, 0.12, 'sine', 0.25)
  playTone(660, 0.12, 'sine', 0.25, 0.12)
}

export function playSuccess() {
  playTone(523, 0.1, 'sine', 0.2)
  playTone(659, 0.1, 'sine', 0.2, 0.1)
  playTone(784, 0.2, 'sine', 0.2, 0.2)
}

export function playAlert() {
  playTone(392, 0.2, 'triangle', 0.3)
  playTone(330, 0.2, 'triangle', 0.3, 0.25)
  playTone(262, 0.4, 'triangle', 0.3, 0.5)
}

export function playTick() {
  playTone(1046, 0.05, 'sine', 0.12)
}

export function ensureAudioStarted() {
  try {
    getAudioContext()
  } catch (err) {
    // ignore
  }
}

export function vibrate(pattern = [200, 100, 200]) {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  } catch (err) {
    // ignore
  }
}
