#[test]
fn main() {
    let inline = elmethis_json_component_types::Component::InlineComponent(
        elmethis_json_component_types::InlineComponent::Text(elmethis_json_component_types::Text {
            r#type: "Text".to_string(),
            inline: true,
            props: elmethis_json_component_types::TextProps {
                text: "Hello, world!".to_string(),
                ..Default::default()
            },
            ..Default::default()
        }),
    );

    println!("{}", serde_json::to_string(&inline).unwrap());
}
