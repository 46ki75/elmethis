# Production RAG in six stages

Naive RAG is easy to describe: embed the user's question, fetch the top-k most similar chunks, paste them into a prompt. It works in demos. Then it meets a real corpus and real users — vague questions, abbreviations, jargon, proper nouns — and the cracks show. The chunk you needed ranks sixth. The chunk that ranked first is about the wrong thing entirely.

The established fix is not one clever trick but a *workflow* of small stages, where each stage has one job and exists to compensate for a specific, well-understood failure mode. None of it is tied to a framework — these are retrieval techniques, and several of them are older than LLMs. This post walks that workflow stage by stage:

![The six-stage RAG workflow](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-80bf-b764-e106a59f01b1)

This is the *query-time* side of RAG only. How documents get chunked, embedded, and kept in sync is its own discipline, and it deserves its own post — here, assume an indexed corpus already exists. The code and logs quoted below come from a small Python implementation I wrote to exercise each stage, but everything they illustrate is general behavior — the techniques port to any framework, or to no framework at all.

## Stage 1 — Query transformation

Users write queries for humans, not for retrievers. They use pronouns, abbreviations, and whatever phrasing first came to mind — none of which has to match the vocabulary of the documents. So before anything touches the index, an LLM rewrites the query into recall-oriented search terms: abbreviations expanded, likely synonyms added.

![Stage 1 — query transformation with a fallback path](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-8054-9e80-fb56b631b202)

The fallback arrow in the diagram is not decoration, and the principle behind it is general: **any LLM step on the query path can return empty or garbage output, so every one of them needs a safe degradation.** A concrete way this bites today: reasoning models can burn their entire output-token budget on thinking and return no visible text at all. When that happens, this stage degrades to searching with the original query — not with an empty string.

One more note, and it is a workflow-wide principle rather than a stage 1 detail: the *rewritten* query is used for retrieval only. Stages 4 and 6 deliberately go back to the original. Recall stages get the recall query; precision stages get the user's actual words.

Rewriting is not the only way to attack this failure mode. A notable alternative, **RAG-Fusion**, multiplies the query instead of rewriting it — and since it reshapes the stages that follow, I cover it in a bonus section at the end of the article.

## Stage 2 — Hybrid retrieval: lexical + semantic

Why run two retrievers when one is supposedly state of the art? Because their failure modes are complementary.

Lexical search (BM25, decades old and still unbeaten at what it does) matches exact terms. It is the tool for IDs, error codes, jargon, and rare tokens — and completely blind to meaning. Ask it about "electricity" and it will not find a chunk that only says "power". Semantic search over dense vectors is the mirror image: it matches paraphrases and concepts happily, and then misses an exact part number because the embedding smeared it into a vague neighborhood of similar-looking strings.

So the workflow runs both, over the same chunk store, with the same top-k, against the same rewritten query, and ends up holding two ranked lists.

One operational consequence worth knowing before it bites you: lexical search operates on chunk *text*, which means the document store — not just the embeddings — has to be available at query time. A storage layer that keeps only vectors silently rules hybrid retrieval out.

![Stage 2 — hybrid lexical and semantic retrieval](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-8004-91b5-ce0f205c2a42)

## Stage 3 — Merge with Reciprocal Rank Fusion

Now there are two ranked lists, and a problem: BM25 scores and cosine similarities live on completely different scales. You cannot average them, compare them, or normalize them without making assumptions that break on the next corpus.

Reciprocal rank fusion (Cormack, Clarke & Büttcher, 2009) solves this by ignoring scores entirely. Each chunk earns `1 / (k + rank)` for every list it appears in, so a chunk found by *both* retrievers accumulates from both and floats to the top.

![Stage 3 — merge with Reciprocal Rank Fusion](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-80e5-a4a8-f1378671516c)

The whole technique is a few lines of plain arithmetic — no model, no API call, no framework:

```python
def reciprocal_rank_fusion(result_lists, k=60):
    scores = defaultdict(float)
    for results in result_lists:
        for rank, chunk_id in enumerate(results):
            scores[chunk_id] += 1.0 / (k + rank + 1)
    return sorted(scores, key=lambda c: scores[c], reverse=True)
```

It is the cheapest stage in the workflow, and its key property is easy to state as a test: a chunk ranked low in both lists but present in *both* beats each list's solo number one. The constant `k=60` is the standard choice from the original paper; its job is to dampen how much rank 1 dominates rank 2, so a single retriever's top pick cannot steamroll the consensus.

## Stage 4 — Rerank with a cross-encoder

Everything so far optimized recall: cast a wide net, merge generously. Stage 4 is where precision takes over.

The framing that makes rerankers click is bi-encoder versus cross-encoder. Retrieval embeds the query and every document *independently* — that is what makes it fast enough to scan a whole corpus, and also what makes it approximate, because the model never sees query and document together. A cross-encoder reranker does the opposite: it scores each (query, document) *pair jointly*. Far more accurate, far too slow for a corpus — but the fused candidate list is short, so jointly scoring all of it is cheap.

![Bi-encoder retrieval vs cross-encoder reranking](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-8054-b6a2-cb73f71ef405)

You could prompt a chat model to sort the candidates — every framework offers an LLM-as-reranker mode — but a purpose-built rerank model is faster, cheaper (on the order of a quarter of a cent per search), and immune to a whole class of failures where the chat model formats its answer in a way your parser did not expect. Rerank APIs are a plain HTTP call; if your stack lacks a connector for your provider, writing one is about thirty lines, not a project.

