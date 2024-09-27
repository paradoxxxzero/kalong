const js = require('@eslint/js')
const prettier = require('eslint-plugin-prettier')
const eslintConfigPrettier = require('eslint-config-prettier')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const import_ = require('eslint-plugin-import')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  eslintConfigPrettier,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      prettier: prettier,
      react: react,
      import: import_,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key, value]) => [
            key.trim(),
            value,
          ])
        ),
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'import/no-anonymous-default-export': 'off',
      'react/jsx-uses-vars': 'warn',
      'react/jsx-uses-react': 'warn',
      'react/prop-types': 'off',
      ...reactHooks.configs.recommended.rules,
    },
  },
]
