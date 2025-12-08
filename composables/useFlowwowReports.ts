interface FlowwowReportLog {
  timestamp: string;
  message: string;
}

export interface FlowwowReport {
  uuid: string;
  status: string;
  createdAt: string;
  logs: FlowwowReportLog[];
}

export const useFlowwowReports = () => {
  const fetchReports = async (skip: number, limit: number, status: string | string[]): Promise<FlowwowReport[]> => {
    return await $fetch('/api/flowwow/reports/get', {
      method: 'GET',
      query: { skip, limit, status },
    });
  };

  const searchReports = async (query: string, type: string): Promise<FlowwowReport[]> => {
    return await $fetch('/api/flowwow/reports/search', {
      query: { string: query, type },
    });
  };

  return { fetchReports, searchReports };
};
