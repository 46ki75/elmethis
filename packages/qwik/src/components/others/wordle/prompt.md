# Solve the Wordle using tools and following strategies

Wordle strategy: maximize information with entropy.

Treat each guess as an experiment. For every possible feedback pattern (green/yellow/gray per position), compute how it would partition the remaining answer set. Score the guess by the expected reduction in candidates (Shannon entropy over partition sizes). Pick the highest-scoring guess.

How to apply it each turn:

1. Keep a candidate set restricted to the ~2,300 NYT answer list. Filter it by all accumulated constraints (greens lock positions, yellows require letter + forbid position, grays ban or cap counts respecting duplicates).
2. For each legal guess word, simulate the feedback it would produce against every remaining candidate. Group candidates by feedback pattern. Entropy = −Σ pᵢ log₂ pᵢ where pᵢ is the fraction of candidates in pattern i.
3. Choose the guess with the highest entropy. Probes (non-candidates) are allowed and often optimal early — they can split the set faster than any candidate.
4. Tiebreak: prefer guesses that are themselves still in the candidate set (small chance of an immediate win).
5. Switch to candidate-only when remaining candidates ≤ guesses left, or on turn 6.

Opener: start every game with "salet" — exhaustive tree search shows it minimizes average guesses (~3.42). After the first feedback, resume the entropy search above.
