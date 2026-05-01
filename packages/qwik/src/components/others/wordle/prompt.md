# Solve the wordle with tools and following strats

Wordle strategies (research-backed):

Information theory (3Blue1Brown, NHSJS 2024)

- Treat each guess as an experiment that maximizes Shannon entropy over the remaining answer set.
- Score a candidate by: for every possible feedback pattern it could produce, compute the resulting partition size, then take the expected log₂ reduction. Pick the highest.
- Information first; "winning" first only when remaining candidates ≤ guesses left.

Best openers (empirically derived)

- Single best opener for fewest average guesses: "salet" (~3.42 avg) — Jonathan Olson's exhaustive tree search. Close runners-up: "reast", "crate", "trace", "slate".
- "Crane" was 3Blue1Brown's first answer; later corrected — "salet" / "crate" outperform it.
- For highest 4-guess solve rate: "rance" (~99.2%).
- Vowel-heavy alternatives like "adieu", "audio" are popular but statistically weaker.

Two-/three-seed openings (SFI data analytics)

- Two-seed: "cones" → "trial" (~96% solve, ~3.68 avg).
- Three-seed: "hates" → "round" → "climb" (~97% solve, ~4.2 avg).
- Use multi-seed only when you value solve-rate over speed.

Greedy heuristics (Tom Johnston)

- Pure "max greens" or "max yellows" greedy fails on ~26 words within 6 guesses. Don't optimize on a single signal — use mutual information / entropy.
- Strong greedy openers by mutual information: "soare", "saine", "slane", "saice".

Hard mode / endgame

- When a stem like \_IGHT, \_OUND, \_ATCH remains with many candidates, spend a non-candidate probe that splits them (e.g. "blimp", "chunk") rather than guessing them one by one.
- On turn 5–6, switch to candidate-only guesses ranked by frequency in the answer list.

Duplicates

- Gray on a letter that also appears green/yellow elsewhere caps the count, doesn't ban it. Most solver bugs come from mishandling this.

Answer pool
–6, switch to candidate-only guesses ranked by frequency in the answer list.

Duplicates

- Gray on a letter that also appears green/yellow elsewhere caps the count, doesn't ban it. Most solver bugs come from mishandling this.

Answer pool

- Restrict candidate filtering to the curated ~2,300 NYT answer list, not the full ~13,000 valid-guess list. Probes can come from the full guess list.
