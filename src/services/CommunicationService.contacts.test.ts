import * as Contacts from "expo-contacts/legacy";
import { CommunicationService } from "./CommunicationService";

jest.mock("expo-contacts/legacy", () => ({
  requestPermissionsAsync: jest.fn(),
  getContactsAsync: jest.fn(),
  addContactAsync: jest.fn(),
  ContactTypes: { Person: "person" },
  Fields: { PhoneNumbers: "phoneNumbers" }
}));

const requestPermissionsAsync = Contacts.requestPermissionsAsync as jest.MockedFunction<typeof Contacts.requestPermissionsAsync>;
const getContactsAsync = Contacts.getContactsAsync as jest.MockedFunction<typeof Contacts.getContactsAsync>;
const addContactAsync = Contacts.addContactAsync as jest.MockedFunction<typeof Contacts.addContactAsync>;

describe("CommunicationService device contact export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("exports new contacts and skips phone numbers already on the device", async () => {
    requestPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
    getContactsAsync.mockResolvedValue({
      data: [{ id: "device-1", phoneNumbers: [{ label: "mobile", number: "+51 953 385 003" }] }],
      hasNextPage: false,
      hasPreviousPage: false
    } as never);
    addContactAsync.mockResolvedValue("device-2");

    const result = await CommunicationService.saveManyToDeviceContacts([
      { name: "Ya existe", phoneE164: "+51953385003" },
      { name: "Contacto nuevo", phoneE164: "+51987654321", company: "WASAPEA.ME" }
    ]);

    expect(result).toEqual({ exportedCount: 1, skippedCount: 1, failedCount: 0 });
    expect(addContactAsync).toHaveBeenCalledTimes(1);
    expect(addContactAsync).toHaveBeenCalledWith(expect.objectContaining({
      name: "Contacto nuevo",
      phoneNumbers: [{ label: "mobile", number: "+51987654321" }]
    }));
  });

  test("returns a useful error when contacts permission is denied", async () => {
    requestPermissionsAsync.mockResolvedValue({ status: "denied" } as never);

    const result = await CommunicationService.saveManyToDeviceContacts([
      { name: "Contacto", phoneE164: "+51987654321" }
    ]);

    expect(result.error).toContain("Concede el permiso");
    expect(addContactAsync).not.toHaveBeenCalled();
  });

  test("returns normalized phone numbers already stored on the device", async () => {
    requestPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
    getContactsAsync.mockResolvedValue({
      data: [
        { id: "device-1", phoneNumbers: [{ label: "mobile", number: "953 385 003" }] },
        { id: "device-2", phoneNumbers: [{ label: "mobile", number: "+51 953 385 003" }] }
      ],
      hasNextPage: false,
      hasPreviousPage: false
    } as never);

    const result = await CommunicationService.getDeviceContactPhoneNumbers("PE");

    expect(result).toEqual({ phoneNumbers: ["+51953385003"] });
  });
});
