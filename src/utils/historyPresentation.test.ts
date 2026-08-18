import type { CommunicationActionEntry, InternalContact, PhoneHistoryEntry } from "../domain/models";
import { buildHistoryActionMaps, enrichHistoryWithContacts } from "./historyPresentation";

const history: PhoneHistoryEntry = {
  id: "history-1",
  phoneE164: "+51999999999",
  phoneFormatted: "+51 999 999 999",
  countryCode: "+51",
  countryIso: "PE",
  name: null,
  firstInteractionAt: "2026-08-10T10:00:00.000Z",
  lastInteractionAt: "2026-08-11T10:00:00.000Z",
  interactionCount: 2,
  favorite: 0,
  archived: 0
};

const contact: InternalContact = {
  id: "contact-1",
  phoneE164: history.phoneE164,
  phoneFormatted: "+51 999 999 999",
  countryCode: "+51",
  countryIso: "PE",
  name: "María",
  company: null,
  note: null,
  categoryId: null,
  favorite: 0,
  createdAt: "2026-08-11T11:00:00.000Z",
  updatedAt: "2026-08-11T11:00:00.000Z",
  archivedAt: null
};

describe("history presentation", () => {
  it("shows the agenda name above a matching history number", () => {
    expect(enrichHistoryWithContacts([history], [contact])[0]).toMatchObject({
      name: "María",
      phoneFormatted: "+51 999 999 999"
    });
  });

  it("does not show a stale name when the number is no longer in the agenda", () => {
    expect(enrichHistoryWithContacts([{ ...history, name: "Nombre anterior" }], [])[0].name).toBeNull();
  });

  it("keeps all action types and the most recent action", () => {
    const actions: CommunicationActionEntry[] = [
      { id: "a2", historyId: history.id, actionType: "call", createdAt: "2026-08-11T12:00:00.000Z", metadata: null },
      { id: "a1", historyId: history.id, actionType: "whatsapp", createdAt: "2026-08-11T11:00:00.000Z", metadata: null }
    ];
    expect(buildHistoryActionMaps(actions)).toEqual({
      actionTypes: { [history.id]: ["call", "whatsapp"] },
      latestActions: { [history.id]: "call" }
    });
  });
});
