import { type Load } from "../data/loads";

function normalizeTrailerType(value: string): Load["trailerType"] {
  if (value === "Reefer" || value === "Flatbed") {
    return value;
  }

  return "Dry Van";
}

function normalizeLoad(raw: Record<string, unknown>): Load {
  const origin = (raw.origin as Record<string, unknown>) ?? {};
  const destination = (raw.destination as Record<string, unknown>) ?? {};
  const contact = (raw.contact as Record<string, unknown>) ?? {};

  return {
    id: String(raw.id ?? `DAT-${Date.now()}`),
    origin: {
      city: String(origin.city ?? raw.originCity ?? "Unknown"),
      state: String(origin.state ?? raw.originState ?? "NA"),
      address: String(origin.address ?? raw.originAddress ?? "Unknown address"),
    },
    destination: {
      city: String(destination.city ?? raw.destinationCity ?? "Unknown"),
      state: String(destination.state ?? raw.destinationState ?? "NA"),
      address: String(
        destination.address ?? raw.destinationAddress ?? "Unknown address"
      ),
    },
    distance: Number(raw.distance ?? 0),
    rate: Number(raw.rate ?? 0),
    pickupDate: String(raw.pickupDate ?? new Date().toISOString().slice(0, 10)),
    pickupTime: String(raw.pickupTime ?? "08:00 AM"),
    trailerType: normalizeTrailerType(String(raw.trailerType ?? "Dry Van")),
    weight: Number(raw.weight ?? 0),
    dimensions: String(raw.dimensions ?? "48' x 8.5' x 9'"),
    broker: String(raw.broker ?? "Imported Broker"),
    contact: {
      phone: String(contact.phone ?? raw.phone ?? "(000) 000-0000"),
      email: String(contact.email ?? raw.email ?? "dispatch@example.com"),
    },
    notes: String(raw.notes ?? "Imported from DAT file."),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((tag) => String(tag))
      : String(raw.tags ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    status: "Available",
  };
}

function parseJson(content: string): Load[] | null {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => normalizeLoad(item));
    }

    return [normalizeLoad(parsed)];
  } catch {
    return null;
  }
}

function parseDelimited(content: string): Load[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((row, index) => {
      const parts = row.split("|").map((value) => value.trim());

      return normalizeLoad({
        id: parts[0] || `DAT-${Date.now()}-${index}`,
        originCity: parts[1],
        originState: parts[2],
        originAddress: parts[3],
        destinationCity: parts[4],
        destinationState: parts[5],
        destinationAddress: parts[6],
        distance: parts[7],
        rate: parts[8],
        pickupDate: parts[9],
        pickupTime: parts[10],
        trailerType: parts[11],
        weight: parts[12],
        dimensions: parts[13],
        broker: parts[14],
        phone: parts[15],
        email: parts[16],
        notes: parts[17],
        tags: parts[18],
      });
    });
}

export function parseDatFile(content: string): Load[] {
  const jsonLoads = parseJson(content);
  if (jsonLoads) {
    return jsonLoads;
  }

  return parseDelimited(content);
}