And here is the detail promised back in stage 1: the reranker scores candidates against the **original** query, not the recall-oriented rewrite. The rewrite padded the query with synonyms to widen the net; feeding that same padding to a precision stage would reward chunks for matching noise the user never typed. Recall stages get the recall query; precision stages get the user's actual words.

## Stage 5 — Expand with neighboring chunks

Chunking leaves the query side with a tension to resolve: small chunks are precise to *retrieve* but thin to *read*. A chunk that wins the rerank might say "the wind array carries most of the winter load" — and the sentence explaining what happens when the wind stops sits in the next chunk over.

The resolution is to retrieve small and then re-attach context, a technique family that goes by several names — neighbor or window expansion, "small-to-big", parent-document retrieval. After the rerank picks its survivors, each one's adjacent chunks (or its parent section) are pulled back in from the document store.

![Neighbour expansion around a reranked chunk](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-8067-be59-dbdf79451aa8)

This costs no API calls — it only requires that chunk adjacency was recorded when the corpus was indexed, so expansion can simply follow it. It is a small example of a larger truth: decisions made at indexing time quietly set the ceiling on what the query-time workflow can do.

## Stage 6 — Synthesize

The final stage is boring, and that is the design. All the intelligence in this workflow lives upstream; by the time the LLM is asked to write an answer, it holds a small, high-quality, context-complete set of chunks and just has to read them.

![Synthesis from the final chunk set](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-8080-b3be-de73a04d1047)

As with the reranker, synthesis runs against the *original* question — the user deserves an answer to what they asked.

One configuration gotcha cost me real debugging time, so it goes in the post, phrased generally because it is not specific to any provider: the prompt budget for synthesis is `context window − max output tokens`. If your client library defaults the context window to a small value and you raise the output budget — say, to give a reasoning model room to think — that subtraction can go *negative*, with error messages that point nowhere near the actual cause. Check both numbers against the model you actually run.

## Observability as a design choice

Make every stage funnel through one tiny helper that logs one line per chunk — the stage name, then a score and a snippet for everything that survived:

```
2b. vector (semantic) -> 5 chunk(s)
  score=0.4177 | The 300 kW wind array carries most of the winter load, because the solar...
  score=0.4040 | Unlike Kestrel Station it has no wind turbines: the camp runs on portabl...
  ...
```

It looks like a debugging afterthought; it is the most load-bearing design decision in the whole program. A RAG workflow is a funnel, and almost every question you will ever ask about its behavior — why did the answer miss the battery bank? why is this irrelevant chunk in the context? — is really a question about *which stage* let the wrong thing through or dropped the right thing. With per-stage logs, you watch a chunk enter at 2a, survive the RRF merge, win the rerank, and pick up its neighbors at stage 5. Without them, you are staring at a final answer trying to guess which of six stages to blame.

There is no traditional debugger for retrieval quality. Stage-by-stage logging is the debugger — and per-stage diffs are how you tune top-k, chunk size, and rerank cutoffs with evidence instead of vibes.

## Conclusion

The workflow looks elaborate laid out end to end, but no stage is there for sophistication's sake. Each one pays rent by covering a specific failure mode:

| Stage | Compensates for |
| --- | --- |
| Query transformation | queries written for humans, not retrievers |
| Hybrid retrieval | each retriever's blind spots |
| RRF | incomparable score scales |
| Rerank | bi-encoder approximation |
| Expansion | retrieve-small vs read-large tension |
| (RAG-Fusion) | a single query = a single perspective |

That framing is also the adoption strategy. Every stage is independently removable, so you do not have to build all of this on day one. Start naive. Log every stage from the start — that part is free. Then add stages when the corresponding failure mode shows up in *your* logs, not because a blog post (this one included) told you to.

## Bonus — RAG-Fusion: don't rewrite the query, multiply it

As promised back in stage 1: RAG-Fusion (Rackauckas, 2024) starts from the same diagnosis — the raw query is a weak retrieval key — but makes a different bet. One query, however well rewritten, still encodes a single perspective. So instead of rewriting, have the LLM generate several alternative phrasings: one more specific, one more general, one with synonyms, one a related sub-question.

![RAG-Fusion: one query becomes many](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-8031-8569-d809aeaa35f2)

Here is what that looks like for a deliberately vague input, from a real run against my test corpus — deliberately *fictional* documents about a made-up Antarctic outpost, so a correct answer can only ever come from retrieval, never from the model's training data:

```
original query: Tell me about the outpost's energy situation.
generated     : Describe the outpost's power and energy supply status
generated     : Assess the outpost's energy resources, consumption, and backup systems
generated     : What is the outpost energy situation and infrastructure status?
generated     : How reliable is the outpost's electricity generation and fuel availability?
```

This reshapes part of the workflow you just read, so let me be explicit about the deltas:

- **Stage 2 becomes fan-out retrieval.** Instead of one search per *retriever*, you run one search per *query* — N+1 ranked lists, since the original is always kept.
- **Stage 3 is unchanged as an algorithm but reinterpreted.** Reciprocal rank fusion does not care where its lists came from. In the hybrid workflow it rewards chunks found by both retrievers; here it rewards chunks surfaced by several phrasings of the question. Same arithmetic, different meaning. That indifference is the elegant part.
- **Stages 4–6 are unchanged.** Reranking and synthesis still use the original question. The generated queries were only ever a retrieval device.

![The workflow with RAG-Fusion applied](https://www.ikuma.cloud/api/v2/blog/block-image/37834608-d5c9-806d-8090-d6f1a402b89f)

The two techniques also compose: each generated query can fan out over both retrievers, and RRF merges all (queries × retrievers) lists at once. And the same safety principle applies as in stage 1 — if query generation comes back empty, the workflow degrades to plain single-query RAG rather than breaking.
