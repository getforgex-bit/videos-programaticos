"""Foley original para El motor invisible. Solo requiere la biblioteca estándar."""
import math
import random
import wave
from array import array
from pathlib import Path

RATE = 44100
DURATION = 45
TAU = 2 * math.pi
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "layers/remotion/public/layers/motor-a02.wav"


def smooth(t, a, b):
    u = min(1, max(0, (t - a) / (b - a)))
    return u * u * (3 - 2 * u)


def render():
    rng = random.Random(82)
    track = array("f")
    phase = 0
    for i in range(RATE * DURATION):
        t = i / RATE
        slow = smooth(t, 5.6, 8.2) - smooth(t, 39.6, 42.8)
        focus = smooth(t, 19.1, 20) - smooth(t, 37.2, 38.5)
        phase += TAU * (83 - slow * 23 + 0.4 * math.sin(t * 2)) / RATE
        envelope = (0.86 - slow * 0.30 - focus * 0.43) * smooth(t, 0, .32) * (1 - smooth(t, 44.05, 45))
        rotor = .103 * math.sin(phase) + .073 * math.sin(phase * 2) + .041 * math.sin(phase * 4.0 + .1)
        rotor += .024 * (1 + math.sin(phase / 8) * .6) * math.sin(phase * 8)
        track.append(rotor * envelope)

    def scratch(start, duration, gain):
        last = 0
        for j in range(int(RATE * duration)):
            t = j / RATE
            u = t / duration
            noise = rng.uniform(-1, 1)
            env = math.sin(math.pi * u) ** .72 * (.4 + .6 * math.sin(9 * t + .36) ** 2)
            track[int(RATE * start) + j] += (noise - last) * gain * env * (.7 + .3 * math.cos(52 * t))
            last = noise

    def tap(start, pitch, gain):
        for j in range(int(.4 * RATE)):
            t = j / RATE
            click = rng.uniform(-.8, .8) * math.exp(-160 * t)
            ring = sum(math.sin(TAU * pitch * f * t) * a for f, a in [(1, .7), (2.62, .24), (4.14, .10)])
            track[int(RATE * start) + j] += gain * (click + ring * math.exp(-25 * t))

    for start in [.65, 1.33, 6.27, 7.35, 8.50, 12.70, 13.85, 15.34, 20.38, 21.18, 22.23, 23.51, 28.50, 29.12, 37.71, 42.31]:
        scratch(start, rng.uniform(.27, .56), .054)
    for start, pitch in [(5.68, 610), (12.35, 530), (32.025, 730), (39.05, 295), (40.76, 408), (42.38, 655)]:
        tap(start, pitch, .17)
    samples = array('h', (round(max(-1, min(1, x * 1.85)) * 32767) for x in track))
    import sys
    if sys.byteorder != 'little':
        samples.byteswap()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUTPUT), 'wb') as out:
        out.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        out.writeframes(samples.tobytes())


if __name__ == '__main__':
    render()
