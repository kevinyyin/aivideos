# Generates cues.json for dh015 (narrated cartoon explainer: The Man Who Sold the Eiffel Tower)
# Run: python3 -I videos/dh015-eiffel-sold/make_cues.py   (then python3 -I audio/synth.py dh015-eiffel-sold)
#
# Sound identity: "JAZZ-AGE CAPER". The hook (0-5 s) is Paris only (a park murmur, far traffic, the stamp's KA-CHUNK on
# "sold", the SOLD tag flapping down); the score ENTERS on "dealer." with a soft boom: a sly D-minor swing at 112 bpm, a
# walking bass + piano comps on 2 and 4 + a felt-rim ride, accordion reeds (pad reed: Paris musette) on the chords over
# one long low D-A drone (no dropouts), a chromatic "creeping" mallet motif at each new scheme, eighth-note bass for the
# train out, hushed bars for the shame + the question, the full groove back for the reveal, a four-on-the-floor kick
# under the club analogy, and a soft brass sting on "apprentice". Narration (make_voice.py -> timeline.json) is its own
# stem; music + ambience duck under it. Picture times come from shots.js's SHOTS table (one source).
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json")))
LINES = TL["lines"]
D = json.load(open(os.path.join(HERE, "story.json")))["duration"]
SH = [(float(a), s, i) for a, s, i in re.findall(r"\{ t0: ([\d.]+), set: '(\w+)', id: '(\w+)'", open(os.path.join(HERE, "shots.js")).read())]
CUT = {i: a for a, s, i in SH}
def span(i):
    k = [x[2] for x in SH].index(i); return SH[k][0], (SH[k + 1][0] if k + 1 < len(SH) else D)
def nw(lid, i):   # start of word i of a line (video time)
    a, b = LINES[lid]; return [w[0] for w in TL["words"] if a - 0.01 <= w[0] < b + 0.01][i]

