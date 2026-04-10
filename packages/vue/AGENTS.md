# @elmethis/vue

- Currently we're using SCSS, but we're migrating to CSS. So, when creating new styles, use CSS.

## Directory Structure

- `src/`: Source root.
- `src/assets`: Static assets.
- `src/components`: Vue.js components.
- `src/components/<dir>/ElmX.vue`: Vue.js SFC files.
- `src/components/<dir>/ElmX.stories.tsx`: Storybook files.
- `src/components/template/ElmTemplate.vue`: A template for a Vue SFC file. You should start with this.
- `src/components/template/ElmTemplate.stories.tsx`: A template for a storybook file. You should start with this.
- `src/hooks/useX.ts`: Reusable hooks.
- `src/styles/X.module.scss`: Reusable style modules (SCSS).
- `src/index.ts`: Library exports.
