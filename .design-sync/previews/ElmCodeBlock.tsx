import * as React from "react";
import { ElmCodeBlock, ElmInlineText } from "@elmethis/react";

// The story imports the rust source via Vite's `?raw` query
// (`./seed/main.rs?raw`), which esbuild can't resolve. Inline the same seed so
// the preview matches the storybook render. "rust" is in the slim shiki bundle.
const rustCode = `use reqwest::Error;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct Post {
    #[serde(rename = "userId")]
    user_id: u32,
    id: u32,
    title: String,
    body: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let url = "https://jsonplaceholder.typicode.com/posts";
    let response = reqwest::get(url).await?;
    let posts: Vec<Post> = response.json().await?;

    for post in posts.iter().take(5) {
        println!("ID: {}, Title: {}", post.id, post.title);
    }

    Ok(())
}
`;

export const Primary = () => (
  <ElmCodeBlock code="const foo = 'bar'" language="javascript" />
);

export const Rust = () => (
  <ElmCodeBlock
    code={rustCode}
    language="rust"
    caption="/workspaces/elmethis/packages/storybook"
  />
);

export const Caption = () => (
  <ElmCodeBlock code={rustCode} language="rust" caption="src/main.rs" />
);

export const CaptionSlot = () => (
  <ElmCodeBlock code={rustCode} language="rust">
    <ElmInlineText>File:</ElmInlineText>
    <ElmInlineText code>src/main.rs</ElmInlineText>
  </ElmCodeBlock>
);
