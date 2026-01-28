import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore patterns
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.js', '!.claude/'],
  },

  // Base configuration for all TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        // Web Standard APIs available in Workers
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,

      // TypeScript ESLint recommended rules
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,

      // Custom TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      // JSDoc rules
      ...jsdocPlugin.configs['recommended-typescript'].rules,
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          publicOnly: {
            cjs: true,
            esm: true,
            window: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration',
          ],
        },
      ],
      'jsdoc/require-description': [
        'error',
        {
          contexts: ['any'],
        },
      ],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-property-type': 'off',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-property-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/no-undefined-types': 'error',
      'jsdoc/valid-types': 'error',
      'jsdoc/require-returns': [
        'error',
        {
          forceRequireReturn: false,
          forceReturnsWithAsync: false,
        },
      ],
      'jsdoc/require-yields': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/no-bad-blocks': 'error',
      'jsdoc/no-blank-block-descriptions': 'error',
      'jsdoc/no-defaults': 'error',
      'jsdoc/require-asterisk-prefix': 'error',
      'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
      'jsdoc/tag-lines': [
        'error',
        'any',
        {
          startLines: 1,
        },
      ],

      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Cloudflare Workers runtime constraints - ban Node.js imports
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'fs',
              message:
                'Node.js fs module not available in Cloudflare Workers. Use R2 for object storage.',
            },
            {
              name: 'path',
              message:
                'Node.js path module not available in Cloudflare Workers. Use URL API for path manipulation.',
            },
            {
              name: 'os',
              message: 'Node.js os module not available in Cloudflare Workers.',
            },
            {
              name: 'crypto',
              message:
                'Node.js crypto module not available in Cloudflare Workers. Use Web Crypto API (crypto.subtle).',
            },
            {
              name: 'child_process',
              message:
                'Node.js child_process module not available in Cloudflare Workers.',
            },
            {
              name: 'http',
              message:
                'Node.js http module not available in Cloudflare Workers. Use fetch API.',
            },
            {
              name: 'https',
              message:
                'Node.js https module not available in Cloudflare Workers. Use fetch API.',
            },
            {
              name: 'net',
              message:
                'Node.js net module not available in Cloudflare Workers. Use TCP Sockets API or connect().',
            },
            {
              name: 'dns',
              message:
                'Node.js dns module not available in Cloudflare Workers.',
            },
            {
              name: 'stream',
              message:
                'Node.js stream module not available in Cloudflare Workers. Use Web Streams API.',
            },
            {
              name: 'buffer',
              message:
                'Node.js buffer module not available in Cloudflare Workers. Use Uint8Array or ArrayBuffer.',
            },
            {
              name: 'util',
              message:
                'Node.js util module not available in Cloudflare Workers.',
            },
            {
              name: 'events',
              message:
                'Node.js events module not available in Cloudflare Workers. Use EventTarget.',
            },
            {
              name: 'process',
              message:
                'Node.js process module not available in Cloudflare Workers. Use env parameter in fetch handler.',
            },
          ],
        },
      ],

      // Ban Node.js globals
      'no-restricted-globals': [
        'error',
        {
          name: 'process',
          message:
            'process not available in Cloudflare Workers. Use env parameter in fetch(request, env, ctx).',
        },
        {
          name: '__dirname',
          message:
            '__dirname not available in Cloudflare Workers (no file system).',
        },
        {
          name: '__filename',
          message:
            '__filename not available in Cloudflare Workers (no file system).',
        },
        {
          name: 'Buffer',
          message:
            'Buffer not available in Cloudflare Workers. Use Uint8Array or ArrayBuffer.',
        },
        {
          name: 'require',
          message:
            'require() not available in Cloudflare Workers. Use ES modules (import/export).',
        },
      ],

      // Prettier config (disable conflicting rules)
      ...prettierConfig.rules,
    },
  },

  // Test files configuration
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        // Web Standard APIs available in Workers
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,

      // TypeScript ESLint recommended rules
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,

      // Custom TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      // JSDoc rules
      ...jsdocPlugin.configs['recommended-typescript'].rules,
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          publicOnly: {
            cjs: true,
            esm: true,
            window: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration',
          ],
        },
      ],
      'jsdoc/require-description': [
        'error',
        {
          contexts: ['any'],
        },
      ],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-property-type': 'off',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-property-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/no-undefined-types': 'error',
      'jsdoc/valid-types': 'error',
      'jsdoc/require-returns': [
        'error',
        {
          forceRequireReturn: false,
          forceReturnsWithAsync: false,
        },
      ],
      'jsdoc/require-yields': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/no-bad-blocks': 'error',
      'jsdoc/no-blank-block-descriptions': 'error',
      'jsdoc/no-defaults': 'error',
      'jsdoc/require-asterisk-prefix': 'error',
      'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
      'jsdoc/tag-lines': [
        'error',
        'any',
        {
          startLines: 1,
        },
      ],

      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Cloudflare Workers runtime constraints - ban Node.js imports
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'fs',
              message:
                'Node.js fs module not available in Cloudflare Workers. Use R2 for object storage.',
            },
            {
              name: 'path',
              message:
                'Node.js path module not available in Cloudflare Workers. Use URL API for path manipulation.',
            },
            {
              name: 'os',
              message: 'Node.js os module not available in Cloudflare Workers.',
            },
            {
              name: 'crypto',
              message:
                'Node.js crypto module not available in Cloudflare Workers. Use Web Crypto API (crypto.subtle).',
            },
            {
              name: 'child_process',
              message:
                'Node.js child_process module not available in Cloudflare Workers.',
            },
            {
              name: 'http',
              message:
                'Node.js http module not available in Cloudflare Workers. Use fetch API.',
            },
            {
              name: 'https',
              message:
                'Node.js https module not available in Cloudflare Workers. Use fetch API.',
            },
            {
              name: 'net',
              message:
                'Node.js net module not available in Cloudflare Workers. Use TCP Sockets API or connect().',
            },
            {
              name: 'dns',
              message:
                'Node.js dns module not available in Cloudflare Workers.',
            },
            {
              name: 'stream',
              message:
                'Node.js stream module not available in Cloudflare Workers. Use Web Streams API.',
            },
            {
              name: 'buffer',
              message:
                'Node.js buffer module not available in Cloudflare Workers. Use Uint8Array or ArrayBuffer.',
            },
            {
              name: 'util',
              message:
                'Node.js util module not available in Cloudflare Workers.',
            },
            {
              name: 'events',
              message:
                'Node.js events module not available in Cloudflare Workers. Use EventTarget.',
            },
            {
              name: 'process',
              message:
                'Node.js process module not available in Cloudflare Workers. Use env parameter in fetch handler.',
            },
          ],
        },
      ],

      // Ban Node.js globals
      'no-restricted-globals': [
        'error',
        {
          name: 'process',
          message:
            'process not available in Cloudflare Workers. Use env parameter in fetch(request, env, ctx).',
        },
        {
          name: '__dirname',
          message:
            '__dirname not available in Cloudflare Workers (no file system).',
        },
        {
          name: '__filename',
          message:
            '__filename not available in Cloudflare Workers (no file system).',
        },
        {
          name: 'Buffer',
          message:
            'Buffer not available in Cloudflare Workers. Use Uint8Array or ArrayBuffer.',
        },
        {
          name: 'require',
          message:
            'require() not available in Cloudflare Workers. Use ES modules (import/export).',
        },
      ],

      // Prettier config (disable conflicting rules)
      ...prettierConfig.rules,
    },
  },

  // Clean Architecture layer boundary enforcement
  // IMPORTANT: Uncomment these rules once you've created the proper directory structure
  // with src/domain/, src/application/, src/infrastructure/, src/presentation/
  //
  // Domain layer cannot import from outer layers
  // {
  //   files: ['src/domain/**/*.ts'],
  //   rules: {
  //     'no-restricted-imports': [
  //       'error',
  //       {
  //         patterns: [
  //           {
  //             group: ['**/infrastructure/**', '**/presentation/**', '**/application/**'],
  //             message:
  //               'Domain layer must not import from outer layers (application, infrastructure, presentation). Domain should only depend on other domain code.',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },
  //
  // Application layer cannot import from infrastructure or presentation
  // {
  //   files: ['src/application/**/*.ts'],
  //   rules: {
  //     'no-restricted-imports': [
  //       'error',
  //       {
  //         patterns: [
  //           {
  //             group: ['**/infrastructure/**', '**/presentation/**'],
  //             message:
  //               'Application layer must not import from outer layers (infrastructure, presentation). Application should depend on domain interfaces, not concrete implementations.',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },
  //
  // Infrastructure layer cannot import from presentation
  // {
  //   files: ['src/infrastructure/**/*.ts'],
  //   rules: {
  //     'no-restricted-imports': [
  //       'error',
  //       {
  //         patterns: [
  //           {
  //             group: ['**/presentation/**'],
  //             message:
  //               'Infrastructure layer must not import from presentation layer. Infrastructure implements domain interfaces and can be used by presentation.',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // },

  // Development tooling in .claude/ directory can use Node.js APIs
  {
    files: ['.claude/**/*.ts'],
    languageOptions: {
      globals: {
        // Node.js globals needed for hooks and memory management
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // Jest globals for test files
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Allow Node.js imports in development tooling
      'no-restricted-imports': 'off',
      'no-restricted-globals': 'off',
    },
  },
];
