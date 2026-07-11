# Generative UI Specs

Source: `submodules/ag-ui/docs/concepts/generative-ui-specs.mdx`

AG-UI's relationship to the generative-UI specifications. Open this file when
someone asks how AG-UI compares to A2UI, Open-JSON-UI, or MCP-UI, or whether
AG-UI is itself a generative-UI spec (it is not).

## AG-UI is not a generative-UI spec

AG-UI is a **User Interaction protocol** that provides the **bidirectional
runtime connection** between the agent and the application. It does **not**
define how UI components are structured or serialized.

The distinction:

- Generative-UI specs define *how* UI components are structured and transmitted.
- AG-UI defines the *two-way communication mechanism* that makes agent ↔ user
  interaction possible — the runtime that carries those components.

AG-UI **natively supports all three** major generative-UI specs below, and also
lets developers implement their own custom generative-UI standards.

## The three major specs

| Spec | Author(s) | Description |
| ---- | --------- | ----------- |
| **A2UI** | Google | A declarative, LLM-friendly generative-UI spec. JSONL-based and streaming, designed for platform-agnostic rendering. Lets agents deliver dynamic interface components alongside text responses. |
| **Open-JSON-UI** | OpenAI | An open standardization of OpenAI's internal declarative generative-UI schema, bringing their proprietary approach to a publicly available format. |
| **MCP-UI** | Microsoft + Shopify | A fully open, iframe-based generative-UI standard that extends MCP for user-facing experiences. |

## Key points

- **A2UI = Google**, **Open-JSON-UI = OpenAI**, **MCP-UI = Microsoft + Shopify**.
  Keep these attributions precise.
- AG-UI is complementary to all three, not a competitor or alternative.
- Because AG-UI is transport- and payload-agnostic at the application layer, a
  generative-UI payload (A2UI, Open-JSON-UI, MCP-UI, or custom) rides over AG-UI
  events without AG-UI needing to understand the payload format.

## See also

- `../integrations.md` — protocol landscape, sister specs, generative-UI table
- `architecture.md` — why AG-UI is transport- and payload-agnostic
