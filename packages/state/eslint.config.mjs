import typescriptEslint from '@typescript-eslint/eslint-plugin'
import jest from 'eslint-plugin-jest'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'

export default [{
  ignores: [`**/*.d.ts`, `**/dist`, `**/node_modules`],
}, {
  plugins: {
    '@typescript-eslint': typescriptEslint,
    jest,
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ...jest.environments.globals.globals,
      ...globals.node,
    },

    parser: tsParser,
    ecmaVersion: 2020,
    sourceType: `module`,

    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },

  rules: {
    'array-bracket-spacing': [`error`, `never`],
    'array-callback-return': `error`,
    'arrow-spacing': `error`,
    'brace-style': [`error`, `stroustrup`],

    'comma-spacing': [`error`, {
      before: false,
      after: true,
    }],

    'computed-property-spacing': [`error`, `never`],
    'cond-assign': `off`,
    'dot-notation': `error`,
    'eol-last': [`error`, `always`],
    eqeqeq: `error`,
    'generator-star-spacing': [`error`, `after`],

    indent: [`error`, 2, {
      SwitchCase: 1,
    }],

    'key-spacing': [`error`, {
      beforeColon: false,
      afterColon: true,
    }],

    'keyword-spacing': [`error`, {
      before: true,
    }],

    'linebreak-style': [`error`, `unix`],

    'max-len': [`error`, {
      code: 100,
      tabWidth: 2,
    }],

    named: `off`,
    'no-array-constructor': `error`,

    'no-console': [`warn`, {
      allow: [`warn`, `error`, `info`],
    }],

    'no-dupe-class-members': `error`,
    'no-dupe-keys': `error`,
    'no-else-return': `error`,
    'no-empty': `error`,
    'no-func-assign': `error`,
    'no-label-var': `error`,
    'no-lone-blocks': `error`,
    'no-mixed-spaces-and-tabs': `error`,
    'no-multi-spaces': `error`,
    'no-multi-str': `error`,

    'no-multiple-empty-lines': [`error`, {
      max: 1,
      maxBOF: 0,
      maxEOF: 0,
    }],

    'no-path-concat': `error`,

    'no-redeclare': [`error`, {
      builtinGlobals: true,
    }],

    'no-script-url': `error`,
    'no-self-compare': `error`,

    'no-shadow': [`error`, {
      allow: [`done`],
    }],

    'no-shadow-restricted-names': `error`,
    'no-sync': `error`,
    'no-trailing-spaces': `error`,
    'no-undef': `error`,
    'no-unreachable': `error`,
    'no-unused-labels': `off`,
    'no-unused-vars': `off`,

    '@typescript-eslint/no-unused-vars': [`error`, {
      ignoreRestSiblings: true,
    }],

    'no-use-before-define': `off`,
    '@typescript-eslint/no-use-before-define': [`error`],
    'no-useless-constructor': `error`,
    'no-var': `error`,
    'object-curly-spacing': [`error`, `never`],
    'object-shorthand': [`error`, `always`],
    'prefer-spread': `error`,
    'prefer-template': `error`,

    quotes: [`error`, `backtick`, {
      allowTemplateLiterals: true,
    }],

    radix: `error`,
    semi: [`error`, `never`],
    'space-before-blocks': [`error`, `always`],

    'space-before-function-paren': [`error`, {
      anonymous: `always`,
      named: `never`,
      asyncArrow: `always`,
    }],

    'space-in-parens': [`error`, `never`],
    'space-infix-ops': `error`,
    'spaced-comment': [`error`, `always`],
    'template-curly-spacing': [`error`, `never`],
    'use-isnan': `error`,
    'valid-typeof': `error`,
  },
}]
