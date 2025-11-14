#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let secret = std::env::var("NOTION_TOKEN").expect("No Token Provided.");
    let page_id = std::env::var("NOTION_PAGE_ID").expect("No NOTION_PAGE_ID Provided.");

    let mut client = elmethis_notion::client::Client::new(secret);

    let block = client.convert_block(&page_id).await.unwrap();

    let json = serde_json::to_string(&block).unwrap();

    println!("{json}");
}
