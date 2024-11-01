import postcssPresetEnv from 'postcss-preset-env'

export default {
  plugins: [
    postcssPresetEnv({
      stage: 3, // stable css spec
      autoprefixer: {},
      features: {}
    })
  ]
}
