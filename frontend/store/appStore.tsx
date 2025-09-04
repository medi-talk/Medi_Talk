// store/appStore.tsx
import React, { createContext, useContext, useMemo, useReducer } from 'react';

export type TimerItem = {
  id: string;
  name: string;
  intervalMin: number;
  remainingSec: number;
  running: boolean;
};

export type DisposalItem = {
  id: string;
  name: string;
  expiry: string; 
};

export type Medication = {
  id: string;
  name: string;
  startDate: string; 
  endDate: string;   
  intervalMin: number;
  expiry: string;    
  alarmFlag?: boolean;
};

type AppState = {
  timers: TimerItem[];
  disposals: DisposalItem[];
  medications: Medication[]; 
};

type AddLinkedPayload = {
  name: string;
  intervalMin: number;
  expiry: string;     
  startDate: string;  
  endDate: string;    
  alarmFlag?: boolean;
};

type Action =
  | { type: 'ADD_LINKED'; payload: AddLinkedPayload }
  | { type: 'ADD_DISPOSAL'; payload: DisposalItem }
  | { type: 'REMOVE_DISPOSAL'; id: string }
  | { type: 'HYDRATE_TIMERS'; payload: TimerItem[] };

function genId() {
  return `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

const initialState: AppState = {
  timers: [
    { id: 't1', name: '타이레놀 500mg', intervalMin: 480, remainingSec: 480 * 60, running: false },
    { id: 't2', name: '비타민C 1000mg', intervalMin: 1440, remainingSec: 1440 * 60, running: false },
  ],
  disposals: [
    { id: 'd1', name: '타이레놀 500mg', expiry: '2025-09-03' },
    { id: 'd2', name: '비타민C 1000mg', expiry: '2025-09-25' },
  ],
  medications: [
    { id: 'm1', name: '타이레놀', startDate: '2025-08-25', endDate: '2025-08-27', intervalMin: 480, expiry: '2025-09-03' },
    { id: 'm2', name: '비타민C', startDate: '2025-08-20', endDate: '2025-09-20', intervalMin: 1440, expiry: '2025-09-25' },
  ],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_LINKED': {
      const id = genId();

      const t: TimerItem = {
        id: `t_${id}`,
        name: action.payload.name,
        intervalMin: action.payload.intervalMin,
        remainingSec: action.payload.intervalMin * 60,
        running: false,
      };

      const d: DisposalItem = {
        id: `d_${id}`,
        name: action.payload.name,
        expiry: action.payload.expiry,
      };

      const m: Medication = {
        id: `m_${id}`,
        name: action.payload.name,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
        intervalMin: action.payload.intervalMin,
        expiry: action.payload.expiry,
        alarmFlag: action.payload.alarmFlag,
      };

      return {
        ...state,
        timers: [t, ...state.timers],
        disposals: [d, ...state.disposals],
        medications: [m, ...state.medications],
      };
    }

    case 'ADD_DISPOSAL': {
      return { ...state, disposals: [action.payload, ...state.disposals] };
    }

    case 'REMOVE_DISPOSAL': {
      return { ...state, disposals: state.disposals.filter(x => x.id !== action.id) };
    }

    case 'HYDRATE_TIMERS': {
      return { ...state, timers: action.payload };
    }

    default:
      return state;
  }
}

const AppStoreCtx = createContext<{
  state: AppState;
  addLinked: (p: AddLinkedPayload) => void;
  addDisposal: (d: DisposalItem) => void;
  removeDisposal: (id: string) => void;
} | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo(() => ({
    state,
    addLinked: (p: AddLinkedPayload) => dispatch({ type: 'ADD_LINKED', payload: p }),
    addDisposal: (d: DisposalItem) => dispatch({ type: 'ADD_DISPOSAL', payload: d }),
    removeDisposal: (id: string) => dispatch({ type: 'REMOVE_DISPOSAL', id }),
  }), [state]);

  return <AppStoreCtx.Provider value={api}>{children}</AppStoreCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreCtx);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}