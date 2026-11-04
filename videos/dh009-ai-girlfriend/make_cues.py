# Generates cues.json for video dh009: "What if your AI girlfriend was real?"
# Run: python3 -I videos/dh009-ai-girlfriend/make_cues.py videos/dh009-ai-girlfriend/cues.json
#
# Sound identity: "LOVERBOY LO-FI". A soft lo-fi R&B groove at 88 bpm (beat 0 = the pop out of the phone): a warm electric-piano
# arpeggio in 8ths over Fmaj7 – Em7 – Dm7 – Cmaj7 (one chord a bar), a lazy boom-bap kick + clap, a piano bass on 1 and the
# "and" of 3, a 4-note mallet "mwah" hook (A C A G) opening every place, one long F drone pad under everything (no gaps).
# The star is Penny's voice: our own formant talker (audio/synth.py `voice`, never an OS voice) with `whisper` — ASMR lines fully
# whispered and slow, "assistant" lines half-whispered and chirpy, the post-reset "Hi! I'm Penny" bright and fully voiced. Every
# line has a bubble or a card on screen. ASMR mic brushing = soft low-passed rustles; taps = hollow wood knocks; no clicks.
# Quiet open (room tone, a sigh, one phone buzz); the music enters on the pop with a braam + boom. Servers down (+1 year): the
# groove "freezes" into held chords over the pad (never silent), the BOOT jingle restarts it. Card: a warm slow arp + the hook.
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "shots.js")).read()
T = {k: float(v) for k, v in re.findall(r"\b([A-Z][A-Z0-9_]*): (-?\d+(?:\.\d+)?)", src[src.index("export const TIMES"):src.index("};", src.index("export const TIMES"))])}
D, END_IN = 69.6, 65.4
SCENES = [0, 4.6, 6.6, 11.8, 17.0, 22.0, 24.8, 27.4, 33.0, 35.3, 38.4, 40.6, 44.6, 49.8, 53.2, 54.7, 55.4, 60.4, D]
M = T["POP"]; BEAT = 60 / 88; BAR = 4 * BEAT
beat_t = lambda n: M + n * BEAT
on_beat = lambda t: beat_t(-(-((t - M) / BEAT) // 1))
CLONE_T = [T["CLONE0"] + 0.13 * i for i in range(11)]
FINGERS = [T["F6"], T["F7"], T["F8"], T["F9"], T["F10"], T["F11"]]
RESTART = on_beat(T["BOOT"] + 0.25)

# ---------------------------------------------------------------- music
LOOP = ["Fmaj7", "Em7", "Dm7", "Cmaj7"]
ROOT = {"Fmaj7": 41, "Em7": 40, "Dm7": 38, "Cmaj7": 36, "Bbmaj7": 34, "Am7": 45}
chords = [[0.2, "Fmaj7"]]
def run(t0, t1, prog, bar=BAR):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
run(M, T["OUT"], LOOP)
run(T["OUT"], RESTART, ["Dm7", "Bbmaj7"], 1.6)                   # servers down: the groove freezes into held chords
run(RESTART, END_IN - 0.3, LOOP)
run(END_IN - 0.3, D, ["Fmaj7", "Cmaj7"], 2.2)                     # the card

sections = [
    {"t0": M, "t1": T["OUT"], "style": "arp", "vel": [[M, 0.2], [17.0, 0.25], [38.4, 0.28], [T["OUT"], 0.28]], "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2]},
    {"t0": T["OUT"], "t1": RESTART, "style": "held", "vel": 0.3},
    {"t0": RESTART, "t1": END_IN - 0.3, "style": "arp", "vel": 0.27, "step": BEAT / 2, "pattern": [0, 2, 1, 3, 2, 1, 3, 2]},
    {"t0": END_IN - 0.3, "t1": D, "style": "arp", "vel": [[END_IN, 0.26], [D, 0.2]], "step": 0.5, "pattern": [0, 1, 2, 3, 2, 1]},
]
# piano bass: root on 1 (long), root on the "and" of 3, a fifth pickup on 4 — the R&B lean
melody = []
for i in range(1, len(chords)):
    c0, ch = chords[i]
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D
    if c0 < M - 0.01 or ch not in ROOT or (T["OUT"] <= c0 < RESTART) or c0 >= END_IN - 0.35: continue
    r = ROOT[ch] + 12
    melody += [[round(c0 + 0.01, 3), r, 0.3, False, BEAT * 1.4]]
    if c1 - c0 > 2.5 * BEAT: melody += [[round(c0 + 2.5 * BEAT, 3), r, 0.24, False, BEAT * 0.45], [round(c0 + 3.5 * BEAT, 3), r + 7, 0.2, False, BEAT * 0.35]]
# the "mwah" hook opens every place (A5 C6 A5 G5), + the boot jingle (C E G C) and the toaster's little heart motif
mallet = []
def hook(t, v=0.24, up=0):
    return [[round(t, 3), 81 + up, v, 0.18], [round(t + BEAT / 2, 3), 84 + up, v * 0.92, 0.18], [round(t + BEAT, 3), 81 + up, v * 0.88, 0.18], [round(t + 1.5 * BEAT, 3), 79 + up, v, 0.6]]
for t in [M + 0.35, 11.85, 17.05, 22.05, 27.45, 33.05, 38.45, 44.65, 60.45]: mallet += hook(t)
mallet += hook(END_IN + 0.2, 0.26)
mallet += [[T["BOOT"], 72, 0.24, 0.12], [T["BOOT"] + 0.1, 76, 0.24, 0.12], [T["BOOT"] + 0.2, 79, 0.24, 0.12], [T["BOOT"] + 0.3, 84, 0.26, 0.5]]
mallet += [[T["TOAST"] + 0.05, 84, 0.22, 0.14], [T["TOAST"] + 0.2, 88, 0.22, 0.14], [T["TOAST"] + 0.35, 91, 0.24, 0.5]]
mallet += [[T["V4"], 79, 0.2, 0.12], [T["V4"] + 0.12, 84, 0.22, 0.4]]                       # the update card

DRONE = [41, 48, 53]                                   # F2 C3 F3
pad = [{"t0": M - 0.4, "t1": D - 0.2, "notes": DRONE, "level": 0.85, "attack": 0.35, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 < M - 0.01: continue
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 1.2 if T["OUT"] <= c0 < RESTART else 1.5 if c0 >= END_IN - 0.4 else 0.55, "attack": 0.15, "release": 0.6})
BRAAM = [29, 36, 41, 48, 53]
for t in [M, T["OUT"]]:
    pad.append({"t0": t, "t1": t + 2.0, "notes": BRAAM, "level": 1.3, "attack": 0.1, "release": 0.9, "cutoff": 900, "hp": 30})

drums = [[M + 0.02, 0.55, "boom"]]
for k, v in [("FLIP", 0.35), ("TOPPLE", 0.35), ("ROLL", 0.3), ("WHOOMPH", 0.7), ("TRAY", 0.3), ("FLING", 0.55), ("TOSS", 0.35), ("OUT", 0.45), ("SPLAT", 0.4)]:
    drums.append([T[k] + (0.5 if k in ("FLIP", "ROLL") else 0.02), v, "boom"])
drums.append([END_IN + 0.02, 0.25, "boom"])
KICK = [1, 0, 0, 0, 0, 0, 0, 0.55, 0, 0, 1, 0, 0, 0, 0, 0]       # 16ths: 1, the "a" of 2, 3
CLAP = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]          # 2 + 4
drum_patterns = []
for t0, t1, v in [(beat_t(4), T["OUT"] - 0.05, 0.36), (RESTART + BAR, END_IN - 0.35, 0.36)]:
    drum_patterns += [{"t0": t0, "t1": t1, "step": BEAT / 4, "pattern": KICK, "vel": v, "kind": "kick"},
                      {"t0": t0, "t1": t1, "step": BEAT / 4, "pattern": CLAP, "vel": v * 0.75, "kind": "clap"}]
stings = []


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 11.82, -33, None, 1, fi=0.3), amb_("city_day", 0.0, 11.82, -54, {"murmur": 0.0, "traffic": 0.3}, 2, fi=0.3),   # 2 AM apartment
    amb_("room_tone", 11.8, 17.02, -35, None, 3),                                                                                          # kitchen
    amb_("city_day", 17.0, 22.02, -44, {"murmur": 0.55, "traffic": 0.0}, 4), amb_("room_tone", 17.0, 22.02, -40, None, 5),                # supermarket
    amb_("room_tone", 22.0, 27.42, -36, None, 6), amb_("traffic_flow", 22.0, 27.42, -56, None, 7),                                         # office
    amb_("city_day", 27.4, 33.02, -45, {"murmur": 0.25, "traffic": 0.15}, 8), amb_("dry_leaves", 27.4, 33.02, -54, None, 9),              # suburb yard
    amb_("city_day", 33.0, 38.42, -43, {"murmur": 0.8, "traffic": 0.0}, 10),                                                               # bistro
    amb_("crowd_cheer", 38.4, 44.62, -33, {"excite": 0.8}, 11), amb_("crowd_cheer", T["HUG"], 44.62, -30, {"excite": 1.2}, 12, fi=0.3),  # stadium
    amb_("room_tone", 44.6, 49.82, -35, None, 13),                                                                                          # morning, living room
    amb_("city_day", 49.8, T["OUT"] + 0.05, -40, {"murmur": 0.9, "traffic": 0.0}, 14), amb_("city_day", 49.8, 53.22, -44, {"murmur": 0.0, "traffic": 0.7}, 15),   # the street: the voices stop
    amb_("room_tone", 53.2, 55.42, -36, None, 16), amb_("city_day", 53.2, 55.42, -48, {"murmur": 0.5, "traffic": 0.0}, 17),               # press room
    amb_("room_tone", 55.4, D, -35, None, 18), amb_("lamp_hum", 60.4, 65.4, -55, None, 19),                                                # kitchen (the fridge hums)
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=None, hall=None):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan}
    if room is not None: e["room"] = room
    if hall is not None: e["hall"] = hall
    if args: e["args"] = args
    return e
