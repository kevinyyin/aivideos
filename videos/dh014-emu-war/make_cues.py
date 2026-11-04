# Generates cues.json for dh014 (narrated cartoon explainer, v2 viral re-cut Nov 2 2026)
# Run: python3 -I videos/dh014-emu-war/make_cues.py   (then python3 -I audio/synth.py dh014-emu-war)
#
# Sound identity: "BUSH-BAND MARCH". The hook (0-5 s) is outback sound only (wind, the gun cocked, a far crow, pecking);
# the score ENTERS on "bird" with a bugle call + a boom: a 2/4 march at 112 bpm in B-flat (piano oom-pah, a soft
# xylophone "fife" tune, a frame-drum tom on 1), G minor for the jam, the retreat, the question and the dusk, taiko under
# the emu formation, a sad-trombone fall after "jams", a deliberately WRONG chord (B major) on "Emus don't do lines", and a
# brass "ta-da" + boom on "Undefeated." The narration (make_voice.py -> timeline.json) is its own stem; music + ambience
# duck under it. v2: recut.js maps every v1 picture onto the new lines, so the v1 foley (v1 times) goes through nts().
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json")))
LINES = TL["lines"]
def _js(name, var):   # "export const VAR = <json>;" lines of a generated .js file
    for ln in open(os.path.join(HERE, name)):
        if ln.startswith(f"export const {var} = "): return json.loads(ln.split(" = ", 1)[1].rstrip().rstrip(";"))
V1L, V1W = _js("timeline_v1.js", "LINES"), _js("timeline_v1.js", "WORDS")
RECUT = json.loads(open(os.path.join(HERE, "recut.js")).read().split("export const RECUT = ", 1)[1].rstrip().rstrip(";"))
D = json.load(open(os.path.join(HERE, "story.json")))["duration"]
for i, e in enumerate(RECUT): e["t1"] = RECUT[i + 1]["t0"] if i + 1 < len(RECUT) else D
CUT = {e["shot"]: e["t0"] for e in RECUT}
def words(lines, ws, lid): a, b = lines[lid]; return [w[0] for w in ws if a - 0.01 <= w[0] < b + 0.01]
nw = lambda lid, i: words(LINES, TL["words"], lid)[i]      # v2 word start (video time)
ow = lambda lid, i: words(V1L, V1W, lid)[i]               # v1 word start (v1 choreography time)
def nts(o):
    """video times at which v1 time o plays (a v1 moment can be on screen in two re-cut pictures)"""
    out = []
    for e in RECUT:
        if "src" not in e: continue
        r = e.get("rate", 1.0); a, b = e["src"], e["src"] + r * (e["t1"] - e["t0"])
        if a <= o < b: out.append(round(e["t0"] + (o - a) / r, 3))
    return out

