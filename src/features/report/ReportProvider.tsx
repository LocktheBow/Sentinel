import { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AuditReport } from '@types/report';
import { loadReportFromUrl } from '@lib/reportLoader';

type ReportContextValue = {
  report: AuditReport | null;
  isLoading: boolean;
  error?: Error | null;
};

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

export function ReportProvider({ children }: PropsWithChildren) {
  const {
    data,
    isFetching,
    error
  } = useQuery({
    queryKey: ['audit-report-default'],
    queryFn: () => loadReportFromUrl('sentinel_report.json')
  });

  const contextValue = useMemo<ReportContextValue>(
    () => ({
      report: data ?? null,
      isLoading: isFetching && !data,
      error: error as Error | null
    }),
    [data, isFetching, error]
  );

  return <ReportContext.Provider value={contextValue}>{children}</ReportContext.Provider>;
}

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