def say(t, text, g, pitch=235, whisper=0.0, contour=None, speed=1.0, pan=0.0, room=-16, **kw):
    a = {"text": text, "pitch": pitch, "whisper": whisper, "speed": speed, **kw}
    if contour: a["contour"] = contour
    return ev_(t, "voice", g, pan, a, room=room)
def brush(t, g=-31, pan=0.0, dur=0.6):
    return ev_(t, "blanket_rustle", g, pan, {"dur": dur, "softness": 0.9, "intensity": 0.35})
ASK = [[0, 1.0], [0.6, 0.97], [1, 1.22]]                    # a question: rises at the end
SOFT = [[0, 1.05], [0.5, 1.0], [1, 0.9]]

ev = [
    say(T["SIGH"], "h aa:4", -30, 120, whisper=1.0, speed=0.8, pan=0.1),                                       # Greg sighs at his phone
    ev_(T["MSG"] - 0.05, "keyboard_type", -34, 0.1, {"dur": 0.55, "rate": 9.0}),                               # he types it
    ev_(T["UPD"], "phone_buzz", -27, 0.1, {"dur": 0.14}),
    ev_(T["GLOW"] - 0.2, "low_swell", -27, 0.1, {"dur": 0.55, "pitch": 1.1}),
    ev_(T["POP"], "poof", -18, 0.1, {"size": 1.1, "dur": 0.8}), ev_(T["POP"] + 0.05, "boing", -20, 0.15, {"dur": 0.6, "pitch": 1.1}),
    ev_(T["LAND"], "mattress_sit", -26, 0.2),
    say(T["WH1"], "h aa:2 iy:3 _:0.5 d ih d y uw d r ih ng k y ao r w aa t er t ah d eh iy", -16, 230, whisper=0.9, contour=ASK, speed=0.85, pan=0.2),
    brush(T["WH1"] - 0.15, -30, 0.2, 0.5), ev_(T["WH1"] + 1.8, "wood_knock", -33, 0.2, {"pitch": 1.35, "dur": 0.3}), ev_(T["WH1"] + 1.95, "wood_knock", -34, 0.2, {"pitch": 1.4, "dur": 0.3}),
    ev_(T["FLIP"], "boing", -22, -0.1, {"dur": 0.5, "pitch": 0.8}), ev_(T["FLIP"] + 0.5, "mattress_sit", -22, -0.1),
    ev_(T["FLIP"] + 0.52, "bonk", -27, -0.1, {"dur": 0.3}),
    # kitchen: "what's for dinner?" → "Great question!" → the list prints and prints, then buries him
    say(T["Q1"], "w ah t s f ao r d ih n er", -19, 128, contour=ASK, pan=0.2, room=-15),
    say(T["GQ"], "g r eh iy t _:0.2 k w eh s t sh ah n", -18, 250, whisper=0.35, contour=[[0, 1.1], [0.4, 1.15], [1, 0.95]], pan=-0.2),
    ev_(T["PRINT"], "keyboard_type", -30, 0.15, {"dur": T["BURY"] - T["PRINT"] + 0.3, "rate": 14.0}),
]
for k in range(8): ev.append(ev_(T["PRINT"] + 1.0 + k * 0.28, "blanket_rustle", -31, 0.2, {"dur": 0.3, "softness": 0.7, "intensity": 0.5}))
ev += [ev_(T["BURY"], "blanket_rustle", -22, 0.2, {"dur": 0.9, "softness": 0.5, "intensity": 1.0, "strokes": 3}),
       say(T["BURY"] + 0.15, "m f:2", -26, 130, pan=0.2)]
