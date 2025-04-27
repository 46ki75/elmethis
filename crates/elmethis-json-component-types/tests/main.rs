use elmethis_json_component_types::ParagraphSlots;

#[test]
fn serialize() {
    let inline =
        elmethis_json_component_types::InlineComponent::Text(elmethis_json_component_types::Text {
            r#type: "Text".to_string(),
            inline: true,
            props: elmethis_json_component_types::TextProps {
                text: "Hello, world!".to_string(),
                ..Default::default()
            },
            ..Default::default()
        });

    let paragraph = elmethis_json_component_types::Component::BlockComponent(
        elmethis_json_component_types::BlockComponent::Paragraph(
            elmethis_json_component_types::Paragraph {
                r#type: "Paragraph".to_string(),
                inline: false,
                props: None,
                slots: ParagraphSlots {
                    default: vec![inline],
                },
            },
        ),
    );

    println!("{}", serde_json::to_string(&paragraph).unwrap());
}
