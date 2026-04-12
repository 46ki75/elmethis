# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6

---

## Paragraph & Inline Styles

This is a plain paragraph with **bold text**, *italic text*, ~~strikethrough~~, and `inline code`.

You can also combine them: ***bold and italic***, **`bold code`**, and *~~italic strikethrough~~*.

Here is a [link to example.com](https://example.com) and another with nested formatting: [**bold link**](https://example.com).

---

## Blockquote

> The only way to do great work is to love what you do.

> Blockquotes can also contain **bold**, *italic*, and `code` inline styles.

---

## Unordered List

- Alpha
- Beta
- Gamma
  - Nested item A
  - Nested item B

## Ordered List

1. First item
2. Second item
3. Third item

---

## Code Blocks

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const greet = (user: User): string => {
  return `Hello, ${user.name}!`;
};
```

```bash
npm install --save-dev typescript
npx tsc --init
```

```json
{
  "name": "elmethis",
  "version": "1.0.0",
  "private": true
}
```

---

## Table

| Name  | Type   | Required | Description                  |
| ----- | ------ | -------- | ---------------------------- |
| id    | number | Yes      | Unique identifier            |
| name  | string | Yes      | Display name of the user     |
| email | string | No       | Contact email address        |
| role  | string | No       | Permission role (admin/user) |

---

## Horizontal Rule

Above the rule.

---

Below the rule.

## Image

![Sample image](https://picsum.photos/seed/elmethis/800/400)
