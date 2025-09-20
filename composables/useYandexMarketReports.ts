interface ReportLog {
  timestamp: string;
  message: string;
}

export interface Report {
  uuid: string;
  status: string;
  createdAt: string;
  logs: ReportLog[];
}

export const useYandexMarketReports = () => {
  const fetchReports = async (skip: number, limit: number, status: string | string[]): Promise<Report[]> => {
    return await $fetch('/api/yandexMarket/reports/get', {
      method: 'GET',
      query: { skip, limit, status },
    });
  };

  const searchReports = async (query: string, type: string): Promise<Report[]> => {
    return await $fetch('/api/yandexMarket/reports/search', {
      query: { string: query, type },
    });
  };

  return { fetchReports, searchReports };
};
