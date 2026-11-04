"""dh014 story.json from timeline.json (make_voice.py) + recut.js: HUD segments (ROUNDS FIRED, sourced numbers only).
v2 (viral re-cut, Nov 2 2026): no title card, no end card (the explainer stops on "Undefeated."), the HUD fades in after
the hook. Run: python3 -I videos/dh014-emu-war/make_story.py"""
import json
from pathlib import Path

V = Path(__file__).resolve().parent
TL = json.loads((V / "timeline.json").read_text())
L = TL["lines"]
CUT = {e["shot"]: e["t0"] for e in json.loads((V / "recut.js").read_text().split("export const RECUT = ", 1)[1].rstrip().rstrip(";"))}
END = round(L["n22_undefeated"][1] + 0.85, 2)   # hold the payoff a beat, then stop (no outro)

def word(lid, i):
    a, b = L[lid]
    return [w[0] for w in TL["words"] if a - 0.01 <= w[0] < b + 0.01][i]

ROLL = (word("n06_split", 13), word("n12_retreat", 6))   # first week: 0 -> 2,500 rounds, from "splits" to "bullets"
def roll(t):
    u = min(1, max(0, (t - ROLL[0]) / (ROLL[1] - ROLL[0])))
    return round(2500 * u)

segs = [  # (t0, t1, time, age)
    (CUT["farm"], CUT["brief"], "OCTOBER 1932", "20,000 EMUS · CAMPION, W. AUSTRALIA"),
    (CUT["brief"], CUT["split"], "NOVEMBER 1932", "2 LEWIS GUNS · 10,000 ROUNDS"),
    (CUT["split"], CUT["dam"], "NOV 2, 1932", "DAY ONE"),
    (CUT["dam"], CUT["bolt"], "NOV 4, 1932", "THE DAM · 1,000+ EMUS"),
    (CUT["bolt"], CUT["tanks"], "NOVEMBER 1932", "ONE LEWIS GUN, ONE TRUCK"),
    (CUT["tanks"], CUT["news"], "NOV 8, 1932", "ARMY WITHDRAWN"),
]
hud = []
for t0, t1, time, age in segs:
    a, b = max(t0, ROLL[0]), min(t1, ROLL[1])
    seg = {"t0": t0, "t1": t1, "from": roll(t0), "to": roll(t1), "time": time, "age": age}
    if b > a:
        seg.update({"r0": a, "r1": b, "linear": True})
    hud.append(seg)
hud += [
    {"t0": CUT["news"], "t1": CUT["medals"], "from": 2500, "to": 2500, "time": "NOVEMBER 1932", "age": "THE PRESS NAMES IT “THE EMU WAR”"},
    {"t0": CUT["medals"], "t1": CUT["title"], "from": 2500, "to": 2500, "time": "NOVEMBER 1932", "age": "HOUSE OF REPRESENTATIVES"},
    {"t0": CUT["title"], "t1": CUT["lookout"], "from": 2500, "to": 2500, "time": "NOVEMBER 1932", "age": "MEREDITH: “THE INVULNERABILITY OF TANKS”"},
    {"t0": CUT["lookout"], "t1": CUT["second"], "from": 2500, "to": 2500, "time": "NOVEMBER 1932", "age": "“EACH PACK SEEMS TO HAVE ITS OWN LEADER”"},
    {"t0": CUT["second"], "t1": CUT["arms"], "from": 2500, "to": 9860, "r0": word("n20_second", 2), "r1": word("n20_second", 6),
     "time": "DEC 10, 1932", "age": "MEREDITH'S CLAIM: 10 ROUNDS PER BIRD"},
    {"t0": CUT["arms"], "t1": END + 1, "from": 9860, "to": 9860, "time": "TODAY", "age": "ON THE COAT OF ARMS SINCE 1908",
     "ageGoldAt": round(word("n22_undefeated", 0), 2)},
]
story = {
    "tone": "explainer",
    "look": {"exposure": 1.0, "fill": 0},
    "fps": 30,
    "duration": END,
    "hudIn": CUT["farm"],
    "hudLabel": "ROUNDS FIRED",
    "hud": hud,
    "subs": [],
    "debugView": {"center": [0, 0, 0], "height": 30},
}
(V / "story.json").write_text(json.dumps(story, indent=1, ensure_ascii=False))
print(f"duration {END}; HUD in at {CUT['farm']}; roll {ROLL}")
