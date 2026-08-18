import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { CommunicationService } from "../services/CommunicationService";
import { PhoneService } from "../services/PhoneService";

interface UseClipboardDetectionOptions {
  enabled: boolean;
  currentInput: string;
  countryIso: string;
}

export function useClipboardDetection({ enabled, currentInput, countryIso }: UseClipboardDetectionOptions) {
  const [candidate, setCandidate] = useState<string | null>(null);
  const enabledRef = useRef(enabled);
  const currentInputRef = useRef(currentInput);
  const countryIsoRef = useRef(countryIso);
  const focusedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastProcessedClipboardRef = useRef<string | null>(null);
  const detectionRequestRef = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) detectionRequestRef.current += 1;
  }, [enabled]);

  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);

  useEffect(() => {
    countryIsoRef.current = countryIso;
  }, [countryIso]);

  const detect = useCallback(async () => {
    const requestId = ++detectionRequestRef.current;
    if (!enabledRef.current) {
      setCandidate(null);
      return;
    }
    try {
      const text = await CommunicationService.readClipboard();
      if (requestId !== detectionRequestRef.current || !focusedRef.current) return;
      const clipboardValue = text?.trim() ?? "";
      if (!clipboardValue || clipboardValue === lastProcessedClipboardRef.current) return;

      // El mismo contenido no debe reaparecer al escribir, elegir un reciente o cambiar de país.
      lastProcessedClipboardRef.current = clipboardValue;
      if (clipboardValue === currentInputRef.current.trim()) {
        setCandidate(null);
        return;
      }

      const normalized = PhoneService.normalizeForInput(clipboardValue, countryIsoRef.current);
      const currentParsed = PhoneService.parse(currentInputRef.current, countryIsoRef.current);
      if (normalized && currentParsed.isValid && normalized.parsed.e164 === currentParsed.e164) {
        setCandidate(null);
        return;
      }
      setCandidate(normalized?.parsed.formattedInternational ?? null);
    } catch {
      setCandidate(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      void detect();
      return () => {
        focusedRef.current = false;
        detectionRequestRef.current += 1;
        setCandidate(null);
      };
    }, [detect])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const returningToForeground = appStateRef.current !== "active" && nextState === "active";
      appStateRef.current = nextState;
      if (nextState !== "active") {
        detectionRequestRef.current += 1;
        setCandidate(null);
      }
      if (returningToForeground && focusedRef.current) void detect();
    });
    return () => subscription.remove();
  }, [detect]);

  useEffect(() => {
    if (!candidate) return;
    const timer = setTimeout(() => setCandidate(null), 8_000);
    return () => clearTimeout(timer);
  }, [candidate]);

  const dismiss = useCallback(() => {
    detectionRequestRef.current += 1;
    setCandidate(null);
  }, []);

  return { candidate: enabled ? candidate : null, dismiss };
}
