// dh014 v2 re-cut (viral explainer formula, Nov 2 2026): one entry per picture, read by shots.js AND make_cues.py
// (everything after "RECUT = " is plain JSON). t0 = video time the picture starts; dz = zoom-dissolve into it.
// v1 shots carry src (+ rate): the v1 choreography resumes at v1 time src + rate * (t - t0), lined up on v2's words
// (the jam on "jams", the medal on "medals"...). Entries without src are v2 shots and run on video time.
export const RECUT = [
 {"t0": 0.0, "shot": "open", "set": "out"},
 {"t0": 1.15, "shot": "gun", "set": "out", "dz": true},
 {"t0": 2.85, "shot": "stakes", "set": "out", "dz": true},
 {"t0": 5.36, "shot": "farm", "set": "out", "dz": true, "src": 6.53},
 {"t0": 8.44, "shot": "minister", "set": "parl", "dz": true},
 {"t0": 11.08, "shot": "newsreel", "set": "out", "dz": true},
 {"t0": 12.91, "shot": "hook", "set": "out", "src": 4.7},
 {"t0": 14.4, "shot": "brief", "set": "tent", "dz": true, "src": 11.405, "rate": 1.5},
 {"t0": 16.68, "shot": "split", "set": "out", "dz": true, "src": 12.87},
 {"t0": 20.61, "shot": "dam", "set": "out", "dz": true, "src": 18.7},
 {"t0": 23.9, "shot": "jam", "set": "out", "src": 20.58},
 {"t0": 26.78, "shot": "bolt", "set": "out", "dz": true, "src": 23.65},
 {"t0": 28.64, "shot": "chase", "set": "out", "src": 25.6},
 {"t0": 30.62, "shot": "bumpy", "set": "out", "src": 26.66},
 {"t0": 32.25, "shot": "tanks", "set": "out", "dz": true, "src": 34.0},
 {"t0": 34.8, "shot": "retreat", "set": "out", "src": 29.0},
 {"t0": 35.78, "shot": "news", "set": "news", "dz": true, "src": 28.53},
 {"t0": 39.25, "shot": "medals", "set": "parl", "dz": true, "src": 35.24},
 {"t0": 43.85, "shot": "title", "set": "out", "dz": true, "src": 1.44},
 {"t0": 45.18, "shot": "lines", "set": "tent", "dz": true, "src": 38.61, "rate": 1.15},
 {"t0": 49.68, "shot": "lookout", "set": "out", "dz": true},
 {"t0": 53.41, "shot": "bowling", "set": "alley", "dz": true},
 {"t0": 55.4, "shot": "second", "set": "out", "dz": true, "src": 44.12},
 {"t0": 59.18, "shot": "arms", "set": "arms", "dz": true, "src": 51.94}
];
