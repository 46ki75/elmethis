#[derive(Debug)]
pub struct Client {
    pub notionrs_client: notionrs::client::Client,
}

#[derive(Debug)]
pub struct Image {
    pub src: String,
    pub id: String,
}

impl Client {
    pub fn new<T>(secret: T) -> Self
    where
        T: AsRef<str>,
    {
        Client {
            notionrs_client: notionrs::client::Client::new().secret(secret),
        }
    }

    #[async_recursion::async_recursion]
    pub async fn convert_block(
        &mut self,
        page_id: &str,
    ) -> Result<Vec<crate::block::Block>, crate::error::Error> {
        let mut blocks: Vec<crate::block::Block> = Vec::new();

        let results = self
            .notionrs_client
            .get_block_children_all()
            .block_id(page_id)
            .send()
            .await?;

        for block in results {
            match block.block {
                notionrs::object::block::Block::Audio { audio: _ } => {}
                notionrs::object::block::Block::Bookmark { bookmark } => {
                    let mut props = crate::block::ElmBookmarkProps {
                        url: bookmark.url.clone(),
                        margin: "2rem".to_string(),
                        ..Default::default()
                    };

                    let response = reqwest::Client::new()
                        .get(&bookmark.url)
                        .header("user-agent", "Rust - reqwest")
                        .send()
                        .await?
                        .text()
                        .await?;

                    let document = scraper::Html::parse_document(&response);

                    // title

                    let title = document
                        .select(&scraper::Selector::parse("title")?)
                        .next()
                        .map(|element| element.text().collect::<String>());

                    let og_title_selector = scraper::Selector::parse("meta[property='og:title']")?;

                    if let Some(element) = document.select(&og_title_selector).next() {
                        if let Some(content) = element.value().attr("content") {
                            props.title = Some(content.to_string());
                        }
                    }

                    if let Some(title) = title {
                        props.title = Some(title);
                    }

                    // description

                    let description = document
                        .select(&scraper::Selector::parse("meta[name='description']")?)
                        .next()
                        .map(|element| element.value().attr("content").unwrap().to_string());

                    if let Some(description) = description {
                        props.description = Some(description);
                    }

                    let og_description_selector =
                        scraper::Selector::parse("meta[property='og:description']")?;

                    if let Some(element) = document.select(&og_description_selector).next() {
                        if let Some(content) = element.value().attr("content") {
                            props.description = Some(content.to_string());
                        }
                    }

                    let og_image_selector = scraper::Selector::parse("meta[property='og:image']")?;

                    if let Some(element) = document.select(&og_image_selector).next() {
                        if let Some(content) = element.value().attr("content") {
                            props.image = Some(content.to_string());
                        }
                    }

                    let block = crate::block::Block::ElmBookmark(crate::block::ElmBookmark {
                        props,
                        id: block.id,
                    });

                    blocks.push(block);
                }
                notionrs::object::block::Block::Breadcrumb { breadcrumb: _ } => {}
                notionrs::object::block::Block::BulletedListItem { bulleted_list_item } => {
                    let mut list_item_children: Vec<crate::block::Block> = Vec::new();

                    let rich_text_block =
                        Client::convert_rich_text(bulleted_list_item.rich_text).await?;
                    list_item_children.extend(rich_text_block);

                    if block.has_children {
                        let list_item_children_blocks = self.convert_block(&block.id).await?;
                        list_item_children.extend(list_item_children_blocks);
                    }

                    let list_item_block =
                        crate::block::Block::ElmListItem(crate::block::ElmListItem {
                            children: list_item_children,
                            id: block.id.clone(),
                        });

                    let last_item = blocks.last_mut();

                    match last_item {
                        Some(crate::block::Block::ElmBulletedList(elm_bulleted_list)) => {
                            elm_bulleted_list.children.push(list_item_block);
                        }
                        Some(_) | None => {
                            let new_ul = vec![list_item_block];
                            blocks.push(crate::block::Block::ElmBulletedList(
                                crate::block::ElmBulletedList {
                                    children: new_ul,
                                    id: block.id,
                                },
                            ));
                        }
                    };
                }
                notionrs::object::block::Block::Callout { callout } => {
                    let mut children: Vec<crate::block::Block> = Vec::new();
                    let text_blocks = Client::convert_rich_text(callout.rich_text).await?;
                    let children_blocks = self.convert_block(&block.id).await?;
                    children.extend(text_blocks);
                    children.extend(children_blocks);

                    let r#type = match callout.color {
                        notionrs::object::color::Color::Default
                        | notionrs::object::color::Color::DefaultBackground
                        | notionrs::object::color::Color::Blue
                        | notionrs::object::color::Color::BlueBackground
                        | notionrs::object::color::Color::Gray
                        | notionrs::object::color::Color::GrayBackground => "note",
                        notionrs::object::color::Color::Green
                        | notionrs::object::color::Color::GreenBackground => "tip",
                        notionrs::object::color::Color::Purple
                        | notionrs::object::color::Color::PurpleBackground => "important",
                        notionrs::object::color::Color::Yellow
                        | notionrs::object::color::Color::YellowBackground
                        | notionrs::object::color::Color::Orange
                        | notionrs::object::color::Color::OrangeBackground
                        | notionrs::object::color::Color::Brown
                        | notionrs::object::color::Color::BrownBackground => "warning",
                        notionrs::object::color::Color::Red
                        | notionrs::object::color::Color::RedBackground
                        | notionrs::object::color::Color::Pink
                        | notionrs::object::color::Color::PinkBackground => "caution",
                    }
                    .to_string();

                    let props = crate::block::ElmCalloutProps { r#type };

                    let callout_block = crate::block::Block::ElmCallout(crate::block::ElmCallout {
                        props,
                        children,
                        id: block.id,
                    });
                    blocks.push(callout_block);
                }
                notionrs::object::block::Block::ChildDatabase { child_database: _ } => {}
                notionrs::object::block::Block::ChildPage { child_page: _ } => {}
                notionrs::object::block::Block::Code { code } => {
                    let language = code.language.to_string();

                    let caption = code
                        .caption
                        .iter()
                        .map(|text_item| text_item.to_string())
                        .collect::<String>();

                    let props = crate::block::ElmCodeBlockProps {
                        code: code
                            .rich_text
                            .iter()
                            .map(|text_item| text_item.to_string())
                            .collect::<String>(),
                        language: language.to_string(),
                        caption: if caption.is_empty() {
                            language.to_string()
                        } else {
                            caption
                        },
                        margin: "2rem".to_string(),
                    };

                    blocks.push(crate::block::Block::ElmCodeBlock(
                        crate::block::ElmCodeBlock {
                            props,
                            id: block.id,
                        },
                    ));
                }
                notionrs::object::block::Block::ColumnList { column_list: _ } => {
                    let children = self.convert_block(&block.id).await?;
                    let block = crate::block::Block::ElmColumnList(crate::block::ElmColumnList {
                        children,
                        id: block.id,
                    });
                    blocks.push(block);
                }
                notionrs::object::block::Block::Column { column: _ } => {
                    let children = self.convert_block(&block.id).await?;
                    let block = crate::block::Block::ElmColumn(crate::block::ElmColumn {
                        children,
                        id: block.id,
                    });
                    blocks.push(block);
                }
                notionrs::object::block::Block::Divider { divider: _ } => {
                    blocks.push(crate::block::Block::ElmDivider(crate::block::ElmDivider {
                        props: crate::block::ElmDividerProps {
                            margin: "2rem".to_string(),
                        },
                        id: block.id,
                    }));
                }
                notionrs::object::block::Block::Embed { embed: _ } => {}
                notionrs::object::block::Block::Equation { equation } => {
                    let props = crate::block::ElmKatexProps {
                        expression: equation.expression,
                        block: true,
                    };

                    let block = crate::block::Block::ElmKatex(crate::block::ElmKatex { props });

                    blocks.push(block);
                }
                notionrs::object::block::Block::File { file } => {
                    let (name, src) = match file {
                        notionrs::object::file::File::External(external_file) => (external_file.name, external_file.external.url),
                        notionrs::object::file::File::Uploaded(uploaded_file) => (uploaded_file.name, uploaded_file.file.url),
                    };

                    let props = crate::block::ElmFileProps {
                        name,
                        src,
                        margin: "2rem".to_string(),
                    };

                    let block = crate::block::Block::ElmFile(crate::block::ElmFile {
                        props,
                        id: block.id,
                    });

                    blocks.push(block);
                }
                notionrs::object::block::Block::Heading1 { heading_1 } => {
                    let heading = heading_1;
                    if heading.is_toggleable {
                        let summary = heading
                            .rich_text
                            .iter()
                            .map(|text_item| text_item.to_string())
                            .collect::<String>();

                        let props = crate::block::ElmToggleProps {
                            summary,
                            margin: "2rem".to_string(),
                        };

                        let children = self.convert_block(&block.id).await?;

                        let block = crate::block::Block::ElmToggle(crate::block::ElmToggle {
                            props,
                            children,
                            id: block.id,
                        });

                        blocks.push(block);
                    } else {
                        let props = crate::block::ElmHeadingProps {
                            text: heading
                                .rich_text
                                .iter()
                                .map(|text_item| text_item.to_string())
                                .collect::<String>(),
                        };

                        let block = crate::block::Block::ElmHeading1(crate::block::ElmHeading1 {
                            props,
                            id: block.id,
                        });

                        blocks.push(block);
                    }
                }
                notionrs::object::block::Block::Heading2 { heading_2 } => {
                    let heading = heading_2;
                    if heading.is_toggleable {
                        let summary = heading
                            .rich_text
                            .iter()
                            .map(|text_item| text_item.to_string())
                            .collect::<String>();

                        let props = crate::block::ElmToggleProps {
                            summary,
                            margin: "2rem".to_string(),
                        };

                        let children = self.convert_block(&block.id).await?;

                        let block = crate::block::Block::ElmToggle(crate::block::ElmToggle {
                            props,
                            children,
                            id: block.id,
                        });

                        blocks.push(block);
                    } else {
                        let props = crate::block::ElmHeadingProps {
                            text: heading
                                .rich_text
                                .iter()
                                .map(|text_item| text_item.to_string())
                                .collect::<String>(),
                        };

                        let block = crate::block::Block::ElmHeading2(crate::block::ElmHeading2 {
                            props,
                            id: block.id,
                        });

                        blocks.push(block);
                    }
                }
                notionrs::object::block::Block::Heading3 { heading_3 } => {
                    let heading = heading_3;
                    if heading.is_toggleable {
                        let summary = heading
                            .rich_text
                            .iter()
                            .map(|text_item| text_item.to_string())
                            .collect::<String>();

                        let props = crate::block::ElmToggleProps {
                            summary,
                            margin: "2rem".to_string(),
                        };

                        let children = self.convert_block(&block.id).await?;

                        let block = crate::block::Block::ElmToggle(crate::block::ElmToggle {
                            props,
                            children,
                            id: block.id,
                        });

                        blocks.push(block);
                    } else {
                        let props = crate::block::ElmHeadingProps {
                            text: heading
                                .rich_text
                                .iter()
                                .map(|text_item| text_item.to_string())
                                .collect::<String>(),
                        };

                        let block = crate::block::Block::ElmHeading3(crate::block::ElmHeading3 {
                            props,
                            id: block.id,
                        });

                        blocks.push(block);
                    }
                }
                notionrs::object::block::Block::Image { image } => {
                    let (src, alt) = match image {
                        notionrs::object::file::File::External(external_image) => (
                            external_image.external.url,
                            external_image.caption
                                .map(|rich_text| {
                                    rich_text.iter().map(|text_item| text_item.to_string()).collect::<String>()
                                })
                                .filter(|caption_text| !caption_text.trim().is_empty()),
                        ),
                        notionrs::object::file::File::Uploaded(uploaded_image) => (
                            uploaded_image.file.url,
                            uploaded_image.caption
                                .map(|rich_text| {
                                    rich_text.iter().map(|text_item| text_item.to_string()).collect::<String>()
                                })
                                .filter(|caption_text| !caption_text.trim().is_empty()),
                        ),
                    };

                    let props = crate::block::ElmBlockImageProps {
                        src: src.clone(),
                        alt,
                        enable_modal: true,
                    };

                    let image_block =
                        crate::block::Block::ElmBlockImage(crate::block::ElmBlockImage {
                            props,
                            id: block.id.clone(),
                        });

                    blocks.push(image_block);
                }
                notionrs::object::block::Block::LinkPreview { link_preview: _ } => {}
                notionrs::object::block::Block::NumberedListItem { numbered_list_item } => {
                    let mut list_item_children: Vec<crate::block::Block> = Vec::new();

                    let rich_text_block =
                        Client::convert_rich_text(numbered_list_item.rich_text).await?;
                    list_item_children.extend(rich_text_block);

                    if block.has_children {
                        let list_item_children_blocks = self.convert_block(&block.id).await?;
                        list_item_children.extend(list_item_children_blocks);
                    }

                    let list_item_block =
                        crate::block::Block::ElmListItem(crate::block::ElmListItem {
                            children: list_item_children,
                            id: block.id.clone(),
                        });

                    let last_item = blocks.last_mut();

                    match last_item {
                        Some(crate::block::Block::ElmNumberedList(elm_numbered_list)) => {
                            elm_numbered_list.children.push(list_item_block);
                        }
                        Some(_) | None => {
                            let new_ol = vec![list_item_block];
                            blocks.push(crate::block::Block::ElmNumberedList(
                                crate::block::ElmNumberedList {
                                    children: new_ol,
                                    id: block.id,
                                },
                            ));
                        }
                    };
                }
                notionrs::object::block::Block::Paragraph { paragraph } => {
                    let block = crate::block::Block::ElmParagraph(crate::block::ElmParagraph {
                        children: Client::convert_rich_text(paragraph.rich_text).await?,
                        id: block.id,
                    });

                    blocks.push(block);
                }
                notionrs::object::block::Block::Pdf { pdf: _ } => {}
                notionrs::object::block::Block::Quote { quote } => {
                    let mut children = Vec::new();

                    let inline_text_block = Client::convert_rich_text(quote.rich_text).await?;

                    let children_block = self.convert_block(&block.id).await?;

                    children.extend(inline_text_block);
                    children.extend(children_block);

                    let block = crate::block::Block::ElmBlockQuote(crate::block::ElmBlockQuote {
                        children,
                        id: block.id,
                    });

                    blocks.push(block);
                }
                notionrs::object::block::Block::SyncedBlock { synced_block: _ } => {
                    let children = self.convert_block(&block.id).await?;
                    blocks.extend(children);
                }
                notionrs::object::block::Block::TableOfContents {
                    table_of_contents: _,
                } => {}
                notionrs::object::block::Block::Table { table: _ } => {
                    let rows = self
                        .notionrs_client
                        .get_block_children_all()
                        .block_id(block.id)
                        .send()
                        .await?;

                    if let Some((header_row, body_rows)) = rows.split_first() {
                        let table_header_block =
                            if let notionrs::object::block::Block::TableRow { table_row } =
                                &header_row.block
                            {
                                let cells_blocks = table_row
                                    .cells
                                    .iter()
                                    .map(|cell| {
                                        crate::block::Block::ElmTableCell(
                                            crate::block::ElmTableCell {
                                                props: crate::block::ElmTableCellProps {
                                                    has_header: true,
                                                    text: cell
                                                        .iter()
                                                        .map(|text_item| text_item.to_string())
                                                        .collect::<String>(),
                                                },
                                            },
                                        )
                                    })
                                    .collect::<Vec<crate::block::Block>>();

                                let table_row_block =
                                    crate::block::Block::ElmTableRow(crate::block::ElmTableRow {
                                        children: cells_blocks,
                                    });

                                crate::block::Block::ElmTableHeader(crate::block::ElmTableHeader {
                                    children: vec![table_row_block],
                                })
                            } else {
                                crate::block::Block::ElmTableHeader(crate::block::ElmTableHeader {
                                    children: vec![],
                                })
                            };

                        let table_body_row_blocks =
                            body_rows.iter().filter_map(|row| match &row.block {
                                notionrs::object::block::Block::TableRow { table_row } => {
                                    let cells_blocks = table_row
                                        .cells
                                        .iter()
                                        .map(|cell| {
                                            crate::block::Block::ElmTableCell(
                                                crate::block::ElmTableCell {
                                                    props: crate::block::ElmTableCellProps {
                                                        has_header: false,
                                                        text: cell
                                                            .iter()
                                                            .map(|text_item| text_item.to_string())
                                                            .collect::<String>(),
                                                    },
                                                },
                                            )
                                        })
                                        .collect::<Vec<crate::block::Block>>();

                                    Some(crate::block::Block::ElmTableRow(
                                        crate::block::ElmTableRow {
                                            children: cells_blocks,
                                        },
                                    ))
                                }
                                _ => None,
                            });

                        let table_body_block =
                            crate::block::Block::ElmTableBody(crate::block::ElmTableBody {
                                children: table_body_row_blocks.collect(),
                            });

                        let table_block = crate::block::Block::ElmTable(crate::block::ElmTable {
                            children: vec![table_header_block, table_body_block],
                        });

                        blocks.push(table_block);
                    }
                }
                notionrs::object::block::Block::TableRow { table_row: _ } => {}
                notionrs::object::block::Block::Template { template: _ } => {}
                notionrs::object::block::Block::ToDo { to_do } => {
                    let props = crate::block::ElmCheckboxProps {
                        label: to_do
                            .rich_text
                            .iter()
                            .map(|text_item| text_item.to_string())
                            .collect::<String>(),
                    };

                    let block = crate::block::Block::ElmCheckbox(crate::block::ElmCheckbox {
                        props,
                        id: block.id,
                    });

                    blocks.push(block);
                }
                notionrs::object::block::Block::Toggle { toggle } => {
                    let summary = toggle
                        .rich_text
                        .iter()
                        .map(|text_item| text_item.to_string())
                        .collect::<String>();

                    let props = crate::block::ElmToggleProps {
                        summary,
                        margin: "2rem".to_string(),
                    };

                    let children = self.convert_block(&block.id).await?;

                    let block = crate::block::Block::ElmToggle(crate::block::ElmToggle {
                        props,
                        children,
                        id: block.id,
                    });

                    blocks.push(block);
                }
                notionrs::object::block::Block::Video { video: _ } => {}
                
                notionrs::object::block::Block::Unsupported => {}

                #[allow(unreachable_patterns)]
                _ => {}
            };
        }

        Ok(blocks)
    }