M0, BEAT = nw("n01_hook", 18), 60 / 112          # bar 0 = "dealer."
BAR = 4 * BEAT
bar = lambda n: round(M0 + n * BAR, 3)
nbar = lambda t: int((t - M0) // BAR)
SW = 2 / 3                                        # swung eighth: the "and" lands 2/3 through the beat
SECT = [  # (from, chord cycle, flag)
    (M0, ["Dm", "Dm", "Gm", "A7"], ""),                       # the rusting tower, the letterhead
    (CUT["invite"], ["Dm", "Bb", "Gm", "A7"], ""),             # the hotel, the pitch
    (CUT["secret"], ["Gm", "A7"], "quiet"),                    # "top secret"
    (CUT["limo"], ["Bb", "F", "Gm", "A7"], ""),                # the limousine tour, the big shot
    (CUT["wife"], ["Gm", "A7"], "quiet"),                      # "smelled fishy"
    (CUT["paid"], ["Dm", "A7"], "gallop"),                     # paid -> the night train
    (CUT["shame"], ["Gm", "Dm"], "quiet"),                     # too embarrassed
    (CUT["again"], ["Dm", "Gm", "A7", "Dm"], ""),              # back to sell it again
    (CUT["police"], ["Gm", "A7"], "quiet"),                    # the tip-off
    (CUT["america"], ["F", "C7"], ""),                         # America
    (CUT["question"], ["Bb", "A7"], "quiet"),                  # "So why did Poisson ignore his own wife?"
    (CUT["reveal"], ["Dm", "Gm", "C7", "F", "Bb", "Gm", "A7", "Dm"], ""),   # the bribe
    (CUT["bouncer"], ["Dm", "Gm", "A7", "Dm"], "club"),        # the bouncer
    (CUT["island"], ["Dm", "Bb", "Gm", "A7", "Dm"], "quiet"),  # Alcatraz, the cell, the certificate
]
PLAN, FLAG = [], []
for n in range(int((D - M0) / BAR) + 1):
    t = bar(n); k = max(i for i, s_ in enumerate(SECT) if s_[0] <= t + 0.3)
    n0 = min(m for m in range(n + 1) if max(i for i, s_ in enumerate(SECT) if s_[0] <= bar(m) + 0.3) == k)
    PLAN.append(SECT[k][1][(n - n0) % len(SECT[k][1])]); FLAG.append(SECT[k][2])
ROOT = {"Dm": 38, "Gm": 43, "A7": 45, "Bb": 46, "F": 41, "C7": 36}
TONES = {"Dm": [0, 3, 7, 9], "Gm": [0, 3, 7, 10], "A7": [0, 4, 7, 10], "Bb": [0, 4, 7, 9], "F": [0, 4, 7, 9], "C7": [0, 4, 7, 10]}
VOICE = {"Dm": [57, 62, 65], "Gm": [58, 62, 67], "A7": [55, 61, 64], "Bb": [58, 62, 65], "F": [57, 60, 65], "C7": [58, 60, 64]}
chords, melody, pad, drums = [], [], [], []
for n, c in enumerate(PLAN):
    t0 = bar(n)
    if t0 >= D - 0.4: break
    chords.append([t0, c])
    q, gal, club = FLAG[n] == "quiet", FLAG[n] == "gallop", FLAG[n] == "club"
    nxt = ROOT[PLAN[n + 1]] if n + 1 < len(PLAN) else ROOT["Dm"]
    r, tn = ROOT[c], TONES[c]
    walk = [r, r + tn[1], r + tn[2], nxt + (1 if (nxt - r) % 12 > 6 else -1)]   # root, third, fifth, a chromatic step into the next root
    bv = 0.3 if q else 0.4
    for k, m in enumerate(walk):
        tb = t0 + k * BEAT
        if gal:   # the train: running eighths in the bass
            melody.append([round(tb, 3), m, bv, False, 0.24]); melody.append([round(tb + BEAT * SW, 3), m + 12 if k % 2 else m + 7, bv * 0.7, False, 0.16])
        else: melody.append([round(tb, 3), m, bv * (1.0 if k == 0 else 0.86), False, 0.42 if q else 0.36])
    for k in (1, 3):   # comps on 2 and 4 (quiet bars: softer, held longer, never gone)
        for j, m in enumerate(VOICE[c]): melody.append([round(t0 + k * BEAT + 0.006 * j, 3), m, 0.12 if q else 0.16, False, 0.4 if q else 0.18])
    if not q and n % 2:
        for j, m in enumerate(VOICE[c]): melody.append([round(t0 + 3 * BEAT + BEAT * SW + 0.006 * j, 3), m + 12 if j == 2 else m, 0.11, False, 0.12])   # swung push
    pad.append({"t0": t0, "t1": round(min(D - 0.2, t0 + BAR + 0.4), 3), "chord": c, "level": 0.95 if q else 0.7, "attack": 0.12, "release": 0.5, "reed": True, "cutoff": 2200})
    if club:
        drums += [[round(t0 + k * BEAT, 3), 0.42, "kick"] for k in range(4)]
    for k in range(4):   # felt-rim ride: 2 + 4 louder, a swung "and" after each
        if q and k % 2 == 0: continue
        drums.append([round(t0 + k * BEAT, 3), 0.1 if k % 2 == 0 else 0.16, "tick"])
        if not q: drums.append([round(t0 + k * BEAT + BEAT * SW, 3), 0.07, "tick"])
    if not q and not club: drums.append([t0, 0.18, "tom"])
pad.append({"t0": M0 - 0.2, "t1": D - 0.1, "notes": [26, 33], "level": 0.62, "attack": 0.8, "release": 0.9, "hp": 34})   # D-A drone under it all
drums += [[M0, 0.5, "boom"], [CUT["reveal"], 0.42, "boom"], [nw("n18_alcatraz", 6), 0.42, "boom"]]

# ---------------------------------------------------------------- melodies
E = BEAT / 2
mallet, brass = [], []
def tune(t, notes, vel=0.24, step=E):   # notes: midi | None (rest) | (midi, length in steps); swung pairs
    for i, x in enumerate(notes):
        m, ln = x if isinstance(x, tuple) else (x, 1)
        if m: mallet.append([round(t, 3), m, vel, round(step * ln * 0.85, 3)])
        t += step * ln * ((2 * SW) if i % 2 == 0 and ln == 1 else (2 * (1 - SW)) if ln == 1 else 1)
def br(t, notes, vel=0.3, step=E):
    for x in notes:
        m, ln = x if isinstance(x, tuple) else (x, 1)
        if m: brass.append([round(t, 3), m, vel, round(step * ln * 0.92, 3)])
        t += step * ln
CREEP = [69, 70, 71, 72, 73, 74, None, 69, 77, 76, 75, 74, (73, 3), None]   # a chromatic creep up to D, a slink back to C#
tune(bar(1), CREEP)                                    # the letterhead
tune(bar(nbar(CUT["invite"]) + 1), CREEP, 0.22)        # the pitch
tune(bar(nbar(CUT["limo"])), [74, 77, 81, 77, 79, 77, (74, 4)], 0.22)   # the tour
tune(nw("n07_poisson", 12) - 0.05, [81, 86, (89, 4)], 0.26)            # "big shot": a puffed-up sparkle
tune(bar(nbar(CUT["reveal"]) + 1), CREEP, 0.24)        # the reveal
tune(nw("n16_dare", 9) - 0.04, [86, 89, (93, 4)], 0.24)                 # "real."
br(nw("n12_america", 9) - 0.03, [(65, 1), (69, 1), (72, 1), (77, 4)], 0.3)          # America: a small fanfare
br(nw("n19_payoff", 14) - 0.02, [(62, 2), (65, 2), (69, 2), (74, 6)], 0.26)          # "apprentice": the last word lands

# ---------------------------------------------------------------- ambience (by place)
amb = []
def A(sound, t0, t1, g, seed, **args):
    amb.append({"sound": sound, "t0": round(t0, 2), "t1": round(t1, 2), "fade_in": 0.3 if t0 < 0.1 else 0.06, "fade_out": 0.06, "gain_db": g, "seed": seed, "args": args})
BED = {"paris": [("city_day", -33, dict(murmur=0.7, traffic=0.25)), ("wind", -44, dict(darkness=0.6, gust=0.3, whistle=0.0))],
       "suite": [("room_tone", -36, {})], "yard": [("city_day", -36, dict(murmur=0.3, traffic=0.6))],
       "train": [("rocket_rumble", -36, dict(rise=0.0)), ("room_tone", -38, {})], "deck": [("sea_waves", -31, dict(period=5.0)), ("wind", -42, dict(darkness=0.6, gust=0.4, whistle=0.0))],
       "club": [("city_day", -38, dict(murmur=0.9, traffic=0.4))], "island": [("sea_waves", -30, dict(period=6.5)), ("wind", -40, dict(darkness=0.7, gust=0.5, whistle=0.05))],
       "cell": [("room_tone", -36, {}), ("lamp_hum", -46, {})]}
runs = []
for k, (a, s, i) in enumerate(SH):
    b = SH[k + 1][0] if k + 1 < len(SH) else D
    if runs and runs[-1][0] == s: runs[-1][2] = b
    else: runs.append([s, a, b])
for j, (s, a, b) in enumerate(runs):
    for k, (snd, g, args) in enumerate(BED[s]): A(snd, a, b, g, 10 + j * 3 + k, **args)
A("clock", *span("reveal")[:1], span("real")[1], -40, 60)                               # the flashback: a mantel clock

# ---------------------------------------------------------------- foley
ev = []
def F(t, sound, g, pan=0.0, room=-16, **args):
    ev.append({"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room, "args": args})
F(1.97, "wood_knock", -24, 0.0, pitch=0.7, dur=0.5); F(1.99, "bonk", -30, 0.0, dur=0.4)          # KA-CHUNK: SOLD
F(3.05, "blanket_rustle", -28, 0.0, dur=0.5, intensity=0.8); F(3.1, "boing", -32, 0.0, pitch=0.7, dur=0.6)   # the giant tag unfurls
F(nw("n02_world", 5) - 0.05, "metal_groan", -32, 0.2, dur=1.2, pitch=0.9)                           # "rusting"
for k in range(5): F(6.6 + k * 0.27, "metal_clang", -42, 0.3 - k * 0.1, size=0.15, pitch=2.6 + k * 0.1, dur=0.3)   # flakes tinkle down
F(10.46, "wood_knock", -28, 0.2, pitch=0.9, dur=0.4); F(10.48, "bonk", -34, 0.2, dur=0.3)       # the CONFIDENTIEL stamp
F(CUT["invite"] + 0.02, "door_open", -32, 0.5, creak=0.6)
for k in range(9): F(CUT["invite"] + 0.25 + k * 0.29, "footstep", -38, 0.5 - k * 0.08, weight=0.6, scuff=0.4)   # the dealers file in
F(17.98, "blanket_rustle", -30, 0.3, dur=0.45, intensity=0.8)                                   # the easel cover drops
F(CUT["limo"] + 0.1, "car_pass", -30, -0.4, dur=2.8, size=1.0)                                    # the tourer drives past
F(nw("n07_poisson", 12) - 0.08, "boing", -30, 0.0, pitch=0.62, dur=0.6)                         # "big shot": he puffs up
F(nw("n08_wife", 6) + 0.05, "fish_blub", -30, -0.2, n_bub=3, dur=0.5)                           # "fishy."
F(28.8, "blanket_rustle", -32, 0.0, dur=0.3, intensity=0.6)                                      # the envelope changes hands
for k in range(9): F(CUT["train"] + 0.05 + k * 0.268, "wood_knock", -40 - (k % 2) * 2, 0.0, pitch=0.55, dur=0.25)   # clickety-clack
for k in range(3): F(30.95 + k * 0.16, "blanket_rustle", -34, 0.1, dur=0.12, intensity=0.6, softness=0.75)          # francs fan out
for k in range(4): F(CUT["shame"] + 0.1 + k * 0.36, "footstep", -38, 0.2, weight=0.7, scuff=0.5)
F(33.42, "plush_squeak", -34, 0.1, pitch=0.7, dur=0.18)                                           # "eep": hands over his face
for k in range(3): F(33.75 + k * 0.4, "footstep", -40, 0.0, weight=0.7, scuff=0.5)
F(CUT["again"] + 0.02, "door_open", -34, 0.4, creak=0.5)
F(CUT["police"] + 0.05, "phone_pickup", -30, 0.3)
F(CUT["america"] + 0.15, "car_horn", -34, -0.3, dur=1.1, pitch=0.35, distance=3.0)               # the liner's horn
F(nw("n12_america", 9) + 0.25, "boing", -36, 0.1, pitch=1.2, dur=0.4)                            # the hat tip
F(CUT["question"] + 0.05, "low_swell", -34, 0.0, dur=1.6, pitch=0.8)
F(CUT["reveal"] - 0.2, "low_swell", -32, 0.0, dur=1.0, pitch=1.0)                               # into the flashback
for k in range(3): F(44.15 + k * 0.12, "blanket_rustle", -40, -0.1, dur=0.08, intensity=0.5, softness=0.8)   # fingers rub
F(47.5, "blanket_rustle", -32, 0.1, dur=0.6, intensity=0.5, softness=0.7)                        # the envelope slides over
F(49.55, "plush_place", -34, -0.1)                                                               # into his pocket
F(50.78, "boing", -36, 0.1, pitch=1.4, dur=0.5)                                                  # Poisson glows
F(52.85, "blanket_rustle", -34, 0.1, dur=0.2, intensity=0.5)                                     # the twenty
F(53.8, "metal_clang", -36, 0.2, size=0.25, pitch=2.2, dur=0.4)                                  # the rope unclips
for k in range(4): F(54.15 + k * 0.28, "footstep", -38, 0.0, weight=0.6, scuff=0.4)
F(CUT["island"] + 0.3, "car_horn", -38, -0.2, dur=1.6, pitch=0.3, distance=4.0)                 # a foghorn on the bay
F(nw("n18_alcatraz", 5) + 0.02, "metal_clang", -26, 0.0, size=1.1, pitch=0.8, dur=1.0)           # the cell door
F(CUT["postcard"] + 0.05, "blanket_rustle", -38, 0.0, dur=0.2, intensity=0.4)
F(nw("n19_payoff", 14) - 0.05, "pen_scribble", -34, 0.0, dur=0.6)                                # the highlighter on "apprentice"
ev = [e for e in ev if e["t"] < D - 0.3]

voice = [{"t": LINES[k][0], "file": f"voice/fast/{k}.wav", "gain_db": 0.0, "pan": 0.0} for k in LINES]
cues = {
    "title": "dh015 - The Man Who Sold the Eiffel Tower (explainer: jazz-age caper, D-minor swing + accordion reeds, Brian narrating)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [round(D - 0.45, 2), D],
    "stem_gain_db": {"music": -1.5, "sfx": 13.0, "amb": 10.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": [[0.0, M0]],
    "ambience": amb, "voice": voice, "voice_duck_db": -7.0, "events": ev,
    "music": {
        "instrument": "piano", "gain_db": 0.0, "reverb_db": -12.0, "pad_db": -3.0, "pad_reverb_db": -6.0, "mallet_db": -3.0,
        "drums_db": -8.0, "brass_db": -6.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
        "chords": chords, "sections": [], "melody": melody, "mallet_melody": mallet, "brass_melody": brass, "pad": pad,
        "drums": drums, "drum_patterns": [], "stings": [], "ducks": [],
        "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6000, "q": 0.6, "db": -4.0}],
    },
}
json.dump(cues, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print(f"music in at {M0:.2f}; {len(PLAN)} bars; cues: {len(ev)} events, {len(amb)} beds, {len(melody)} piano, {len(mallet)} mallet, {len(brass)} brass, {len(drums)} drums, {len(voice)} voice lines")
