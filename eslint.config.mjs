import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import prettierConfig from 'eslint-config-prettier';

/** Node.js module bans — Cloudflare Workers runtime constraint. */
const NODE_JS_BAN_PATHS = [
  {
    name: 'fs',
    message: 'Node.js fs module not available in Cloudflare Workers. Use R2 for object storage.',
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
    message: 'Node.js child_process module not available in Cloudflare Workers.',
  },
  {
    name: 'http',
    message: 'Node.js http module not available in Cloudflare Workers. Use fetch API.',
  },
  {
    name: 'https',
    message: 'Node.js https module not available in Cloudflare Workers. Use fetch API.',
  },
  {
    name: 'net',
    message:
      'Node.js net module not available in Cloudflare Workers. Use TCP Sockets API or connect().',
  },
  {
    name: 'dns',
    message: 'Node.js dns module not available in Cloudflare Workers.',
  },
  {
    name: 'stream',
    message: 'Node.js stream module not available in Cloudflare Workers. Use Web Streams API.',
  },
  {
    name: 'buffer',
    message:
      'Node.js buffer module not available in Cloudflare Workers. Use Uint8Array or ArrayBuffer.',
  },
  {
    name: 'util',
    message: 'Node.js util module not available in Cloudflare Workers.',
  },
  {
    name: 'events',
    message: 'Node.js events module not available in Cloudflare Workers. Use EventTarget.',
  },
  {
    name: 'process',
    message:
      'Node.js process module not available in Cloudflare Workers. Use env parameter in fetch handler.',
  },
];

/** Node.js global bans — Cloudflare Workers runtime constraint. */
const NODE_JS_BAN_GLOBALS = [
  {
    name: 'process',
    message:
      'process not available in Cloudflare Workers. Use env parameter in fetch(request, env, ctx).',
  },
  {
    name: '__dirname',
    message: '__dirname not available in Cloudflare Workers (no file system).',
  },
  {
    name: '__filename',
    message: '__filename not available in Cloudflare Workers (no file system).',
  },
  {
    name: 'Buffer',
    message: 'Buffer not available in Cloudflare Workers. Use Uint8Array or ArrayBuffer.',
  },
  {
    name: 'require',
    message: 'require() not available in Cloudflare Workers. Use ES modules (import/export).',
  },
];

/** Library containment — keyed by library name. */
const CONTAINED_LIBS = {
  'better-auth': {
    group: ['better-auth', 'better-auth/**'],
    message:
      'Import better-auth only in src/infrastructure/. Use the AuthService port to access auth from other layers.',
  },
  'drizzle-orm': {
    group: ['drizzle-orm', 'drizzle-orm/**'],
    message:
      'Import drizzle-orm only in src/infrastructure/. Use repository interfaces from domain/ to access data.',
  },
  hono: {
    group: ['hono', 'hono/**'],
    message:
      'Import hono only in src/presentation/ or src/worker.ts. Use domain/application interfaces for business logic.',
  },
  '@cloudflare/workers-types': {
    group: ['@cloudflare/workers-types'],
    message:
      'Import @cloudflare/workers-types only in src/shared/env.ts or src/infrastructure/. Use AppEnv from shared/env.ts.',
  },
};

/**
 * Builds a no-restricted-imports rule combining Node.js bans with
 * library containment bans, excluding libraries listed in allowedKeys.
 */
function restrictedImports(...allowedKeys) {
  const patterns = Object.entries(CONTAINED_LIBS)
    .filter(([key]) => !allowedKeys.includes(key))
    .map(([, value]) => value);
  return patterns.length > 0
    ? ['error', { paths: NODE_JS_BAN_PATHS, patterns }]
    : ['error', { paths: NODE_JS_BAN_PATHS }];
}

