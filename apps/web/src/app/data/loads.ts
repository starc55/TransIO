export interface Load {
  id: string;
  referenceId: string;
  source: string;
  origin: {
    city: string;
    state: string;
    address: string;
    date?: string | null;
    time?: string | null;
  };
  destination: {
    city: string;
    state: string;
    address: string;
    date?: string | null;
    time?: string | null;
  };
  distance: number;
  rate: number;
  pickupDate: string;
  pickupTime: string;
  trailerType:
    | "Dry Van"
    | "Reefer"
    | "Flatbed"
    | "Power Only"
    | "Box Truck"
    | "Other";
  weight: number;
  dimensions: string;
  loadType: string;
  length: string;
  capacity: string;
  commodity: string;
  ratePerMile: number;
  broker: string;
  contact: {
    phone: string;
    email: string;
    website: string;
    mcNumber: string;
    companyLocation: string;
    factoringEligible: boolean;
    rating: number | null;
    reviews: string;
    creditScore: string;
    daysToPay: string;
    age: string;
    ratePerMileText: string;
    marketRates: {
      spotRate: number | null;
      spotRateText: string;
      spotRatePerMile: number | null;
      spotRatePerMileText: string;
      spotAverageText: string;
      rangeText: string;
      rangeLowText: string;
      rangeHighText: string;
      rangePerMileLowText: string;
      rangePerMileHighText: string;
      contractUnavailable: boolean;
    };
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
    date?: string | null;
    time?: string | null;
  } | null;
  destination: {
    city?: string;
    state?: string;
    address?: string;
    date?: string | null;
    time?: string | null;
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
    website?: string;
    mcNumber?: string;
    companyLocation?: string;
    factoringEligible?: boolean;
    rating?: number | null;
    reviews?: string | number | null;
    creditScore?: string;
    daysToPay?: string;
    age?: string;
    ratePerMile?: number | null;
    ratePerMileText?: string;
    loadType?: string;
    length?: string;
    capacity?: string;
    commodity?: string;
    referenceId?: string;
    marketRates?: {
      spotRate?: number | null;
      spotRateText?: string;
      spotRatePerMile?: number | null;
      spotRatePerMileText?: string;
      spotAverageText?: string;
      rangeText?: string;
      rangeLowText?: string;
      rangeHighText?: string;
      rangePerMileLowText?: string;
      rangePerMileHighText?: string;
      contractUnavailable?: boolean;
    };
  } | null;
  notes: string | null;
  tags: string[] | null;
  status: string | null;
  received_at: string | null;
}

function normalizeTrailerType(
  value: string | null | undefined
): Load["trailerType"] {
  const normalized = cleanText(value).toLowerCase();

  switch (normalized) {
    case "reefer":
    case "refrigerated":
      return "Reefer";
    case "flatbed":
    case "flat bed":
      return "Flatbed";
    case "power only":
    case "power-only":
      return "Power Only";
    case "box truck":
    case "boxtruck":
      return "Box Truck";
    case "other":
      return "Other";
    case "dry van":
    case "van":
    default:
      return "Dry Van";
  }
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
    cleanText(load.external_id) ||
    cleanText(load.contact?.referenceId) ||
    cleanText(load.fingerprint) ||
    load.id;

  return raw.replace(/^d[a]t-/i, "load-");
}

function normalizeLocation(
  location: ApiLoad["origin"] | ApiLoad["destination"]
) {
  return {
    city: cleanText(location?.city) || "Unknown",
    state: cleanText(location?.state),
    address: cleanAddress(location?.address),
    date: cleanText(location?.date) || null,
    time: cleanText(location?.time) || null,
  };
}

function normalizeMarketRates(contact: ApiLoad["contact"]) {
  const marketRates = contact?.marketRates || {};

  return {
    spotRate:
      typeof marketRates.spotRate === "number" ? marketRates.spotRate : null,
    spotRateText: cleanText(marketRates.spotRateText),
    spotRatePerMile:
      typeof marketRates.spotRatePerMile === "number"
        ? marketRates.spotRatePerMile
        : null,
    spotRatePerMileText: cleanText(marketRates.spotRatePerMileText),
    spotAverageText: cleanText(marketRates.spotAverageText),
    rangeText: cleanText(marketRates.rangeText),
    rangeLowText: cleanText(marketRates.rangeLowText),
    rangeHighText: cleanText(marketRates.rangeHighText),
    rangePerMileLowText: cleanText(marketRates.rangePerMileLowText),
    rangePerMileHighText: cleanText(marketRates.rangePerMileHighText),
    contractUnavailable: Boolean(marketRates.contractUnavailable),
  };
}

export function formatLoadLocation(location: Load["origin"]) {
  return [cleanText(location.city) || "Unknown", cleanText(location.state)]
    .filter(Boolean)
    .join(", ");
}

export function mapApiLoadToLoad(load: ApiLoad): Load {
  const distance = Number(load.distance || 0);
  const rate = Number(load.rate || 0);
  const calculatedRatePerMile = distance > 0 ? rate / distance : 0;
  const ratePerMile =
    typeof load.contact?.ratePerMile === "number"
      ? load.contact.ratePerMile
      : calculatedRatePerMile;

  return {
    id: load.fingerprint || load.id,
    referenceId: displayReference(load),
    source: load.source || "collector",
    origin: normalizeLocation(load.origin),
    destination: normalizeLocation(load.destination),
    distance,
    rate,
    pickupDate: load.pickup_date || new Date().toISOString().slice(0, 10),
    pickupTime: load.pickup_time || "08:00 AM",
    trailerType: normalizeTrailerType(load.trailer_type),
    weight: Number(load.weight || 0),
    dimensions: load.dimensions || "",
    loadType: cleanText(load.contact?.loadType),
    length: cleanText(load.contact?.length),
    capacity: cleanText(load.contact?.capacity),
    commodity: cleanText(load.contact?.commodity),
    ratePerMile,
    broker: load.broker || "Unknown Broker",
    contact: {
      phone: load.contact?.phone || "(000) 000-0000",
      email: cleanText(load.contact?.email),
      website: cleanText(load.contact?.website),
      mcNumber: cleanText(load.contact?.mcNumber),
      companyLocation: cleanText(load.contact?.companyLocation),
      factoringEligible: Boolean(load.contact?.factoringEligible),
      rating:
        typeof load.contact?.rating === "number" ? load.contact.rating : null,
      reviews: cleanText(String(load.contact?.reviews ?? "")),
      creditScore: cleanText(load.contact?.creditScore),
      daysToPay: cleanText(load.contact?.daysToPay),
      age: cleanText(load.contact?.age),
      ratePerMileText: cleanText(load.contact?.ratePerMileText),
      marketRates: normalizeMarketRates(load.contact),
    },
    notes: load.notes || "",
    tags: Array.isArray(load.tags) ? load.tags : [],
    status: normalizeStatus(load.status),
    receivedAt: load.received_at || new Date().toISOString(),
  };
}
