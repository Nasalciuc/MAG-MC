import { useState, useRef, useCallback } from 'react';

export function useTimelinePlay(totalDuration: number, speed = 1) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const pause = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentDay(0);
  }, [pause]);

  const play = useCallback(() => {
    if (totalDuration <= 0) return;
    setIsPlaying(true);
    startTimeRef.current = performance.now() - (currentDay / totalDuration) * (totalDuration * 1000 / speed);

    function tick(now: number) {
      const elapsed = (now - startTimeRef.current) * speed / 1000;
      const day = Math.min(elapsed, totalDuration);
      setCurrentDay(day);
      if (day < totalDuration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [currentDay, totalDuration, speed]);

  return { isPlaying, currentDay, play, pause, reset };
}
