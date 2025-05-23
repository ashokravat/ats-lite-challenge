export interface Candidate {
  id: number;
  full_name: string;
  title: string;
  location: string;
  timezone: string;
  years_experience: number;
  skills: string;
  languages: string;
  education_level: string;
  degree_major: string;
  availability_weeks: number;
  willing_to_relocate: boolean;
  work_preference: string;
  notice_period_weeks: number;
  desired_salary_usd: number;
  open_to_contract: boolean;
  remote_experience_years: number;
  visa_status: string;
  citizenships: string;
  summary: string;
  tags: string;
  last_active: string;
  linkedin_url: string;
  [key: string]: any; // Allow dynamic access to properties
}

export interface FilterPlan {
  include?: {
    [key: string]: string | string[] | number | boolean | { min?: number; max?: number };
  };
  exclude?: {
    [key: string]: string | string[] | number | boolean | { min?: number; max?: number };
  };
}

export interface RankingCriteria {
  field: string;
  order: 'asc' | 'desc';
}

export interface RankingPlan {
  primary: RankingCriteria;
  tie_breakers?: RankingCriteria[];
}

export interface ProcessingPlans {
  filter: FilterPlan;
  rank: RankingPlan;
  isConversational?: boolean;
}

export interface Stats {
  count: number;
  avg_experience: number;
  top_skills: string[];
}

export type Step = 'thinking' | 'filtering' | 'ranking' | 'speaking' | null;

export interface ConversationalResponse {
  isConversational: true;
}