import { useCallback, useMemo } from "react";
import type { CountryItem } from "../constants/app";
import { PhoneService } from "../services/PhoneService";

interface UsePhoneComposerOptions {
  input: string;
  country: CountryItem;
  setInput: (value: string) => void;
  setCountry: (country: CountryItem) => void;
}

export function usePhoneComposer({ input, country, setInput, setCountry }: UsePhoneComposerOptions) {
  const parsedPhone = useMemo(() => PhoneService.parse(input, country.iso), [country.iso, input]);

  const applyInput = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setInput("");
        return;
      }
      const normalized = PhoneService.normalizeForInput(value, country.iso);
      if (!normalized) {
        setInput(value);
        return;
      }
      setCountry(normalized.country);
      setInput(normalized.input);
    },
    [country.iso, setCountry, setInput]
  );

  return { parsedPhone, applyInput };
}
