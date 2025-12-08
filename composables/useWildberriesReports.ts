interface WildberriesReportLog {
  timestamp: string;
  message: string;
}

export interface WildberriesReport {
  uuid: string;
  status: string;
  createdAt: string;
  logs: WildberriesReportLog[];
}

export const useWildberriesReports = () => {
  const fetchReports = async (skip: number, limit: number, status: string | string[]): Promise<WildberriesReport[]> => {
    return await $fetch('/api/wildberries/reports/get', {
      method: 'GET',
      query: { skip, limit, status },
    });
  };

  const searchReports = async (query: string, type: string): Promise<WildberriesReport[]> => {
    return await $fetch('/api/wildberries/reports/search', {
      query: { string: query, type },
    });
  };

  return { fetchReports, searchReports };
};