# supermarket: steps, "Can you carry one?" → "As an AI, I can't help with that." → the tower topples, he goes flat
ev += [{"sound": "footsteps", "t0": 17.0, "t1": 20.2, "pan0": 0.1, "pan1": 0.0, "gain_db": -30.0, "rate": 1.7},
       say(T["Q2"], "k ae n y uw k eh r iy w ah n", -19, 130, contour=ASK, pan=0.2, room=-14),
       say(T["NOPE"], "ae z ae n eh iy aa iy _:0.3 aa iy k ae n t h eh l p w ih dh dh ae t", -18, 240, whisper=0.3, contour=[[0, 1.02], [1, 0.96]], speed=1.05, pan=-0.2)]
for i in range(6): ev.append(ev_(T["TOPPLE"] + 0.45 + 0.07 * i, "bonk", -28 + (i % 2), 0.2 - 0.06 * i, {"dur": 0.2}))
ev += [ev_(T["TOPPLE"] + 0.35, "keyboard_type", -31, 0.1, {"dur": 0.8, "rate": 24.0}),                          # cereal pouring out
       ev_(T["FLAT"], "giant_step", -24, 0.1, {"size": 0.35}), say(T["FLAT"] + 0.05, "uw f", -26, 125, pan=0.1)]
# office: the whisper, the tingles, the interviewer's snore, his face on the desk, the chair rolling away
ev += [say(T["WH2"], "y uh r d uw ih ng _:0.2 s ow:3 w eh l:3", -16, 222, whisper=1.0, contour=SOFT, speed=0.8, pan=-0.2),
       brush(T["WH2"] - 0.1, -30, -0.2, 0.7), brush(T["WH2"] + 1.4, -32, -0.2, 0.5),
       ev_(T["SLEEP"] - 0.1, "snore", -27, 0.1, {"dur": 2.4, "size": 0.9}),
       ev_(T["DROP"] + 0.18, "bonk", -24, 0.1, {"dur": 0.35}),
       ev_(T["ROLL"], "keyboard_type", -33, 0.1, {"dur": 0.55, "rate": 7.0}), ev_(T["ROLL"] + 0.55, "giant_step", -25, 0.1, {"size": 0.4, "surface": "wood"})]
