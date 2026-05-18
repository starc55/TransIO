export interface Load {
  id: string;
  referenceId: string;
  source: string;
  origin: {
    city: string;
    state: string;
    address: string;
  };
  destination: {
    city: string;
    state: string;
    address: string;
  };
  distance: number;
  rate: number;
  pickupDate: string;
  pickupTime: string;
  trailerType: "Dry Van" | "Reefer" | "Flatbed";
  weight: number;
  dimensions: string;
  broker: string;
  contact: {
    phone: string;
    email: string;
  };
  notes: string;
  tags: string[];
  status: "Available" | "Booked" | "Expired";
  receivedAt: string;
}

export interface ApiLoad {
  id: string;
  fingerprint: string;
  external_id: string | null;
  source: string | null;
  origin: {
    city?: string;
    state?: string;
    address?: string;
  } | null;
  destination: {
    city?: string;
    state?: string;
    address?: string;
  } | null;
  distance: number | null;
  rate: number | null;
  pickup_date: string | null;
  pickup_time: string | null;
  trailer_type: string | null;
  weight: number | null;
  dimensions: string | null;
  broker: string | null;
  contact: {
    phone?: string;
    email?: string;
  } | null;
  notes: string | null;
  tags: string[] | null;
  status: string | null;
  received_at: string | null;
}

function normalizeTrailerType(
  value: string | null | undefined
): Load["trailerType"] {
  if (value === "Reefer" || value === "Flatbed") {
    return value;
  }

  return "Dry Van";
}

function normalizeStatus(value: string | null | undefined): Load["status"] {
  switch (value?.toLowerCase()) {
    case "booked":
      return "Booked";
    case "expired":
      return "Expired";
    default:
      return "Available";
  }
}

function cleanText(value: string | null | undefined) {
  const text = String(value ?? "").trim();

  if (!text || /^(n\/?a|na|null|undefined)$/i.test(text)) {
    return "";
  }

  return text;
}

function cleanAddress(value: string | null | undefined) {
  const text = cleanText(value);

  if (!text || /unknown(?: address)?(?:,\s*n\/?a)?$/i.test(text)) {
    return "";
  }

  return text.replace(/,\s*n\/?a$/i, "").trim();
}

function displayReference(load: ApiLoad) {
  const raw =
    cleanText(load.external_id) || cleanText(load.fingerprint) || load.id;

  return raw.replace(/^d[a]t-/i, "load-");
}

function normalizeLocation(
  location: ApiLoad["origin"] | ApiLoad["destination"]
) {
  return {
    city: cleanText(location?.city) || "Unknown",
    state: cleanText(location?.state),
    address: cleanAddress(location?.address),
  };
}

export function formatLoadLocation(location: Load["origin"]) {
  return [cleanText(location.city) || "Unknown", cleanText(location.state)]
    .filter(Boolean)
    .join(", ");
}

export function mapApiLoadToLoad(load: ApiLoad): Load {
  return {
    id: load.fingerprint || load.id,
    referenceId: displayReference(load),
    source: load.source || "collector",
    origin: normalizeLocation(load.origin),
    destination: normalizeLocation(load.destination),
    distance: Number(load.distance || 0),
    rate: Number(load.rate || 0),
    pickupDate: load.pickup_date || new Date().toISOString().slice(0, 10),
    pickupTime: load.pickup_time || "08:00 AM",
    trailerType: normalizeTrailerType(load.trailer_type),
    weight: Number(load.weight || 0),
    dimensions: load.dimensions || "48' x 8.5' x 9'",
    broker: load.broker || "Unknown Broker",
    contact: {
      phone: load.contact?.phone || "(000) 000-0000",
      email: load.contact?.email || "dispatch@example.com",
    },
    notes: load.notes || "",
    tags: Array.isArray(load.tags) ? load.tags : [],
    status: normalizeStatus(load.status),
    receivedAt: load.received_at || new Date().toISOString(),
  };
}
