"""Sonido original de El motor invisible, R02. Solo usa la biblioteca estándar."""
from array import array
import math
from pathlib import Path
import random
import sys
import wave

RATE = 44100
DURATION = 30
TAU = 2 * math.pi
OUTPUT = Path(__file__).resolve().parents[1] / "layers/remotion/public/layers/motor-a02-r02.wav"


def smooth(t, a, b):
    u = min(1, max(0, (t - a) / (b - a)))
    return u * u * (3 - 2 * u)


def render():
    rng = random.Random(204)
    left = array("f")
    right = array("f")
    phase = 0
    for i in range(RATE * DURATION):
        t = i / RATE
        macro = smooth(t, .9, 2.2) - smooth(t, 3.05, 4.1)
        detail = smooth(t, 9.8, 11.5) - smooth(t, 25.6, 28.3)
        phase += TAU * (78 + macro * 14 - detail * 20 + .6 * math.sin(t * 2.4)) / RATE
        envelope = (.7 + .24 * macro - .51 * detail) * smooth(t, 0, .06) * (1 - smooth(t, 29.42, 30))
        rotor = (.118 * math.sin(phase) + .072 * math.sin(phase * 2 + .24)
                 + .035 * math.sin(phase * 4 + .1) + .017 * math.sin(phase * 8))
        left.append(rotor * envelope)
        right.append(rotor * envelope * .97)

    def mix(start, samples, pan=0):
        offset = round(start * RATE)
        for j, sample in enumerate(samples):
            pos = offset + j
            if pos >= len(left):
                break
            left[pos] += sample * (1 - .42 * pan)
            right[pos] += sample * (1 + .42 * pan)

    def knock(start, pitch, gain, pan=0, length=.50):
        def notes():
            for j in range(int(RATE * length)):
                t = j / RATE
                attack = min(1, t * 600)
                body = math.sin(TAU * pitch * t) * math.exp(-11 * t)
                wood = .39 * math.sin(TAU * 1.997 * pitch * t) * math.exp(-24 * t)
                metal = .19 * math.sin(TAU * 3.04 * pitch * t) * math.exp(-36 * t)
                yield gain * (attack * (body + wood + metal) + rng.uniform(-.42, .42) * math.exp(-175*t))
        mix(start, notes(), pan)

    def sweep(start, length, gain, pan, pencil=False):
        def friction():
            low = high = 0
            for j in range(int(RATE * length)):
                t = j / RATE
                u = t / length
                noise = rng.uniform(-1, 1)
                low += (.05 + .27 * u) * (noise - low)
                high += .024 * (low - high)
                grain = (.56 + .44 * math.cos(TAU * (28*t + 19*t*t))) if pencil else 1
                yield gain * (low - high) * math.sin(math.pi*u)**.86 * grain
        mix(start, friction(), pan)

    # The pulse moves from the driving shaft to the contact and then to each side of the coil.
    for event in [
        (.02,147,.18,.25),(.55,220,.09,.1),(1.76,294,.15,.45),(3.35,165,.17,-.25),
        (5.65,196,.13,-.5),(6.25,247,.10,-.4),(7.17,330,.21,-.25),(8.15,220,.13,.1),
        (8.80,277,.11,.28),(9.48,330,.13,.45),(11.13,196,.18,-.55),(11.85,294,.13,.45),
        (13.42,247,.19,-.57),(15.31,185,.20,.58),(17.30,220,.19,-.18),(17.80,277,.12,.12),
        (18.30,330,.16,.31),(20.01,196,.15,-.12),(21.30,247,.10,-.52),(22.32,392,.23,.5),
        (23.18,294,.10,.19),(24.22,247,.13,.12),(25.72,147,.23,-.3),(26.65,196,.17,-.15),
        (27.53,247,.22,.35),(28.13,330,.22,.12),(28.53,165,.17,0),
    ]:
        knock(*event)
    for start, length, gain, pan in [
        (1.02,.75,.16,.4),(2.99,.56,.20,-.28),(5.39,.71,.14,-.52),(7.73,.71,.15,.4),
        (10.62,.52,.24,.15),(14.94,.42,.15,.53),(17.03,.38,.13,-.22),
        (19.55,.49,.21,.18),(22.10,.23,.11,-.4),(24.90,.60,.23,-.33),(27.83,.30,.12,.2),
    ]:
        sweep(start,length,gain,pan)
    for start,length in [(.09,.45),(3.40,.45),(3.98,.68),(4.77,.25),(5.98,.37),
                         (8.15,.30),(11.43,.45),(13.40,.34),(15.27,.32),(17.29,.39),(26.28,.38)]:
        sweep(start,length,.25,rng.uniform(-.4,.4),True)

    samples = array('h')
    for lch, rch in zip(left, right):
        samples.extend(round(max(-1, min(1, value * 1.86)) * 32767) for value in (lch, rch))
    if sys.byteorder != 'little':
        samples.byteswap()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUTPUT), 'wb') as out:
        out.setparams((2, 2, RATE, 0, 'NONE', 'not compressed'))
        out.writeframes(samples.tobytes())


if __name__ == '__main__':
    render()