# the birthday: "Happy 300th birthday!" → 300 candles light in a sweep → WHOOMPH
ev += [say(T["WH3"], "h ae p iy th r iy h ah n d r ih d th b er th d eh iy", -16, 245, whisper=0.6, shout=0.2, contour=[[0, 1.0], [0.5, 1.12], [1, 1.0]], speed=0.95, pan=0.25),
       ev_(T["LIGHT"], "low_swell", -27, 0.0, {"dur": 0.9, "pitch": 1.2}),
       ev_(T["WHOOMPH"], "poof", -15, 0.0, {"size": 1.8, "dur": 1.1}), ev_(T["WHOOMPH"] + 0.02, "distant_boom", -22, 0.0, {"size": 0.6, "dur": 2.0}),
       ev_(T["WHOOMPH"] + 0.5, "crowd_noo", -30, 0.0, {"dur": 1.1, "voices": 4, "pitch": 1.1})]
# the date: fingers sprout (soft boops, climbing), the waiter drops the tray
for k, t in enumerate(FINGERS): ev.append(ev_(t, "plush_squeak", -27, 0.2, {"pitch": 0.7 + 0.09 * k, "dur": 0.16}))
ev += [ev_(T["TRAY"] - 0.15, "voice", -25, 0.35, {"text": "w aa:2", "pitch": 150, "shout": 0.3}),
       ev_(T["TRAY"] + 0.62, "car_crash", -26, 0.35, {"weight": 0.15}), ev_(T["TRAY"] + 0.64, "metal_clang", -31, 0.35, {"size": 0.3, "pitch": 2.0})]
# the stadium: the kiss cam "awww", the paywall, the T-pose fling, the crowd-surf; he pays from the crowd
ev += [ev_(T["HUG"] - 0.1, "crowd_noo", -29, 0.0, {"dur": 1.0, "voices": 9, "pitch": 1.25}),
       ev_(T["PAY"], "bonk", -24, 0.2, {"dur": 0.3}), ev_(T["PAY"] + 0.08, "keyboard_type", -30, 0.2, {"dur": 0.25, "rate": 30.0}),
       ev_(T["FLING"], "boing", -19, -0.2, {"dur": 0.8, "pitch": 0.9}), ev_(T["CATCH"], "mattress_sit", -27, -0.3),
       ev_(T["PAID"], "phone_buzz", -27, -0.2, {"dur": 0.12})]