M0, BEAT = nw("n01_hook", 16), 60 / 112          # bar 0 = "bird"
BAR = 2 * BEAT
bar = lambda n: round(M0 + n * BAR, 3)
nbar = lambda t: int((t - M0) // BAR)
SECT = [  # (from, chord cycle, flag)
    (M0, ["Bb", "Bb", "Eb", "Bb", "F7", "F7", "Bb", "Bb"], ""),   # world, minister, newsreel
    (CUT["hook"], ["Bb", "F7", "Bb", "F7"], ""),                  # the army rolls in
    (CUT["split"], ["Gm", "D7"], ""),                             # day one
    (CUT["dam"], ["Gm", "Cm", "D7"], ""),                         # the dam
    (CUT["jam"], ["D7"], "quiet"),                                # he waits...
    (nw("n09_jam", 3) - 0.2, ["Gm"], "quiet"),                   # ...the jam
    (CUT["bolt"], ["Bb", "F7"], "gallop"),                        # truck + chase
    (CUT["tanks"], ["Gm", "Gm", "D7", "D7"], "tank"),             # the formation, 2,500 rounds
    (CUT["retreat"], ["Gm", "Eb", "D7"], "quiet"),                # pull out
    (CUT["news"], ["Bb", "F7"], ""),                              # laughing, the papers
    (CUT["medals"], ["Bb", "F7", "Bb", "F7"], ""),                # parliament
    (CUT["title"], ["Gm", "D7"], "quiet"),                        # "So how do you lose a war to a bird?"
    (CUT["lines"], ["Bb", "Eb", "F7"], ""),                       # the reveal
    (CUT["lookout"], ["Gm", "Cm", "D7", "Gm"], ""),               # tiny groups, lookouts
    (CUT["bowling"], ["Bb", "F7"], "gallop"),                     # bowling
    (CUT["second"], ["Gm", "Eb", "Cm", "D7"], "quiet"),           # round two at dusk
    (CUT["arms"], ["Eb", "F", "Gm", "Bb", "Eb", "F7", "Bb"], ""),  # the coat of arms
]
B_WRONG = nbar(nw("n17_nolines", 0))
PLAN, FLAG = [], []
for n in range(int((D - M0) / BAR) + 1):
    t = bar(n); k = max(i for i, s_ in enumerate(SECT) if s_[0] <= t + 0.3)
    n0 = min(m for m in range(n + 1) if max(i for i, s_ in enumerate(SECT) if s_[0] <= bar(m) + 0.3) == k)
    PLAN.append("B" if n == B_WRONG else SECT[k][1][(n - n0) % len(SECT[k][1])]); FLAG.append(SECT[k][2])
QUIET = {n for n, f in enumerate(FLAG) if f == "quiet"}
GALLOP = {n for n, f in enumerate(FLAG) if f == "gallop"}
TANK = {n for n, f in enumerate(FLAG) if f == "tank"}
ROOT = {"Bb": 34, "Eb": 39, "F7": 41, "F": 41, "Gm": 43, "D7": 38, "Cm": 36, "B": 35}
TRI = {"Bb": [58, 62, 65], "Eb": [58, 63, 67], "F7": [57, 60, 63, 65], "F": [57, 60, 65], "Gm": [58, 62, 67], "D7": [57, 60, 62, 66],
       "Cm": [55, 60, 63], "B": [59, 63, 66]}
chords, melody, pad, drums = [], [], [], []
for n, c in enumerate(PLAN):
    t0 = bar(n)
    if t0 >= D - 0.5: break
    chords.append([t0, c])
    r, q = ROOT[c], n in QUIET
    bv = 0.3 if q else 0.38
    melody.append([t0, r, bv, False, 0.42])
    if n in GALLOP:      # galloping eighths in the bass
        for k in range(1, 4): melody.append([round(t0 + k * BEAT / 2, 3), r + (7 if k % 2 else 12), bv * 0.8, False, 0.2])
    else: melody.append([round(t0 + BEAT, 3), r + 7, bv * 0.85, False, 0.38])
    for k in [1, 3]:     # pah on the offbeats (quiet bars: softer, held longer, never gone)
        for j, m in enumerate(TRI[c]):
            melody.append([round(t0 + k * BEAT / 2 + 0.005 * j, 3), m, (0.13 if q else 0.17), False, 0.34 if q else 0.16])
    pad.append({"t0": t0, "t1": round(min(D, t0 + BAR + 0.45), 3), "chord": c, "level": 0.8 if q else 0.42, "attack": 0.1, "release": 0.5, "cutoff": 1800})
    if n in TANK:
        drums += [[t0, 0.42, "taiko"], [round(t0 + BEAT, 3), 0.36, "taiko"]]
    elif not q:
        drums += [[t0, 0.24, "tom"], [round(t0 + BEAT, 3), 0.15, "tom"]]
    else:
        drums.append([t0, 0.16, "tom"])
T_STOMP = nts(36.2)[0]
drums += [[M0, 0.5, "boom"], [nw("n06_split", 13) - 0.03, 0.32, "boom"], [T_STOMP, 0.62, "boom"], [nw("n22_undefeated", 0), 0.6, "boom"]]

# ---------------------------------------------------------------- melodies
E = BEAT / 2
mallet = []
def tune(n0, notes, vel=0.26, step=E):   # notes: midi or None (rest); a held note = negative length marker via tuple
    t = bar(n0)
    for x in notes:
        if isinstance(x, tuple): m, ln = x
        else: m, ln = x, 1
        if m: mallet.append([round(t, 3), m, vel, round(step * ln * 0.9, 3)])
        t += step * ln
MARCH = [77, 77, 79, 77, 74, 70, 72, 74, 75, 75, 79, 75, (74, 4), 72, 72, 74, 75, 77, 75, 74, 72, 70, 74, 77, 74, (70, 4)]
tune(1, MARCH, 0.24)                                   # bars 1-8: the world, the minister, the newsreel
tune(nbar(CUT["lines"]) + 1, MARCH[:12] + [(74, 4)], 0.24)  # the reveal: the neat line
tune(B_WRONG, [(71, 1), 75, 78, (83, 2), None, None], 0.24)  # the wrong-chord slip (B major) under "Emus don't do lines"
brass = []
def br(t, notes, vel=0.34, step=E):
    for x in notes:
        m, ln = x if isinstance(x, tuple) else (x, 1)
        if m: brass.append([round(t, 3), m, vel, round(step * ln * 0.92, 3)])
        t += step * ln
br(M0 - 4 * E * 0.5, [(65, 0.5), (65, 0.5), (70, 1), (74, 1), (77, 4)], 0.36)      # bugle call into "bird"
tj = LINES["n09_jam"][1] + 0.02                                                       # sad trombone after "jams."
br(tj, [(62, 0.55), (61, 0.55), (60, 0.55), (59, 2.4)], 0.3, 0.24)
br(bar(nbar(CUT["retreat"])) + 0.02, [(67, 2), (62, 2), (55, 4)], 0.24)               # pull out: a falling bugle
nA = nbar(CUT["arms"]) + 1
br(bar(nA), [(63, 1), (65, 1), (67, 1), (70, 3), (67, 1), (70, 1), (72, 4)], 0.28)    # the arms: rising
tU = nw("n22_undefeated", 0)
br(tU - 0.02, [(65, 1), (70, 1), (74, 1), (77, 6)], 0.4)                             # "Undefeated." ta-da
br(tU + 4 * E, [(70, 6)], 0.26)

# ---------------------------------------------------------------- ambience (by picture)
amb = []
def A(sound, t0, t1, g, seed, **args):
    amb.append({"sound": sound, "t0": round(t0, 2), "t1": round(t1, 2), "fade_in": 0.3 if t0 < 0.1 else 0.06, "fade_out": 0.06, "gain_db": g, "seed": seed, "args": args})
BED = {"out": ("wind", -31, dict(darkness=0.55, gust=0.45, whistle=0.08)), "tent": ("room_tone", -34, {}), "parl": ("city_day", -38, dict(murmur=0.9, traffic=0.0)),
       "news": ("room_tone", -38, {}), "alley": ("room_tone", -35, {}), "arms": ("wind", -42, dict(darkness=0.7, gust=0.2, whistle=0.0))}
runs = []   # merge consecutive pictures in the same place into one bed
for e in RECUT:
    if runs and runs[-1][0] == e["set"]: runs[-1][2] = e["t1"]
    else: runs.append([e["set"], e["t0"], e["t1"]])
for i, (st, a, b) in enumerate(runs):
    snd, g, args = BED[st]; A(snd, a, b, g, 10 + i, **args)
for i, sh in enumerate(["stakes", "farm", "title"]):   # wheat rustle under the field + the feast
    e = next(x for x in RECUT if x["shot"] == sh); A("dry_leaves", e["t0"], e["t1"], -40, 20 + i, density=0.7)
A("rocket_rumble", CUT["chase"], CUT["tanks"], -40, 22, rise=0.1)                       # the truck engine flat out
A("crowd_cheer", CUT["news"] + 0.1, nw("n13_laugh", 7), -36, 24)                         # people laughing back home
A("crowd_cheer", nw("n14_medals", 11) + 0.1, CUT["title"], -37, 25)                      # parliament laughs at the medal
A("crickets", CUT["second"], CUT["arms"], -36, 26)
A("rocket_rumble", CUT["bowling"] + 0.05, CUT["second"], -38, 27, rise=0.0)              # the ball rolling down the lane

# ---------------------------------------------------------------- foley
ev = []
def F(t, sound, g, pan=0.0, room=-16, **args):
    ev.append({"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room, "args": args})
def F1(o, sound, g, pan=0.0, room=-16, **args):   # a v1 cue (v1 time) wherever that moment plays in v2
    for t in nts(o): F(t, sound, g, pan, room, **args)
# v2 pictures (video time)
F(0.12, "metal_clang", -30, 0.15, size=0.35, pitch=1.9, dur=0.5)                        # frame 0: the gun is cocked
F(0.75, "crow_caw", -38, -0.4, -10, pitch=0.85)
F(nw("n01_hook", 7), "plush_squeak", -34, 0.0, pitch=0.9, dur=0.14)                     # the emu frowns down the barrel
for k in range(12): F(2.95 + k * 0.19 + (k % 3) * 0.04, "wood_knock", -40 - (k % 3), (k % 5 - 2) * 0.2, pitch=2.4 + (k % 4) * 0.2, dur=0.12)   # 600 emus pecking
F(nw("n03_minister", 7) - 0.15, "boing", -30, -0.2, pitch=1.2, dur=0.5)                  # the target pops up
for k in range(13): F(11.15 + k * 0.135, "wood_knock", -44, 0.25, pitch=1.6, dur=0.08)   # the newsreel camera cranks
F(11.3, "car_pass", -34, -0.4, -20, dur=2.2, size=1.2)                                   # the truck far down the road
for k in range(6): F(CUT["news"] + 0.15 + k * 0.33, "plush_squeak", -40, (k % 3 - 1) * 0.3, pitch=1.4 + (k % 2) * 0.2, dur=0.09)   # chuckles
F(CUT["title"] + 0.02, "boing", -30, 0.25, pitch=1.25, dur=0.5)                          # the emu pops out of the wheat
for k, t in enumerate([50.45, 51.15, 51.85]): F(t, "plush_squeak", -40, (k % 2 - 0.5) * 0.4, pitch=1.2, dur=0.1)   # lookouts turn
F(nw("n18_lookout", 10) - 0.1, "boing", -32, 0.0, pitch=1.3, dur=0.5)                    # the tall bird stretches up
tRun = nw("n19_bowling", 5) + 0.1
F(tRun, "poof", -28, 0.0, size=1.0, dur=0.7)
for k in range(14): F(tRun + 0.05 + k * 0.06, "footstep", -38, (k % 5 - 2) * 0.3, weight=0.45, scuff=0.6)   # pins run off
for k in range(10): F(nts(ow("l06_jam", 3))[0] + 0.25 + k * 0.1, "footstep", -38, (k % 5 - 2) * 0.25, weight=0.45, scuff=0.6)   # they scatter from the jam
# v1 pictures (v1 times, mapped)
F1(5.3, "car_pass", -26, -0.2, -20, dur=2.4, size=1.4)                                   # the army truck rolls in
for k in range(14): F1(7.0 + k * 0.23 + (k % 3) * 0.05, "wood_knock", -40 - (k % 3), (k % 5 - 2) * 0.15, pitch=2.4 + (k % 4) * 0.2, dur=0.12)   # pecking
for w in [ow("l03_army", 6), ow("l03_army", 6) + 0.18]: F1(w, "boing", -32, 0.25, pitch=1.4, dur=0.4)   # soldiers pop in
for k in range(2): F1(ow("l03_army", 8) + k * 0.22, "metal_clang", -30, -0.2, size=0.5, pitch=1.6, dur=0.6)   # guns pop in
for i in range(6): F1(ow("l03_army", 11) + i * 0.09 + 0.05, "wood_knock", -30, 0.3, pitch=0.9, dur=0.35)    # ammo crates land
tS = ow("l04_split", 5)
F1(tS - 0.05, "poof", -24, 0.1, size=2.0, dur=0.9)                                                          # the flock splits
for k in range(12): F1(tS + 0.15 + k * 0.11, "footstep", -38, (k % 5 - 2) * 0.25, weight=0.45, scuff=0.6)   # scattering feet
for k in range(9): F1(18.9 + k * 0.36, "giant_step", -38 + k * 0.6, 0.0, size=0.55)                        # the column marches
tJ = ow("l06_jam", 3)
F1(tJ, "metal_clang", -24, -0.15, size=0.7, pitch=1.5, dur=0.8); F1(tJ + 0.05, "poof", -30, -0.15, size=0.6, dur=0.6)
F1(tJ + 0.45, "boing", -34, -0.1, pitch=0.8, dur=0.5)                                                      # a spring pings out
tB = ow("l07_truck", 2)
F1(tB + 0.3, "metal_clang", -22, -0.2, size=1.1, pitch=1.0, dur=1.0); F1(tB + 0.3, "poof", -32, -0.2, size=0.7)   # gun lands on the mount
for k in range(3): F1(tB + 0.5 + k * 0.42, "metal_clang", -32, -0.1, size=0.35, pitch=2.2, dur=0.4)        # wrench
for k in range(9): F1(25.7 + k * 0.299, "giant_step", -36, 0.0, size=0.7)                                  # truck bouncing over ruts
for k in range(16): F1(25.65 + k * 0.19, "footstep", -38, 0.3 * ((-1) ** k), weight=0.5, scuff=0.5)      # emus running
for k in range(5): F1(26.95 + k * 0.49, "boing", -33, 0.1, pitch=0.9, dur=0.45)                            # the gunner bouncing
for k in range(3): F1(29.95 + k * 0.12, "plush_squeak", -36, 0.2, pitch=1.3, dur=0.1)                      # victory hops
F1(30.5, "blanket_rustle", -32, 0.0, dur=0.5, intensity=0.6); F1(31.05, "poof", -34, 0, size=0.5, dur=0.5)   # the paper lands
for k in range(10): F1(32.6 + k * 0.385, "giant_step", -33 + k * 0.4, 0.0, size=1.0 + k * 0.04)            # tank formation
F1(36.2, "giant_step", -24, 0.0, size=2.0); F1(36.2, "poof", -28, 0.0, size=2.2, dur=1.2)
F1(ow("l12_medals", 7), "boing", -28, 0.0, pitch=1.15, dur=0.6)                                            # the medal pops up
for k in range(7): F1(40.1 + k * 0.24, "wood_knock", -40, -0.2 + k * 0.06, pitch=2.8, dur=0.1)             # pointer taps the toy line
tN = ow("l14_nolines", 0) - 0.1
F1(tN, "poof", -28, 0.0, size=0.8, dur=0.7)
for k in range(14): F1(tN + 0.3 + k * 0.09 + (k % 3) * 0.02, "wood_knock", -36, (k % 5 - 2) * 0.2, pitch=2.0 + (k % 4) * 0.25, dur=0.12)   # toys topple
for k in range(5): F1(tN + 0.2 + k * 0.25, "plush_squeak", -36, (k % 3 - 1) * 0.3, pitch=1.6 + (k % 2) * 0.2, dur=0.09)
for k in range(0, 34, 2): F1(43.95 + k * 0.105 + 0.35, "wood_knock", -36 + (k % 4), (k % 6 - 3) * 0.1, pitch=0.9, dur=0.3)   # the crate pile grows
for k in range(6): F1(47.15 + k * 0.45, "wood_knock", -40, 0.25, pitch=2.3, dur=0.12)                     # emu pecks the pile
for k in range(5): F1(51.5 + k * 0.24, "footstep", -38, 0.3, weight=0.55, scuff=0.4)                       # the emu walks onto the arms
F(nw("n22_undefeated", 0) - 0.02, "plush_squeak", -34, 0.15, pitch=0.9, dur=0.16)
ev = [e for e in ev if e and e["t"] < D - 0.3]

voice = [{"t": LINES[k][0], "file": f"voice/fast/{k}.wav", "gain_db": 0.0, "pan": 0.0} for k in LINES]

cues = {
    "title": "dh014 v2 - the Emu War, viral re-cut (explainer: bush-band march, Brian narrating)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [round(D - 0.5, 2), D],
    "stem_gain_db": {"music": -1.5, "sfx": 13.0, "amb": 10.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": [[0.0, M0]],
    "ambience": amb, "voice": voice, "voice_duck_db": -7.0, "events": ev,
    "music": {
        "instrument": "piano", "gain_db": 0.0, "reverb_db": -12.0, "pad_db": -4.0, "pad_reverb_db": -6.0, "mallet_db": -3.0,
        "drums_db": -8.0, "brass_db": -5.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
        "chords": chords, "sections": [], "melody": melody, "mallet_melody": mallet, "brass_melody": brass, "pad": pad,
        "drums": drums, "drum_patterns": [], "stings": [], "ducks": [],
        "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6000, "q": 0.6, "db": -4.0}],
    },
}
json.dump(cues, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print(f"cues: {len(ev)} events, {len(amb)} beds, {len(melody)} piano, {len(mallet)} mallet, {len(brass)} brass, {len(drums)} drums, {len(voice)} voice lines")
