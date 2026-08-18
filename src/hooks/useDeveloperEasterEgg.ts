import { useCallback, useEffect, useRef, useState } from "react";
import { DEVELOPER_MESSAGES } from "../constants/developerMessages";
import type { AppNotice } from "../store/useAppStore";

interface UseDeveloperEasterEggOptions {
  showNotice: (notice: AppNotice) => void;
}

export function useDeveloperEasterEgg({ showNotice }: UseDeveloperEasterEggOptions) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const tapCountRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageRef = useRef(-1);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleTap = useCallback(() => {
    tapCountRef.current += 1;
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      setCountdown(null);
    }, 4_000);

    const remaining = 15 - tapCountRef.current;
    if (remaining > 0) {
      setCountdown(remaining <= 3 ? remaining : null);
      return;
    }

    tapCountRef.current = 0;
    setCountdown(null);
    let nextIndex = Math.floor(Math.random() * DEVELOPER_MESSAGES.length);
    if (nextIndex === lastMessageRef.current) {
      nextIndex = (nextIndex + 1) % DEVELOPER_MESSAGES.length;
    }
    lastMessageRef.current = nextIndex;
    showNotice({
      title: "Mensaje del desarrollador",
      message: DEVELOPER_MESSAGES[nextIndex],
      tone: "success"
    });
  }, [showNotice]);

  return { countdown, handleTap };
}
