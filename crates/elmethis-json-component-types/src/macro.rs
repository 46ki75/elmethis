#[macro_export]
macro_rules! to_inline_component {
    ($name:tt) => {
        impl From<$name> for InlineComponent {
            fn from(value: $name) -> Self {
                Self::$name(value)
            }
        }

        impl From<$name> for Component {
            fn from(value: $name) -> Self {
                Self::InlineComponent(value.into())
            }
        }
    };
}

#[macro_export]
macro_rules! to_block_component {
    ($name:tt) => {
        impl From<$name> for BlockComponent {
            fn from(value: $name) -> Self {
                Self::$name(value)
            }
        }

        impl From<$name> for Component {
            fn from(value: $name) -> Self {
                Self::BlockComponent(value.into())
            }
        }
    };
}
