import { apiClient } from './client';
import type { Lead, ScrapeParams } from '../types/lead';

export const scrapeLeadsApi = async (params: ScrapeParams): Promise<Lead[]> => {
  const response = await apiClient.post<Lead[]>('/leads/scrape', null, {
    params: {
      query: params.query,
      engine: params.engine,
      limit: params.limit,
    },
  });
  return response.data;
};

export const getLeadsApi = async (query?: string, skip = 0, limit = 100): Promise<Lead[]> => {
  const response = await apiClient.get<Lead[]>('/leads/', {
    params: {
      query: query || undefined,
      skip,
      limit,
    },
  });
  return response.data;
};

export const getLeadByIdApi = async (id: string): Promise<Lead> => {
  const response = await apiClient.get<Lead>(`/leads/${id}`);
  return response.data;
};
