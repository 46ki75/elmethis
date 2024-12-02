#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("notionrs error: {0}")]
    Notion(#[from] notionrs::error::Error),

    #[error("reqwest error: {0}")]
    Reqwest(#[from] reqwest::Error),

    #[error("scraper error: {0}")]
    Scraper(#[from] scraper::error::SelectorErrorKind<'static>),
}