    pub async fn convert_rich_text(
        rich_text: Vec<notionrs::object::rich_text::RichText>,
    ) -> Result<Vec<crate::block::Block>, crate::error::Error> {
        let mut blocks: Vec<crate::block::Block> = Vec::new();

        for rich_text_item in rich_text {
            let block: Result<crate::block::Block, crate::error::Error> = match rich_text_item {
                notionrs::object::rich_text::RichText::Mention { mention, .. } => match mention {
                    notionrs::object::rich_text::mention::Mention::LinkMention { link_mention } => {
                        let href = link_mention.href.as_str();

                        let mut props = crate::block::ElmInlineLinkProps {
                            href: link_mention.href.to_string(),
                            text: link_mention.to_string(),
                            favicon: None,
                        };

                        let response = reqwest::Client::new()
                            .get(href)
                            .header("user-agent", "Rust - reqwest")
                            .send()
                            .await?
                            .text()
                            .await?;

                        let document = scraper::Html::parse_document(&response);

                        let title = document
                            .select(&scraper::Selector::parse("title")?)
                            .next()
                            .map(|element| element.text().collect::<String>());

                        let og_title_selector =
                            scraper::Selector::parse("meta[property='og:title']")?;

                        if let Some(element) = document.select(&og_title_selector).next() {
                            if let Some(content) = element.value().attr("content") {
                                props.text = content.to_string();
                            }
                        }

                        if let Some(title) = title {
                            props.text = title;
                        }

                        let favicon_selector = scraper::Selector::parse(r#"link[rel="icon"]"#)?;

                        props.favicon = document
                            .select(&favicon_selector)
                            .next()
                            .and_then(|favicon_element| favicon_element.value().attr("href").map(String::from))
                            .and_then(|favicon_href| {
                                if favicon_href.starts_with("http://")
                                    || favicon_href.starts_with("https://")
                                {
                                    Some(favicon_href)
                                } else {
                                    url::Url::parse(&href)
                                        .and_then(|base_url| base_url.join(&favicon_href))
                                        .map(|absolute_url| absolute_url.to_string())
                                        .ok()
                                }
                            });

                        Ok(crate::block::Block::ElmInlineLink(
                            crate::block::ElmInlineLink { props },
                        ))
                    }
                    notionrs::object::rich_text::mention::Mention::User { user: _ } => continue,
                    notionrs::object::rich_text::mention::Mention::Date { date: _ } => continue,
                    notionrs::object::rich_text::mention::Mention::LinkPreview {
                        link_preview: _,
                    } => {
                        continue;
                    }
                    notionrs::object::rich_text::mention::Mention::TemplateMention {
                        template_mention: _,
                    } => continue,
                    notionrs::object::rich_text::mention::Mention::Page { page: _ } => continue,
                    notionrs::object::rich_text::mention::Mention::Database { database: _ } => {
                        continue;
                    }
                    notionrs::object::rich_text::mention::Mention::CustomEmoji { custom_emoji } => {
                        let props = crate::block::ElmInlineIconProps {
                            src: custom_emoji.url.to_string(),
                            alt: custom_emoji.name.to_string(),
                        };

                        let block =
                            crate::block::Block::ElmInlineIcon(crate::block::ElmInlineIcon {
                                id: custom_emoji.id.to_string(),
                                props,
                            });

                        Ok(block)
                    }
                },
                notionrs::object::rich_text::RichText::Text {
                    text: _text,
                    annotations,
                    plain_text,
                    href: _href,
                } => {
                    let props = crate::block::ElmInlineTextProps {
                        text: plain_text.to_string(),
                        bold: annotations.bold,
                        italic: annotations.italic,
                        underline: annotations.underline,
                        strikethrough: annotations.strikethrough,
                        code: annotations.code,
                        color: match annotations.color {
                            notionrs::object::color::Color::Default => None,
                            notionrs::object::color::Color::Blue => Some(String::from("#6987b8")),
                            notionrs::object::color::Color::Brown => Some(String::from("#8b4c3f")),
                            notionrs::object::color::Color::Gray => Some(String::from("#868e9c")),
                            notionrs::object::color::Color::Green => Some(String::from("#59b57c")),
                            notionrs::object::color::Color::Orange => Some(String::from("#bf7e71")),
                            notionrs::object::color::Color::Pink => Some(String::from("#c9699e")),
                            notionrs::object::color::Color::Purple => Some(String::from("#9771bd")),
                            notionrs::object::color::Color::Red => Some(String::from("#b36472")),
                            notionrs::object::color::Color::Yellow => Some(String::from("#b8a36e")),
                            _ => None,
                        },
                    };

                    Ok(crate::block::Block::ElmInlineText(
                        crate::block::ElmInlineText { props },
                    ))
                }
                notionrs::object::rich_text::RichText::Equation {
                    equation,
                    annotations: _annotations,
                    plain_text: _plain_text,
                    href: _href,
                } => {
                    let props = crate::block::ElmKatexProps {
                        block: false,
                        expression: equation.expression,
                    };

                    let block = crate::block::Block::ElmKatex(crate::block::ElmKatex { props });

                    Ok(block)
                }
            };

            blocks.push(block.unwrap());
        }

        Ok(blocks)
    }
}
