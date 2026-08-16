export interface Lead {
  id: string;
  query: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  rating?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapeParams {
  query: string;
  engine: 'maps' | 'search' | 'all';
  limit: number;
}

export interface LeadFilterParams {
  query?: string;
  skip?: number;
  limit?: number;
  hasEmail?: boolean;
  hasPhone?: boolean;
  minRating?: number;
}
