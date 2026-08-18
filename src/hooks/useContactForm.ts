import { useEffect, useMemo, useState } from "react";
import type { CountryItem } from "../constants/app";
import { POPULAR_COUNTRIES } from "../constants/app";
import type { CategoryItemData } from "../domain/models";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { PhoneService } from "../services/PhoneService";

export interface ContactFormInitialValues {
  name?: string;
  phone?: string;
  country?: CountryItem;
  countryIso?: string;
  company?: string;
  note?: string;
  favorite?: boolean;
  categoryId?: string | null;
}

export function useContactForm(initial: ContactFormInitialValues) {
  const initialCountry =
    initial.country ?? POPULAR_COUNTRIES.find((item) => item.iso === initial.countryIso) ?? POPULAR_COUNTRIES[0];
  const [name, setName] = useState(initial.name ?? "");
  const [phoneInput, setPhoneInput] = useState(initial.phone ?? "");
  const [country, setCountry] = useState(initialCountry);
  const [company, setCompany] = useState(initial.company ?? "");
  const [note, setNote] = useState(initial.note ?? "");
  const [favorite, setFavorite] = useState(initial.favorite ?? false);
  const [categoryId, setCategoryId] = useState<string | null>(initial.categoryId ?? null);
  const [categories, setCategories] = useState<CategoryItemData[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const parsedPhone = useMemo(() => PhoneService.parse(phoneInput, country.iso), [country.iso, phoneInput]);

  useEffect(() => {
    let active = true;
    void CategoryRepository.getAll()
      .then((items) => {
        if (!active) return;
        setCategories(items);
        setCategoryId((current) => current ?? items[0]?.id ?? null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setCategoriesError(error instanceof Error ? error.message : "No se pudieron cargar las categorías.");
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    values: { name, phoneInput, country, company, note, favorite, categoryId },
    setters: { setName, setPhoneInput, setCountry, setCompany, setNote, setFavorite, setCategoryId },
    categories,
    categoriesError,
    parsedPhone,
    canSubmit: Boolean(name.trim() && parsedPhone.isValid)
  };
}

export type ContactFormController = ReturnType<typeof useContactForm>;
