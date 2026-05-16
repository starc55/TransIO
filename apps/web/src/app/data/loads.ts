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

export function mapApiLoadToLoad(load: ApiLoad): Load {
  return {
    id: load.fingerprint || load.id,
    referenceId: load.external_id || load.fingerprint || load.id,
    source: load.source || "dat-extension",
    origin: {
      city: load.origin?.city || "Unknown",
      state: load.origin?.state || "NA",
      address: load.origin?.address || "Unknown address",
    },
    destination: {
      city: load.destination?.city || "Unknown",
      state: load.destination?.state || "NA",
      address: load.destination?.address || "Unknown address",
    },
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
