#!/usr/bin/env python3
"""Frame check BEFORE rendering stills: where does each subject land in a vertical 9:16 frame?

A vertical frame is only ±14–17° wide (fov 48–60), so "aim between them" misses people all the time (015 lost the whole court
cast that way). Give a camera position, aim point and fov, plus named points (heads, tails, props), and it prints each point's
x% / y% in the frame (0 = left/top, 100 = right/bottom) and flags the ones that fall outside.

Usage: python3 -I tools/bearing.py checks.py      where checks.py contains lines like
  check("court", (-2.2, 2.45, 2.4), (-0.62, 1.3, -2.0), 56, {"gary": (-1.57, 1.6, 0.12), "judge": (0, 2.2, -3.65)})
Coordinates are the set's LOCAL coordinates (the same ones CAMS uses). Keep faces out of the HUD box (x < 45 %, y 24–33 %) and
readable props out of the subtitle band (y ≈ 67–73 %).
Or let it pick the aim (dh011): solve("name", P, fov, [((x, y, z), want_x%, want_y%), ...], {"other": (x, y, z)})."""
import math, sys

def check(name, P, A, fov, subs):
    hv = math.degrees(math.atan(math.tan(math.radians(fov / 2)) * 9 / 16))
    dx, dy, dz = A[0] - P[0], A[1] - P[1], A[2] - P[2]
    yaw = math.atan2(dx, -dz); pitch = math.atan2(dy, math.hypot(dx, dz))
    print(f"== {name}: half-width {hv:.1f}°, half-height {fov / 2:.1f}°")
    for s, (x, y, z) in subs.items():
        ex, ey, ez = x - P[0], y - P[1], z - P[2]
        b = (math.degrees(math.atan2(ex, -ez) - yaw) + 180) % 360 - 180
        e = math.degrees(math.atan2(ey, math.hypot(ex, ez)) - pitch)
        d = math.sqrt(ex * ex + ey * ey + ez * ez)
        fx = 50 + 50 * math.tan(math.radians(b)) / math.tan(math.radians(hv)); fy = 50 - 50 * math.tan(math.radians(e)) / math.tan(math.radians(fov / 2))
        flag = "" if abs(b) < hv * 0.92 and abs(e) < fov / 2 * 0.92 else "  <-- OUT"
        hud = "  <-- under the HUD" if not flag and fx < 45 and 24 <= fy <= 33 else ""
        print(f"  {s:14s} x%={fx:5.0f} y%={fy:5.0f} d={d:4.1f}{flag}{hud}")

def solve(name, P, fov, targets, show={}):
    """(dh011) Pick the aim for camera P: targets = [((x, y, z), want_x%, want_y%), ...]; prints an aim point A (10 m out, paste
    it into CAMS as the look-at) and where every target + `show` point lands. A big error = the subjects are too far apart for
    a vertical frame from this P: move P back or re-block, don't fight it."""
    hv = math.atan(math.tan(math.radians(fov / 2)) * 9 / 16)
    def proj(yaw, pitch, X):
        ex, ey, ez = X[0] - P[0], X[1] - P[1], X[2] - P[2]
        b = (math.atan2(ex, -ez) - yaw + math.pi) % (2 * math.pi) - math.pi; e = math.atan2(ey, math.hypot(ex, ez)) - pitch
        if abs(b) > 1.4 or abs(e) > 1.4: return 999, 999
        return 50 + 50 * math.tan(b) / math.tan(hv), 50 - 50 * math.tan(e) / math.tan(math.radians(fov / 2))
    best = min(((sum((proj(math.radians(iy), math.radians(ip / 2), X)[0] - tx) ** 2 + (proj(math.radians(iy), math.radians(ip / 2), X)[1] - ty) ** 2 for X, tx, ty in targets), iy, ip)
                for iy in range(-180, 181) for ip in range(-120, 121)))
    yaw, pitch = math.radians(best[1]), math.radians(best[2] / 2)
    A = (P[0] + 10 * math.sin(yaw) * math.cos(pitch), P[1] + 10 * math.sin(pitch), P[2] - 10 * math.cos(yaw) * math.cos(pitch))
    print(f"== {name}: A = ({A[0]:.2f}, {A[1]:.2f}, {A[2]:.2f})  err {best[0] ** 0.5:.1f}")
    for k, X in {**{f"t{i}": t[0] for i, t in enumerate(targets)}, **show}.items():
        x, y = proj(yaw, pitch, X); print(f"   {k:10s} x%={x:5.0f} y%={y:5.0f}")

if __name__ == "__main__":
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    exec(open(sys.argv[1]).read())