export default [
  // Ignore patterns
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      '*.js',
      '!.claude/',
      // Generated acceptance tests use cloudflare:test imports only valid in
      // the Workers vitest pool — exclude from standard TypeScript linting.
      'generated-acceptance-tests/',
    ],
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

      // TypeScript handles undefined-variable checking; no-undef causes
      // false positives on ambient types like Fetcher from workers-types.
      'no-undef': 'off',

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
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'],
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
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
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
      'no-restricted-imports': ['error', { paths: NODE_JS_BAN_PATHS }],

      // Ban Node.js globals
      'no-restricted-globals': ['error', ...NODE_JS_BAN_GLOBALS],

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
        // Vitest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
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

      // TypeScript handles undefined-variable checking; no-undef causes
      // false positives on ambient types like Fetcher from workers-types.
      'no-undef': 'off',

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
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'],
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
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
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
      'no-restricted-imports': ['error', { paths: NODE_JS_BAN_PATHS }],

      // Ban Node.js globals
      'no-restricted-globals': ['error', ...NODE_JS_BAN_GLOBALS],

      // Prettier config (disable conflicting rules)
      ...prettierConfig.rules,
    },
  },

  // Clean Architecture boundary enforcement via eslint-plugin-boundaries
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/include': ['src/**/*.ts'],
      'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts'],
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared', mode: 'folder' },
        { type: 'domain', pattern: 'src/domain', mode: 'folder' },
        { type: 'application', pattern: 'src/application', mode: 'folder' },
        {
          type: 'infrastructure',
          pattern: 'src/infrastructure',
          mode: 'folder',
        },
        { type: 'presentation', pattern: 'src/presentation', mode: 'folder' },
        { type: 'di', pattern: 'src/di', mode: 'folder' },
        {
          type: 'entry',
          pattern: ['src/worker.ts', 'src/index.ts'],
          mode: 'file',
        },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'shared' },
              allow: { to: { type: 'shared' } },
            },
            {
              from: { type: 'domain' },
              allow: { to: { type: ['domain', 'shared'] } },
            },
            {
              from: { type: 'application' },
              allow: { to: { type: ['domain', 'application', 'shared'] } },
            },
            {
              from: { type: 'infrastructure' },
              allow: {
                to: {
                  type: ['domain', 'application', 'shared', 'infrastructure'],
                },
              },
            },
            {
              from: { type: 'presentation' },
              allow: {
                to: {
                  type: ['domain', 'application', 'shared', 'presentation'],
                },
              },
            },
            {
              from: { type: 'di' },
              allow: {
                to: {
                  type: ['domain', 'application', 'shared', 'infrastructure', 'presentation', 'di'],
                },
              },
            },
            {
              from: { type: 'entry' },
              allow: {
                to: {
                  type: [
                    'domain',
                    'application',
                    'shared',
                    'infrastructure',
                    'presentation',
                    'di',
                    'entry',
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  },

  // ─── Library Containment ────────────────────────────────────────────
  // Restricts third-party library imports to their intended architectural
  // layers. See docs/library-containment.md for the full policy.

  // Default: ban all contained libraries across src/
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedImports(),
    },
  },

  // Infrastructure may import: better-auth, drizzle-orm, @cloudflare/workers-types
  {
    files: ['src/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedImports(
        'better-auth',
        'drizzle-orm',
        '@cloudflare/workers-types'
      ),
    },
  },

  // Presentation may import: hono
  {
    files: ['src/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedImports('hono'),
    },
  },

  // Worker entry point may import: hono
  {
    files: ['src/worker.ts', 'src/worker.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports('hono'),
    },
  },

  // shared/env.ts may import: @cloudflare/workers-types
  {
    files: ['src/shared/env.ts'],
    rules: {
      'no-restricted-imports': restrictedImports('@cloudflare/workers-types'),
    },
  },

  // ─── DDD Convention Enforcement ──────────────────────────────────────
  // Intra-layer quality rules that codify DDD conventions into lint rules.
  // Complements eslint-plugin-boundaries (inter-layer) and library
  // containment (third-party imports) with domain purity checks.

  // Domain layer: errors as values, no console side effects
  {
    files: ['src/domain/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Use Result.failure() to represent errors as values.',
        },
        {
          selector: 'CallExpression[callee.object.name="console"]',
          message: 'Use structured logging via the Logger port.',
        },
      ],
    },
  },

  // Domain entities/value objects: must also be synchronous and pure
  {
    files: ['src/domain/entities/**/*.ts', 'src/domain/value-objects/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Use Result.failure() to represent errors as values.',
        },
        {
          selector: 'CallExpression[callee.object.name="console"]',
          message: 'Use structured logging via the Logger port.',
        },
        {
          selector: 'FunctionDeclaration[async=true]',
          message:
            'Entities and value objects must be synchronous. Move async operations to domain services or infrastructure.',
        },
        {
          selector: 'FunctionExpression[async=true]',
          message:
            'Entities and value objects must be synchronous. Move async operations to domain services or infrastructure.',
        },
        {
          selector: 'ArrowFunctionExpression[async=true]',
          message:
            'Entities and value objects must be synchronous. Move async operations to domain services or infrastructure.',
        },
      ],
    },
  },

  // Application layer: errors as values, no HTTP types
  {
    files: ['src/application/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message:
            'Use Result types to represent errors as values. Let presentation layer handle HTTP error responses.',
        },
      ],
      'no-restricted-globals': [
        'error',
        ...NODE_JS_BAN_GLOBALS,
        {
          name: 'Response',
          message:
            'Application layer must not use HTTP types. Return DTOs and let the presentation layer build HTTP responses.',
        },
        {
          name: 'Request',
          message:
            'Application layer must not use HTTP types. Accept DTOs and let the presentation layer parse HTTP requests.',
        },
        {
          name: 'Headers',
          message:
            'Application layer must not use HTTP types. Return DTOs and let the presentation layer build HTTP responses.',
        },
      ],
    },
  },

  // Presentation layer: no direct D1 or Durable Object access
  {
    files: ['src/presentation/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.property.name="prepare"]',
          message:
            'Direct D1 queries belong in repositories. Inject a use case or repository instead.',
        },
        {
          selector: 'CallExpression[callee.property.name="idFromName"]',
          message:
            'Direct DO access belongs in infrastructure. Use a port/repository interface.',
        },
        {
          selector: 'CallExpression[callee.property.name="idFromString"]',
          message:
            'Direct DO access belongs in infrastructure. Use a port/repository interface.',
        },
        {
          selector: 'CallExpression[callee.property.name="newUniqueId"]',
          message:
            'Direct DO access belongs in infrastructure. Use a port/repository interface.',
        },
      ],
    },
  },

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
        // Vitest globals for test files
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      // Allow Node.js imports in development tooling
      'no-restricted-imports': 'off',
      'no-restricted-globals': 'off',
    },
  },

  // Build scripts in scripts/ directory can use Node.js APIs
  // (run via tsx/vitest in Node.js, not in Cloudflare Workers)
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-globals': 'off',
      'no-console': 'off',
    },
  },

  // Acceptance pipeline in acceptance/ directory can use Node.js APIs
  // (runs via tsx in Node.js, not in Cloudflare Workers)
  {
    files: ['acceptance/**/*.ts'],
    languageOptions: {
      globals: {
        // Node.js globals needed for acceptance pipeline
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // Vitest globals for test files
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      // Allow Node.js imports in acceptance pipeline (runs in Node.js, not Workers)
      'no-restricted-imports': 'off',
      'no-restricted-globals': 'off',
      // Allow console.log in pipeline CLI
      'no-console': 'off',
    },
  },
];
