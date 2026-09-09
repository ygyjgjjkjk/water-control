import { useEffect } from 'react';
import { useSimulationStore, advanceDemoClock } from '../simulation/store';

const TICK_MS = 1000;

/** Drives the whole simulation: mount once near the app root. */
export function useSimulationClock() {
  useEffect(() => {
    const interval = setInterval(() => {
      useSimulationStore.getState().tick();
      advanceDemoClock(TICK_MS);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);
}