# v4.0: eleven more Pennys pop up; they all whisper "good morning…" at once; a rain of water bottles
for i, t in enumerate(CLONE_T): ev.append(ev_(t, "plush_squeak", -28, ((i % 5) - 2) * 0.3, {"pitch": 0.65 + 0.03 * (i % 6), "dur": 0.14}))
MORN = "g uh d m ao r n ih ng:2 _:0.4 d ih d y uw d r ih ng k w aa t er"
for k in range(12):
    u = (k * 0.618) % 1.0
    ev.append(say(T["WH4"] + ((k * 37) % 7 - 3) * 0.015, MORN, -24, 215 + 40 * u, whisper=1.0, contour=ASK, speed=0.85, pan=((k % 7) - 3) * 0.2, room=-12))
for k in range(16): ev.append(ev_(T["TOSS"] + 0.5 + 0.05 * k + 0.02 * (k % 3), "bonk", -30 + (k % 2), ((k % 5) - 2) * 0.2, {"dur": 0.15}))
ev += [ev_(T["TOSS"] + 0.9, "crowd_noo", -28, 0.1, {"dur": 0.8, "voices": 1, "pitch": 0.7})]
# the outage: the partners' voices stop dead; the humans get yanked and go down (one thud, in sync) + a groan
ev += [ev_(T["OUT"], "keyboard_type", -32, 0.0, {"dur": 0.2, "rate": 30.0}),
       ev_(T["YANK"] + 0.32, "giant_step", -21, 0.0, {"size": 0.55}), ev_(T["YANK"] + 0.36, "giant_step", -25, -0.3, {"size": 0.4}),
       ev_(T["YANK"] + 0.1, "crowd_noo", -24, 0.0, {"dur": 1.4, "voices": 6, "pitch": 0.95})]
ev += [say(T["ISSUE"], "w iy aa r ah w eh r ah v ae n ih sh uw", -19, 205, contour=[[0, 1.0], [1, 0.9]], speed=1.0, room=-12),
       ev_(T["PFREEZE"] + 0.2, "crowd_noo", -30, 0.0, {"dur": 0.9, "voices": 6, "pitch": 1.2})]
for k in range(6): ev.append(ev_(53.4 + 0.31 * k, "lamp_switch_click", -36, ((k % 3) - 1) * 0.4))          # camera flashes, soft
# the reboot: "Hi! I'm Penny. How can I help you today?" (bright, fully voiced) → the cake hits the floor
ev += [say(T["WH5"], "h aa iy _:0.3 aa iy m p eh n iy _:0.4 h aa uw k ae n aa iy h eh l p y uw t ah d eh iy", -18, 265, whisper=0.0, contour=[[0, 1.12], [0.25, 1.0], [0.45, 1.08], [1, 1.15]], speed=1.05, pan=-0.25),
       ev_(T["SPLAT"], "poof", -22, 0.25, {"size": 0.6, "dur": 0.5}), ev_(T["SPLAT"] + 0.02, "bonk", -26, 0.25, {"dur": 0.3}),
       say(T["SPLAT"] + 0.5, "n ow", -27, 120, contour=[[0, 1.0], [1, 0.8]], pan=0.25)]
# the summary + the fridge walking out with her (a hop per step, mirrored from shots.js) + the toaster
ev += [say(T["SUM"], "h iy r z ah s ah m er iy", -18, 240, whisper=0.5, contour=[[0, 1.05], [1, 0.95]], pan=-0.15)]
for k in range(1, 5): ev.append(ev_(T["FWALK"] + 0.18 * k, "giant_step", -29, -0.3, {"size": 0.3, "surface": "wood"}))
t = T["GRAB"] + 0.52
while t < END_IN - 0.2:
    ev.append(ev_(t, "giant_step", -29, -0.4, {"size": 0.3, "surface": "wood"})); t += 0.52
ev += [ev_(T["TOAST"], "bonk", -25, -0.2, {"dur": 0.25}), ev_(T["TOAST"] + 0.02, "metal_clang", -32, -0.2, {"size": 0.2, "pitch": 2.4})]

cues = {
    "title": "dh009 - What if your AI girlfriend was real? (loverboy lo-fi; whisper-ASMR voice lines)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.8, D],
    "stem_gain_db": {"music": -8.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES,
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "echo": {"delay": BEAT * 0.75, "feedback": 0.25, "mix": 0.2, "lp_hz": 2600},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 1.5, "pad_reverb_db": -5.0,
              "mallet_db": -2.0, "drums_db": -7.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": stings,
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, ambience {len(amb)}, TIMES {len(T)}")
