"""ElevenLabs narration: fetch a line ONCE, keep the WAV + word timings next to the video, render offline forever after.

Usage (python3 -I tools/tts.py …):
  voices                                  list the voices this account can use (+ remaining credits)
  models                                  list the TTS models this account can use
  say "text" --voice NAME|ID --out x.wav  one line → x.wav (48 kHz mono) + x.words.json ([[word, t0, t1], …])
      [--model ID] [--speed 1.0] [--stability 0.5] [--similarity 0.75] [--style 0.0]
  video videos/NNN-slug                   every line in <video>/voice.json → <video>/voice/<id>.wav + .words.json
                                          (skips lines whose text/voice/settings hash is unchanged)
  selftest                                check the word-timing parser (no network)

voice.json: {"voice": "NAME|ID", "model": "...", "settings": {...}, "lines": [{"id": "l01", "text": "...", ...overrides}]}
Key: $ELEVENLABS_API_KEY or ~/.config/edstudio/elevenlabs.key (never commit it, never paste it in chat).
"""
import base64
import hashlib
import json
import os
import ssl
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io"
KEY_FILE = Path.home() / ".config/edstudio/elevenlabs.key"
DEFAULT_MODEL = "eleven_v4"  # Brian on v4 beat v2 and v4 Turbo
SR = 48000  # audio/synth.py's rate
# python.org Python builds ship without CA certificates (CERTIFICATE_VERIFY_FAILED); macOS keeps a bundle here
CTX = ssl.create_default_context(cafile="/etc/ssl/cert.pem") if os.path.exists("/etc/ssl/cert.pem") else None


def key():
    k = os.environ.get("ELEVENLABS_API_KEY") or (KEY_FILE.read_text().strip() if KEY_FILE.exists() else "")
    if not k:
        sys.exit(f"no ElevenLabs key: put it in {KEY_FILE} (chmod 600) or $ELEVENLABS_API_KEY")
    return k


def call(path, body=None):
    req = urllib.request.Request(API + path, data=None if body is None else json.dumps(body).encode(),
                                 headers={"xi-api-key": key(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code} on {path}: {e.read().decode(errors='replace')[:400]}")


def voices():
    return call("/v1/voices")["voices"]


def voice_id(name_or_id):
    for v in voices():
        if name_or_id in (v["voice_id"], v["name"]) or v["name"].split(" - ")[0].lower() == name_or_id.lower():
            return v["voice_id"]
    sys.exit(f"no voice named {name_or_id!r} (run: python3 -I tools/tts.py voices)")


def words_from_alignment(al):
    """Character timings → [[word, start, end], …], splitting on whitespace."""
    out, cur, t0, t1 = [], "", None, None
    for ch, a, b in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                out.append([cur, round(t0, 3), round(t1, 3)])
            cur, t0 = "", None
            continue
        if t0 is None:
            t0 = a
        cur, t1 = cur + ch, b
    if cur:
        out.append([cur, round(t0, 3), round(t1, 3)])
    return out


def say(text, voice, out, model=DEFAULT_MODEL, **settings):
    vs = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True, "speed": 1.0}
    vs.update({("similarity_boost" if k == "similarity" else k): v for k, v in settings.items() if v is not None})
    vid = voice if len(voice) == 20 and voice.isalnum() else voice_id(voice)
    # 192 kbps needs Creator or higher (Free/Starter get 128)
    r = call(f"/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_192",
             {"text": text, "model_id": model, "voice_settings": vs})
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".mp3") as mp3:
        mp3.write(base64.b64decode(r["audio_base64"]))
        mp3.flush()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3.name, "-ac", "1", "-ar", str(SR), str(out)], check=True)
    words = words_from_alignment(r.get("normalized_alignment") or r["alignment"])
    out.with_suffix(".words.json").write_text(json.dumps(
        {"text": text, "voice": vid, "model": model, "settings": vs, "words": words}, indent=1))
    return words


def video(vdir):
    vdir = Path(vdir)
    spec = json.loads((vdir / "voice.json").read_text())
    for ln in spec["lines"]:
        voice, model = ln.get("voice", spec["voice"]), ln.get("model", spec.get("model", DEFAULT_MODEL))
        st = {**spec.get("settings", {}), **ln.get("settings", {})}
        h = hashlib.sha1(json.dumps([ln["text"], voice, model, st], sort_keys=True).encode()).hexdigest()[:12]
        wav, meta = vdir / "voice" / f"{ln['id']}.wav", vdir / "voice" / f"{ln['id']}.words.json"
        if wav.exists() and meta.exists() and json.loads(meta.read_text()).get("hash") == h:
            print(f"  {ln['id']}: unchanged")
            continue
        words = say(ln["text"], voice, wav, model, **st)
        m = json.loads(meta.read_text())
        m["hash"] = h
        meta.write_text(json.dumps(m, indent=1))
        print(f"  {ln['id']}: {len(words)} words, {words[-1][2]:.2f} s")


def selftest():
    al = {"characters": list("Hi  you."), "character_start_times_seconds": [0, .1, .2, .25, .3, .4, .5, .6],
          "character_end_times_seconds": [.1, .2, .25, .3, .4, .5, .6, .7]}
    assert words_from_alignment(al) == [["Hi", 0, 0.2], ["you.", 0.3, 0.7]], words_from_alignment(al)
    print("selftest ok")


def main():
    a = sys.argv[1:]
    cmd = a[0] if a else ""
    opt = lambda n, d=None: a[a.index(n) + 1] if n in a else d
    num = lambda n: float(opt(n)) if opt(n) is not None else None
    if cmd == "voices":
        for v in sorted(voices(), key=lambda v: (v.get("category", ""), v["name"])):
            lb = v.get("labels") or {}
            print(f"{v['name'][:34]:34} {v['voice_id']}  {v.get('category', ''):10} "
                  + " · ".join(str(lb[k]) for k in ("gender", "age", "accent", "descriptive", "description", "use_case") if lb.get(k)))
        s = call("/v1/user/subscription")
        print(f"\ncredits used {s.get('character_count')} of {s.get('character_limit')} (plan: {s.get('tier')})")
    elif cmd == "models":
        for m in call("/v1/models"):
            if m.get("can_do_text_to_speech"):
                print(f"{m['model_id']:28} {m.get('name', '')}")
    elif cmd == "say":
        w = say(a[1], opt("--voice"), opt("--out"), opt("--model", DEFAULT_MODEL), speed=num("--speed"),
                stability=num("--stability"), similarity=num("--similarity"), style=num("--style"))
        print(f"{len(w)} words, {w[-1][2]:.2f} s → {opt('--out')}")
    elif cmd == "video":
        video(a[1])
    elif cmd == "selftest":
        selftest()
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
