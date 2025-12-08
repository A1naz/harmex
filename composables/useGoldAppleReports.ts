interface GoldAppleReportLog {
  timestamp: string;
  message: string;
}

export interface GoldAppleReport {
  uuid: string;
  status: string;
  createdAt: string;
  logs: GoldAppleReportLog[];
}

export const useGoldAppleReports = () => {
  const fetchReports = async (skip: number, limit: number, status: string | string[]): Promise<GoldAppleReport[]> => {
    return await $fetch('/api/goldApple/reports/get', {
      method: 'GET',
      query: { skip, limit, status },
    });
  };

  const searchReports = async (query: string, type: string): Promise<GoldAppleReport[]> => {
    return await $fetch('/api/goldApple/reports/search', {
      query: { string: query, type },
    });
  };

  return { fetchReports, searchReports };
};
