
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DashboardData {
  comunidade: any;
  produtos: any;
  financeiro: any;
}

interface DashboardContextType {
  data: DashboardData;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (dashboard: 'comunidade' | 'produtos' | 'financeiro', forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const CACHE_KEY = 'dashboard_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>({
    comunidade: null,
    produtos: null,
    financeiro: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track which dashboards have been attempted to prevent multiple calls
  const [attemptedFetches, setAttemptedFetches] = useState({
    comunidade: false,
    produtos: false,
    financeiro: false
  });

  // Track ongoing requests to prevent duplicates
  const [ongoingRequests, setOngoingRequests] = useState({
    comunidade: false,
    produtos: false,
    financeiro: false
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (parsed.timestamp && (now - parsed.timestamp) < CACHE_EXPIRY) {
          setData(parsed.data);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }, []);

  const saveToCache = (newData: DashboardData) => {
    const cacheObject = {
      data: newData,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  };

  const fetchDashboardData = async (dashboard: 'comunidade' | 'produtos' | 'financeiro', forceRefresh = false) => {
    // Prevent multiple simultaneous calls for the same dashboard
    if (ongoingRequests[dashboard]) {
      console.log(`Request for ${dashboard} already in progress, skipping`);
      return;
    }

    // If already attempted and not forcing refresh, don't fetch again
    if (attemptedFetches[dashboard] && !forceRefresh) {
      console.log(`${dashboard} already attempted, skipping`);
      return;
    }

    // If data already exists and not forcing refresh, don't fetch again
    if (data[dashboard] && !forceRefresh) {
      console.log(`${dashboard} data already exists, skipping`);
      return;
    }

    // Mark as ongoing request
    setOngoingRequests(prev => ({ ...prev, [dashboard]: true }));
    setIsLoading(true);
    setError(null);
    
    try {
      const webhookUrls = {
        comunidade: 'https://autowebhook.mgtautomacoes.cloud/webhook/dash-comunidade',
        produtos: 'https://autowebhook.mgtautomacoes.cloud/webhook/dash-produtos',
        financeiro: 'https://autowebhook.mgtautomacoes.cloud/webhook/dash-financeiro'
      };

      console.log(`Fetching data for ${dashboard}...`);
      
      const response = await fetch(webhookUrls[dashboard], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: `dashboard-${dashboard}`
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        const newData = { ...data, [dashboard]: responseData };
        setData(newData);
        saveToCache(newData);
        setError(null);
        console.log(`Successfully fetched ${dashboard} data`);
      } else {
        throw new Error(`Erro ${response.status}: Falha ao carregar dados do ${dashboard}`);
      }
    } catch (error) {
      console.error(`Failed to fetch ${dashboard} data:`, error);
      const errorMessage = error instanceof Error ? error.message : `Falha ao recolher informações do ${dashboard}`;
      setError(errorMessage);
      
      // DO NOT RETRY - Just set error and stop
      console.log(`Error occurred for ${dashboard}, stopping all attempts`);
    } finally {
      setIsLoading(false);
      setOngoingRequests(prev => ({ ...prev, [dashboard]: false }));
      setAttemptedFetches(prev => ({ ...prev, [dashboard]: true }));
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setData({
      comunidade: null,
      produtos: null,
      financeiro: null,
    });
    // Reset attempted fetches
    setAttemptedFetches({
      comunidade: false,
      produtos: false,
      financeiro: false
    });
  };

  return (
    <DashboardContext.Provider value={{ data, isLoading, error, fetchDashboardData, clearCache }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardProvider');
  }
  return context;
}
