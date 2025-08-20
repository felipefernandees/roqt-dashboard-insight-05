import { useState, useCallback, useRef } from 'react';

export const useGeneralUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const triggerUpdate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setIsSuccess(false);
      startTimer();

      const response = await fetch('https://autowebhook.mgtautomacoes.cloud/webhook/ativa-tudo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'general-update'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setIsUpdating(false);
          stopTimer();
        }, 2000);
      } else {
        throw new Error('Falha na atualização');
      }
    } catch (error) {
      console.error('Erro na atualização geral:', error);
      setIsUpdating(false);
      stopTimer();
    }
  }, [startTimer, stopTimer]);

  return {
    isUpdating,
    isSuccess,
    elapsedTime,
    triggerUpdate
  };
};