// shikiInstance.ts
import { createHighlighter, Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

export function getHighlighterSingleton() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: [
        'abap',
        'bash',
        'c',
        'clojure',
        'coffeescript',
        'c++',
        'c#',
        'css',
        'dart',
        'diff',
        'docker',
        'elixir',
        'elm',
        'erlang',
        'f#',
        'gherkin',
        'glsl',
        'go',
        'graphql',
        'groovy',
        'haskell',
        'html',
        'java',
        'javascript',
        'json',
        'julia',
        'kotlin',
        'latex',
        'less',
        'lisp',
        'lua',
        'makefile',
        'markdown',
        'matlab',
        'mermaid',
        'nix',
        'objective-c',
        'ocaml',
        'pascal',
        'perl',
        'php',
        'plaintext',
        'powershell',
        'prolog',
        'protobuf',
        'python',
        'r',
        'ruby',
        'rust',
        'sass',
        'scala',
        'scheme',
        'scss',
        'shell',
        'sql',
        'swift',
        'typescript',
        'wasm',
        'xml',
        'yaml'
      ],
      themes: ['vitesse-light', 'vitesse-dark']
    })
  }
  return highlighterPromise
}
