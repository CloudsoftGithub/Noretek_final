// eslint.config.js
import next from '@next/eslint-plugin-next';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

export default [
  // Base JavaScript configuration
  js.configs.recommended,
  
  // React configuration
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // Next.js configuration
  {
    plugins: {
      '@next/next': next,
    },
    rules: {
      // Disable img warnings - you have 21 of these
      '@next/next/no-img-element': 'off',
      
      // Make dependency warnings less strict
      'react-hooks/exhaustive-deps': 'warn',
      
      // Disable anonymous export warning
      'import/no-anonymous-default-export': 'off',
      
      // Optional: Add other rules you want to customize
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Not needed with TypeScript
    },
  },
  
  // Apply to all JS/TS files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['node_modules/**', '.next/**'],
  },
];