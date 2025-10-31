import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AuditReport } from '@types/report';
import { loadReportFromUrl } from '@lib/reportLoader';
import { getReportDescriptor, reportCatalog, type ReportDescriptor, type ReportId } from '@data/reportCatalog';

type ReportContextValue = {
  report: AuditReport | null;
  isLoading: boolean;
  error?: Error | null;
  reportId: ReportId;
  setReportId: (next: ReportId) => void;
  descriptor: ReportDescriptor;
};

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

export function ReportProvider({ children }: PropsWithChildren) {
  const [reportId, setReportId] = useState<ReportId>(reportCatalog[0].id);
  const descriptor = getReportDescriptor(reportId);

  const {
    data,
    isFetching,
    error
  } = useQuery({
    queryKey: ['sentinel-report', descriptor.file],
    queryFn: () => loadReportFromUrl(descriptor.file)
  });

  const contextValue = useMemo<ReportContextValue>(
    () => ({
      report: data ?? null,
      isLoading: isFetching && !data,
      error: error as Error | null,
      reportId,
      setReportId,
      descriptor
    }),
    [data, isFetching, error, reportId, descriptor]
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
