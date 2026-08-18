export interface InternalContact {
  id: string;
  phoneE164: string;
  phoneFormatted: string;
  countryCode: string;
  countryIso: string;
  name: string;
  company: string | null;
  note: string | null;
  categoryId: string | null;
  favorite: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CreateContactParams {
  phoneE164: string;
  phoneFormatted: string;
  countryCode: string;
  countryIso: string;
  name: string;
  company?: string;
  note?: string;
  categoryId?: string;
  favorite?: boolean;
}

export interface CategoryItemData {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: number;
  createdAt: string;
}

export type CommunicationActionType =
  | "whatsapp"
  | "whatsapp_message"
  | "call"
  | "sms"
  | "copy"
  | "share"
  | "save_contact";

export interface LogHistoryActionParams {
  phoneE164: string;
  phoneFormatted: string;
  countryCode: string;
  countryIso: string;
  actionType: CommunicationActionType;
  name?: string;
  metadata?: string;
}

export interface PhoneHistoryEntry {
  id: string;
  phoneE164: string;
  phoneFormatted: string;
  countryCode: string;
  countryIso: string;
  name: string | null;
  firstInteractionAt: string;
  lastInteractionAt: string;
  interactionCount: number;
  favorite: number;
  archived: number;
}

export interface CommunicationActionEntry {
  id: string;
  historyId: string | null;
  actionType: string;
  createdAt: string;
  metadata: string | null;
}

export interface HistoryStats {
  totalWhatsapp: number;
  totalCalls: number;
  totalSms: number;
  totalActions: number;
  uniqueNumbers: number;
  favoriteNumbers: number;
  last7DaysActions: number;
  last30DaysActions: number;
}

export interface ContactReminder {
  id: string;
  contactId: string | null;
  phoneE164: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  notificationId: string | null;
  completed: number;
  createdAt: string;
}

export interface CreateReminderParams {
  contactId?: string;
  phoneE164: string;
  title: string;
  description?: string;
  scheduledAt: string;
  notificationId?: string;
}

export type MessageTemplateCategory = "general" | "sales" | "payments" | "appointments" | "thanks";

export interface MessageTemplateItem {
  id: string;
  title: string;
  content: string;
  category: MessageTemplateCategory;
  color: string;
  isDefault: number;
  favorite: number;
  useCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageTemplateParams {
  title: string;
  content: string;
  category: MessageTemplateCategory;
  color: string;
}

export type SavedAppointmentLocationKind = "physical" | "virtual";

export interface SavedAppointmentLocation {
  id: string;
  name: string;
  address: string | null;
  mapUrl: string | null;
  kind: SavedAppointmentLocationKind;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedAppointmentLocationParams {
  name: string;
  address?: string;
  mapUrl?: string;
  kind?: SavedAppointmentLocationKind;
  isDefault?: boolean;
}
