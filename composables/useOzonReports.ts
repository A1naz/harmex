interface OzonReportLog {
  timestamp: string;
  message: string;
}

export interface OzonReport {
  uuid: string;
  status: string;
  createdAt: string;
  logs: OzonReportLog[];
}

export const useOzonReports = () => {
  const fetchReports = async (skip: number, limit: number, status: string | string[]): Promise<OzonReport[]> => {
    return await $fetch('/api/ozon/reports/get', {
      method: 'GET',
      query: { skip, limit, status },
    });
  };

  const searchReports = async (query: string, type: string): Promise<OzonReport[]> => {
    return await $fetch('/api/ozon/reports/search', {
      query: { string: query, type },
    });
  };

  return { fetchReports, searchReports };
};
