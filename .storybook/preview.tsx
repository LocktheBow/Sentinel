import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { themes } from '@storybook/theming';
import { appTheme, brandColors } from '../src/theme/themeConfig';
import '../src/theme/global.css';

if (typeof window !== 'undefined' && typeof (window as Record<string, unknown>).ResizeObserver === 'undefined') {
  (window as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'Audit Dark',
      values: [
        { name: 'Audit Dark', value: brandColors.background },
        { name: 'Light', value: '#ffffff' }
      ]
    },
    docs: {
      theme: {
        ...themes.dark,
        appBg: brandColors.background,
        appContentBg: brandColors.surface,
        barBg: brandColors.surface,
        textColor: brandColors.text
      }
    }
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={appTheme}>
            <div
              style={{
                minHeight: '100vh',
                backgroundColor: brandColors.background,
                color: brandColors.text
              }}
            >
              <Story />
            </div>
          </ConfigProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
  ]
};

export default preview;
