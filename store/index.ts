import { create } from 'zustand';
import { Candidate, FilterPlan, RankingPlan, Stats, Step } from '../types';

interface StoreState {
  // Data
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  rankedCandidates: Candidate[];

  // Query state
  query: string;
  loading: boolean;
  hasLoadedOnce: boolean;
  currentStep: Step;

  // Agent plans
  filterPlan: FilterPlan | null;
  rankPlan: RankingPlan | null;
  stats: Stats | null;

  // UI state
  selectedCandidate: Candidate | null;
  timelineVisible: boolean;
  resultVisible: boolean;
  messages: {
    role: 'user' | 'assistant'; content: string, data?: {
      rankedCandidates?: Candidate[];
      stats?: any;
    };
  }[];

  // Actions
  setCandidates: (candidates: Candidate[]) => void;
  setQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setHasLoadedOnce: (value: boolean) => void;
  setCurrentStep: (step: Step) => void;
  setFilterPlan: (plan: FilterPlan | null) => void;
  setFilteredCandidates: (candidates: Candidate[]) => void;
  setRankPlan: (plan: RankingPlan | null) => void;
  setRankedCandidates: (candidates: Candidate[]) => void;
  setStats: (stats: Stats | null) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  toggleTimeline: () => void;
  toggleResult: () => void;
  setTimelineVisible: (visible: boolean) => void;
  addMessage: (message: {
    role: 'user' | 'assistant'; content: string; data?: {
      rankedCandidates?: Candidate[];
      stats?: any;
    };
  }) => void;
  reset: () => void;
  updateLastMessage: (content: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state
  candidates: [],
  filteredCandidates: [],
  rankedCandidates: [],
  query: '',
  loading: false,
  hasLoadedOnce: false,
  currentStep: null,
  filterPlan: null,
  rankPlan: null,
  stats: null,
  selectedCandidate: null,
  timelineVisible: false,
  resultVisible: false,
  messages: [],

  // Actions
  setCandidates: (candidates) => set({ candidates }),
  setQuery: (query) => set({ query }),
  setLoading: (loading) => set({ loading }),
  setHasLoadedOnce: (value) => set({ hasLoadedOnce: value }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setFilterPlan: (plan) => set({ filterPlan: plan }),
  setFilteredCandidates: (candidates) => set({ filteredCandidates: candidates }),
  setRankPlan: (plan) => set({ rankPlan: plan }),
  setRankedCandidates: (candidates) => set({ rankedCandidates: candidates }),
  setStats: (stats) => set({ stats }),
  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
  toggleTimeline: () => set((state) => ({ timelineVisible: !state.timelineVisible })),
  toggleResult: () => set((state) => ({ resultVisible: !state.resultVisible })),
  setTimelineVisible: (visible: boolean) => set({ timelineVisible: visible }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  updateLastMessage: (content: string) => set(state => {
    const messages = [...state.messages];
    if (messages.length > 0) {
      const lastIndex = messages.length - 1;
      messages[lastIndex] = {
        ...messages[lastIndex],
        content
      };
    }
    return { messages };
  }),

  // Reset everything except the original candidates
  reset: () => set((state) => ({
    filteredCandidates: [],
    rankedCandidates: [],
    query: '',
    loading: false,
    currentStep: null,
    filterPlan: null,
    rankPlan: null,
    stats: null,
    selectedCandidate: null,
    messages: [],
  })),
}));