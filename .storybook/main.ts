import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'node:path';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@components': path.resolve(__dirname, '../src/components'),
          '@types': path.resolve(__dirname, '../src/types'),
          '@lib': path.resolve(__dirname, '../src/lib'),
          '@theme': path.resolve(__dirname, '../src/theme'),
          '@providers': path.resolve(__dirname, '../src/providers')
        }
      },
      css: {
        preprocessorOptions: {
          less: {
            javascriptEnabled: true
          }
        }
      },
      optimizeDeps: {
        exclude: ['@antv/g6', '@antv/layout'],
        esbuildOptions: {
          sourcemap: false
        }
      },
      build: {
        sourcemap: false
      }
    })
};

export default config;
