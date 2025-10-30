import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { appTheme } from '@theme/themeConfig';
import { ReportProvider } from '@/features/report/ReportProvider';

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  const basename = import.meta.env.BASE_URL ?? '/';

  return (
    <BrowserRouter basename={basename}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={appTheme}>
          <ReportProvider>{children}</ReportProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
