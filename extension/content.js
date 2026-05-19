const TEST_MODE = false;
const INGEST_ENDPOINT = "https://transio-t20l.onrender.com/ingest";
const SCRAPE_INTERVAL_MS = 30000;
const DETAIL_WAIT_MS = 1500;
const ROW_WAIT_STEP_MS = 2000;
const ROW_WAIT_TIMEOUT_MS = 30000;
const MAX_SEEN_FINGERPRINTS = 5000;

const STORAGE_KEYS = {
  enabled: "transio_enabled",
  seenFingerprints: "seen_fingerprints",
};

const LIST_SELECTORS = {
  row: ".row-cells",
  age: '[data-test="load-age-cell"]',
  origin: '[data-test="load-origin-cell"]',
  destination: '[data-test="load-destination-cell"]',
  rate: '[data-test="load-rate-cell"] .offer',
  ratePerMile: '[data-test="load-rate-cell"] .calculated-rate',
  distance: '[data-test="load-trip-cell"]',
  pickupDate: '[data-test="load-pick-up-cell"]',
  equipment: '[data-test="load-eq-cell"]',
  weight: '[data-test="load-weight-cell"]',
  length: '[data-test="load-length-cell"]',
  capacity: '[data-test="load-capacity-cell"]',
  company: '[data-test="load-company-cell"]',
  phone: '[data-test="load-contact-cell"]',
  credit: '[data-test="load-cs-dtp-cell"]',
};

const DETAIL_SELECTORS = {
  panel: ".expanded-detail-row, .details",
  distance: ".trip-miles",
  contact: '[data-test="contact-information-container"] a, dat-contacts a',
  comments: '[data-test="comments-container"] .notes-contents',
  company: '[data-test="company-details-container"]',
  equipmentDetail: 'dat-equipment [data-test="details-container"]',
  rateDetail: '[data-test="rate-details-container"]',
  marketRates: '[data-test="market-rates-detail-container"]',
};

let isScraping = false;
let isEnabled = false;
let scrapeIntervalId = null;

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanValue(value) {
  const text = normalizeText(value);

  if (!text || text === "-" || text === "\u2013" || /^n\/?a$/i.test(text)) {
    return "";
  }

  return text;
}

function getText(root, selector) {
  return normalizeText(root?.querySelector(selector)?.textContent);
}

function getFirstText(root, selectors) {
  for (const selector of selectors) {
    const value = cleanValue(root?.querySelector(selector)?.textContent);

    if (value) {
      return value;
    }
  }

  return "";
}

function getTexts(root, selector) {
  return Array.from(root?.querySelectorAll(selector) ?? [])
    .map((element) => cleanValue(element?.textContent))
    .filter(Boolean);
}

function parseMoney(value) {
  const match = normalizeText(value)
    .replace(/,/g, "")
    .match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseInteger(value) {
  const match = normalizeText(value).replace(/,/g, "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMoney(value) {
  const amount = parseMoney(value);

  if (amount === null) {
    return cleanValue(value);
  }

  return `$${amount.toLocaleString("en-US")}`;
}

function extractPhone(value) {
  const match = normalizeText(value).match(
    /(\+?1[\s.-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/
  );

  return match ? normalizeText(match[0]) : "";
}

function extractEmail(value) {
  const match = normalizeText(value).match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return match ? match[0] : "";
}

function extractWebsite(value) {
  const text = normalizeText(value).replace(/[()]/g, " ");
  const pattern =
    /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s|]*)?/gi;

  for (const match of text.matchAll(pattern)) {
    const value = match[0];
    const previousChar = match.index ? text[match.index - 1] : "";

    if (previousChar !== "@" && !/^\d+\.\d+$/.test(value)) {
      return value;
    }
  }

  return "";
}

function normalizeEquipment(value) {
  const text = cleanValue(value);
  const normalized = text.toLowerCase();

  if (!text) {
    return "";
  }

  if (normalized === "r" || normalized.includes("reefer")) {
    return "Reefer";
  }

  if (
    normalized === "v" ||
    normalized === "dv" ||
    normalized.includes("dry van") ||
    normalized === "van"
  ) {
    return "Dry Van";
  }

  if (
    normalized === "f" ||
    normalized === "fb" ||
    normalized.includes("flatbed") ||
    normalized.includes("flat bed")
  ) {
    return "Flatbed";
  }

  if (
    normalized === "po" ||
    normalized.includes("power only") ||
    normalized.includes("power-only")
  ) {
    return "Power Only";
  }

  if (normalized.includes("box truck") || normalized.includes("boxtruck")) {
    return "Box Truck";
  }

  return text;
}

function parseLocation(text) {
  const raw = normalizeText(text);

  if (!raw) {
    return {
      city: "Unknown",
      state: "",
      address: "",
    };
  }

  const [cityPart = raw, statePart = ""] = raw.split(",");

  return {
    city: normalizeText(cityPart) || raw,
    state: normalizeText(statePart.split(" ")[0]),
    address: raw,
  };
}

function extractReferenceId(value, allowLoose = false) {
  const clean = cleanValue(value);

  if (!clean) {
    return "";
  }

  const invalidWords = new Set([
    "FULL",
    "TRUCK",
    "LOAD",
    "STEP",
    "DECK",
    "EMPTY",
    "DEPOT",
    "PORTS",
    "REFERENCE",
    "COMMODITY",
  ]);
  const normalizeCandidate = (candidate) => {
    const id = cleanValue(candidate).toUpperCase();

    if (
      id.length < 4 ||
      !/\d/.test(id) ||
      invalidWords.has(id) ||
      /\s/.test(id)
    ) {
      return "";
    }

    return id;
  };
  const labeledMatch = clean.match(
    /\bReference\s*ID\b\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})\b/i
  );

  if (labeledMatch) {
    const directCandidate = normalizeCandidate(labeledMatch[1]);

    if (directCandidate) {
      return directCandidate;
    }

    const labelIndex = clean.search(/\bReference\s*ID\b/i);
    const labelTail = labelIndex === -1 ? "" : clean.slice(labelIndex, labelIndex + 120);

    for (const match of labelTail.matchAll(/\b[A-Z0-9][A-Z0-9-]{3,}\b/gi)) {
      const candidate = normalizeCandidate(match[0]);

      if (candidate) {
        return candidate;
      }
    }
  }

  if (!allowLoose) {
    return "";
  }

  for (const match of clean.matchAll(/\b[A-Z0-9][A-Z0-9-]{3,}\b/gi)) {
    const candidate = normalizeCandidate(match[0]);

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function extractMcNumber(value) {
  const match = normalizeText(value).match(/\bMC\s*#?\s*(\d{3,})\b/i);

  return match ? `MC#${match[1]}` : "";
}

function parsePickup(text) {
  const raw = normalizeText(text);

  if (!raw) {
    return {
      pickup_date: null,
      pickup_time: null,
    };
  }

  const now = new Date();
  const lower = raw.toLowerCase();
  let baseDate = null;

  if (lower.includes("today")) {
    baseDate = new Date(now);
  } else if (lower.includes("tomorrow")) {
    baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() + 1);
  } else {
    const namedDateMatch = raw.match(
      /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,\s*(\d{4}))?\b/i
    );
    const dateMatch = raw.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);

    if (namedDateMatch) {
      const monthNames = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      const monthKey = namedDateMatch[1].slice(0, 3).toLowerCase();
      const month = monthNames[monthKey];
      const day = Number(namedDateMatch[2]);
      const year = namedDateMatch[3]
        ? Number(namedDateMatch[3])
        : now.getFullYear();

      baseDate = new Date(year, month, day);
    } else if (dateMatch) {
      const month = Number(dateMatch[1]) - 1;
      const day = Number(dateMatch[2]);
      const year = dateMatch[3]
        ? Number(dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3])
        : now.getFullYear();

      baseDate = new Date(year, month, day);
    }
  }

  const timeMatch = raw.match(
    /\b\d{1,2}:?\d{2}\s?(?:AM|PM)?(?:\s?-\s?\d{1,2}:?\d{2}\s?(?:AM|PM)?)?\b/i
  );

  return {
    pickup_date:
      baseDate && !Number.isNaN(baseDate.getTime())
        ? toLocalDateString(baseDate)
        : null,
    pickup_time: timeMatch ? normalizeText(timeMatch[0].toUpperCase()) : null,
  };
}

function createFingerprint(parts) {
  const input = parts.map((part) => normalizeText(part)).join("|");
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return `load-${(hash >>> 0).toString(16)}`;
}

function normalizeSeenFingerprints(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (rawValue && typeof rawValue === "object") {
    return Object.entries(rawValue)
      .filter(([, wasSeen]) => Boolean(wasSeen))
      .map(([fingerprint]) => normalizeText(fingerprint))
      .filter(Boolean);
  }

  return [];
}

function trimFingerprints(fingerprints) {
  return fingerprints.slice(-MAX_SEEN_FINGERPRINTS);
}

function normalizeLabel(label) {
  return normalizeText(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findPairValue(pairs, labels) {
  const wanted = labels.map(normalizeLabel);
  const entry = pairs.find((item) =>
    wanted.includes(normalizeLabel(item.label))
  );
  return entry ? cleanValue(entry.value) : "";
}

function extractPairs(root, labelSelector, valueSelector) {
  const labels = Array.from(root?.querySelectorAll(labelSelector) ?? []);
  const values = Array.from(root?.querySelectorAll(valueSelector) ?? []);

  return labels
    .map((label, index) => ({
      label: normalizeText(label.textContent),
      value: cleanValue(values[index]?.textContent),
    }))
    .filter((item) => item.label || item.value);
}

function parseCredit(text) {
  const clean = normalizeText(text);
  const scoreMatch = clean.match(/\b\d+\s*CS\b/i);
  const daysMatch = clean.match(/\b\d+\s*DTP\b/i);

  return {
    creditScore: scoreMatch ? normalizeText(scoreMatch[0].toUpperCase()) : "",
    daysToPay: daysMatch ? normalizeText(daysMatch[0].toUpperCase()) : "",
  };
}

function getStorage(defaults) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(defaults, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(result);
    });
  });
}

function setStorage(values) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
}

function findDetailPanelNearRow(row) {
  let current = row?.nextElementSibling ?? null;
  let depth = 0;

  while (current && depth < 4) {
    if (current.matches?.(DETAIL_SELECTORS.panel)) {
      return current;
    }

    const nestedPanel = current.querySelector?.(DETAIL_SELECTORS.panel);

    if (nestedPanel) {
      return nestedPanel;
    }

    current = current.nextElementSibling;
    depth += 1;
  }

  return null;
}

function getListLocationText(row, selector) {
  const locationRoot = row?.querySelector(selector);

  if (!locationRoot) {
    return "";
  }

  if (selector === LIST_SELECTORS.destination) {
    return cleanValue(locationRoot.textContent);
  }

  const destinationRoot = row?.querySelector(LIST_SELECTORS.destination);
  const locationParts = Array.from(
    locationRoot.querySelectorAll(".city-state-container")
  );
  const originPart = locationParts.find((element) => element !== destinationRoot);

  if (originPart) {
    return cleanValue(originPart.textContent);
  }

  const raw = cleanValue(locationRoot.textContent);
  const destinationText = cleanValue(destinationRoot?.textContent);

  return destinationText ? cleanValue(raw.replace(destinationText, "")) : raw;
}

function getRouteLocationText(routeRoot, type) {
  if (!routeRoot) {
    return "";
  }

  if (type === "origin") {
    const detailsText = getFirstText(routeRoot, [".route-origin .city"]);

    if (detailsText) {
      return detailsText;
    }

    const listRoot = routeRoot.querySelector('[data-test="load-origin-cell"]');
    const destinationRoot = routeRoot.querySelector(
      '[data-test="load-destination-cell"]'
    );
    const cityStateRows = Array.from(
      listRoot?.querySelectorAll(".city-state-container") ?? []
    );
    const originRow =
      cityStateRows.find((element) => element !== destinationRoot) ||
      cityStateRows[0];

    return cleanValue(originRow?.textContent);
  }

  return getFirstText(routeRoot, [
    ".route-destination .city",
    '[data-test="load-destination-cell"]',
    ".route-dh-container-lg .destination",
  ]);
}

function extractListData(row) {
  return {
    ageText: getText(row, LIST_SELECTORS.age),
    originText: getListLocationText(row, LIST_SELECTORS.origin),
    destinationText: getListLocationText(row, LIST_SELECTORS.destination),
    rateText: getText(row, LIST_SELECTORS.rate),
    ratePerMileText: getText(row, LIST_SELECTORS.ratePerMile),
    distanceText: getText(row, LIST_SELECTORS.distance),
    pickupText: getText(row, LIST_SELECTORS.pickupDate),
    equipmentText: getText(row, LIST_SELECTORS.equipment),
    weightText: getText(row, LIST_SELECTORS.weight),
    lengthText: getText(row, LIST_SELECTORS.length),
    capacityText: getText(row, LIST_SELECTORS.capacity),
    companyText: getText(row, LIST_SELECTORS.company),
    phoneText: getText(row, LIST_SELECTORS.phone),
    creditText: getText(row, LIST_SELECTORS.credit),
  };
}

function extractRouteDetails(panel) {
  const routeRoot = panel?.querySelector("dat-route") ?? panel;
  const originText = getRouteLocationText(routeRoot, "origin");
  const destinationText = getRouteLocationText(routeRoot, "destination");
  const originDateText = getFirstText(routeRoot, [
    ".route-origin .date",
    '[data-test="load-pick-up-cell"]',
  ]);
  const destinationDateText = getFirstText(routeRoot, [".route-destination .date"]);

  return {
    originText,
    destinationText,
    originDateText,
    originTimeText: getFirstText(routeRoot, [".route-origin .hours"]),
    destinationDateText,
    destinationTimeText: getFirstText(routeRoot, [".route-destination .hours"]),
    distanceText: getFirstText(routeRoot, [".trip-miles", '[data-test="load-trip-cell"]']),
  };
}

function extractEquipmentDetails(panel) {
  const equipmentRoot = panel?.querySelector(DETAIL_SELECTORS.equipmentDetail);
  const pairs = extractPairs(
    equipmentRoot,
    ".equipment-label .data-label",
    ".equipment-data .data-item"
  );
  const equipmentText = normalizeText(equipmentRoot?.textContent);
  const referencePairValue = findPairValue(pairs, [
    "Reference ID",
    "Reference",
  ]);

  return {
    loadType: findPairValue(pairs, ["Load"]),
    truck: findPairValue(pairs, ["Truck"]),
    length: findPairValue(pairs, ["Length"]),
    weight: findPairValue(pairs, ["Weight"]),
    commodity: findPairValue(pairs, ["Commodity"]),
    referenceId:
      extractReferenceId(referencePairValue, true) ||
      extractReferenceId(equipmentText),
  };
}

function extractRateDetails(panel) {
  const rateRoot = panel?.querySelector(DETAIL_SELECTORS.rateDetail);
  const pairs = extractPairs(
    rateRoot,
    ".rate-detail-label .data-label",
    ".rate-data .data-item, .rate-data .data-item-total, .rate-data .data-item-ratemiles"
  );

  return {
    totalText:
      getFirstText(rateRoot, [".data-item-total"]) ||
      findPairValue(pairs, ["Total"]),
    tripText: findPairValue(pairs, ["Trip"]),
    ratePerMileText:
      getFirstText(rateRoot, [".data-item-ratemiles"]) ||
      findPairValue(pairs, ["Rate / mile", "Rate per mile"]),
  };
}

function extractMarketRates(panel) {
  const marketRoot = panel?.querySelector(DETAIL_SELECTORS.marketRates);
  const spotRoot = marketRoot?.querySelector(".spot") ?? marketRoot;
  const rangeText = getFirstText(spotRoot, [".range-data"]);
  const rangeMatches = rangeText.match(/\$[\d,]+(?:\.\d+)?/g) || [];
  const perMileMatches = rangeText.match(/\$\d+(?:\.\d+)?\/mi/g) || [];

  if (!marketRoot) {
    return {};
  }

  return {
    spotRateText: getFirstText(spotRoot, [".rate-data"]),
    spotRatePerMileText: getFirstText(spotRoot, [".rate-permile"]),
    spotAverageText: getFirstText(spotRoot, [".miles-day-average"]),
    rangeText,
    rangeLowText: rangeMatches[0] || "",
    rangeHighText: rangeMatches[1] || "",
    rangePerMileLowText: perMileMatches[0] || "",
    rangePerMileHighText: perMileMatches[1] || "",
    contractUnavailable: /contract rates are not available/i.test(
      normalizeText(marketRoot.textContent)
    ),
  };
}

function extractCompanyDetails(panel) {
  const companyRoot = panel?.querySelector(DETAIL_SELECTORS.company);
  const companyText = normalizeText(companyRoot?.textContent);
  const phoneText = getFirstText(companyRoot, ['a[href^="tel:"]']);
  const reviews = getFirstText(companyRoot, [".reviews"]);

  if (!companyRoot) {
    const panelText = normalizeText(panel?.textContent);

    return {
      mcNumber: extractMcNumber(panelText),
    };
  }

  return {
    name: getFirstText(companyRoot, [".company-details", '[data-test="load-company-cell"]']),
    phone: extractPhone(phoneText),
    mcNumber:
      extractMcNumber(companyText) || extractMcNumber(panel?.textContent),
    location: getFirstText(companyRoot, [".light-text"]),
    factoringEligible: /factoring eligible/i.test(companyText),
    rating: companyRoot.querySelectorAll('[data-mat-icon-name="star-dark"]').length || null,
    reviews: reviews ? reviews.replace(/[()]/g, "") : "",
  };
}

function extractDetailData(panel) {
  const route = extractRouteDetails(panel);
  const equipment = extractEquipmentDetails(panel);
  const rate = extractRateDetails(panel);
  const marketRates = extractMarketRates(panel);
  const company = extractCompanyDetails(panel);
  const comments = getText(panel, DETAIL_SELECTORS.comments);
  const contacts = getTexts(panel, DETAIL_SELECTORS.contact);
  const contactText = contacts.join(" | ");
  const combinedText = [comments, contactText, normalizeText(panel?.textContent)]
    .filter(Boolean)
    .join(" | ");

  return {
    route,
    equipment,
    rate,
    marketRates,
    company,
    contacts,
    comments,
    rawText: normalizeText(panel?.textContent),
    phoneText:
      contacts.find((item) => /\d{3}.*\d{3}.*\d{4}/.test(item)) ||
      company.phone ||
      "",
    email: extractEmail(combinedText),
    website: extractWebsite(combinedText),
  };
}

function ensureFingerprint(load) {
  if (normalizeText(load?.fingerprint)) {
    return load.fingerprint;
  }

  return createFingerprint([
    load?.origin?.address,
    load?.destination?.address,
    load?.rate,
    load?.distance,
    load?.pickup_date,
    load?.pickup_time,
    load?.trailer_type,
    load?.weight,
    load?.broker,
    load?.contact?.phone,
    load?.external_id,
  ]);
}

function mergeLoadData(listData, detailData) {
  const route = detailData?.route || {};
  const equipmentDetails = detailData?.equipment || {};
  const rateDetails = detailData?.rate || {};
  const companyDetails = detailData?.company || {};
  const listCredit = parseCredit(listData.creditText);
  const pickup = parsePickup(
    [route.originDateText, route.originTimeText, listData.pickupText]
      .map(cleanValue)
      .filter(Boolean)
      .join(" ")
  );
  const originText = route.originText || listData.originText;
  const destinationText = route.destinationText || listData.destinationText;
  const trailerType = normalizeEquipment(
    equipmentDetails.truck || listData.equipmentText
  );
  const ratePerMileText = cleanValue(
    rateDetails.ratePerMileText || listData.ratePerMileText
  );
  const phone = extractPhone(detailData?.phoneText) || extractPhone(listData.phoneText);
  const origin = parseLocation(originText || "Unknown");
  const destination = parseLocation(destinationText || "Unknown");

  origin.date = route.originDateText || null;
  origin.time = route.originTimeText || null;
  destination.date = route.destinationDateText || null;
  destination.time = route.destinationTimeText || null;

  const notes = [detailData?.comments]
    .map(normalizeText)
    .filter(Boolean)
    .join(" | ");
  const externalId =
    extractReferenceId(equipmentDetails.referenceId) ||
    extractReferenceId(detailData?.rawText) ||
    "";
  const lengthText = cleanValue(equipmentDetails.length || listData.lengthText);
  const capacityText = cleanValue(equipmentDetails.loadType || listData.capacityText);
  const commodityText = cleanValue(equipmentDetails.commodity);
  const weightText = cleanValue(equipmentDetails.weight || listData.weightText);
  const distanceText = cleanValue(
    route.distanceText || rateDetails.tripText || listData.distanceText
  );
  const marketRates = detailData?.marketRates || {};
  const email = detailData?.email || extractEmail(notes);
  const website = detailData?.website || "";
  const creditScore = companyDetails.creditScore || listCredit.creditScore;
  const daysToPay = companyDetails.daysToPay || listCredit.daysToPay;

  const load = {
    fingerprint: "",
    external_id: externalId || null,
    source: "collector",
    origin,
    destination,
    rate: parseMoney(rateDetails.totalText || listData.rateText),
    distance: parseInteger(distanceText),
    pickup_date: pickup.pickup_date,
    pickup_time: pickup.pickup_time || route.originTimeText || null,
    equipment: trailerType || null,
    trailer_type: trailerType || null,
    weight: parseInteger(weightText),
    dimensions: null,
    broker:
      cleanValue(companyDetails.name || listData.companyText) || null,
    contact: {
      phone: phone || null,
      email: email || null,
      website: website || null,
      mcNumber: companyDetails.mcNumber || null,
      companyLocation: companyDetails.location || null,
      factoringEligible: Boolean(companyDetails.factoringEligible),
      rating: companyDetails.rating || null,
      reviews: companyDetails.reviews || null,
      creditScore: creditScore || null,
      daysToPay: daysToPay || null,
      age: cleanValue(listData.ageText) || null,
      ratePerMile: parseMoney(ratePerMileText),
      ratePerMileText: ratePerMileText || null,
      loadType: capacityText || null,
      length: lengthText || null,
      capacity: capacityText || null,
      commodity: commodityText || null,
      referenceId: externalId || null,
      marketRates: {
        spotRate: parseMoney(marketRates.spotRateText),
        spotRateText: formatMoney(marketRates.spotRateText),
        spotRatePerMile: parseMoney(marketRates.spotRatePerMileText),
        spotRatePerMileText: cleanValue(marketRates.spotRatePerMileText),
        spotAverageText: cleanValue(marketRates.spotAverageText),
        rangeText: cleanValue(marketRates.rangeText),
        rangeLowText: cleanValue(marketRates.rangeLowText),
        rangeHighText: cleanValue(marketRates.rangeHighText),
        rangePerMileLowText: cleanValue(marketRates.rangePerMileLowText),
        rangePerMileHighText: cleanValue(marketRates.rangePerMileHighText),
        contractUnavailable: Boolean(marketRates.contractUnavailable),
      },
    },
    notes: notes || null,
    received_at: new Date().toISOString(),
  };

  load.fingerprint = ensureFingerprint(load);
  return load;
}

async function clickRowAndReadDetails(row) {
  row?.scrollIntoView?.({
    block: "center",
    inline: "nearest",
    behavior: "smooth",
  });

  await sleep(250);
  row?.click?.();
  await sleep(DETAIL_WAIT_MS);

  const panel = findDetailPanelNearRow(row);

  if (!panel) {
    return null;
  }

  return extractDetailData(panel);
}

async function waitForLoadRows() {
  const startTime = Date.now();

  while (Date.now() - startTime < ROW_WAIT_TIMEOUT_MS) {
    if (!isEnabled) {
      return [];
    }

    const rows = Array.from(document.querySelectorAll(LIST_SELECTORS.row));

    if (rows.length > 0) {
      return rows;
    }

    console.log("[TransIO] Waiting for load rows...");
    await sleep(ROW_WAIT_STEP_MS);
  }

  return [];
}

async function collectLoadsFromPage() {
  const rows = await waitForLoadRows();

  if (rows.length === 0) {
    console.log("[TransIO] No load rows available for scraping");
    return [];
  }

  const pageFingerprints = new Set();
  const loads = [];

  console.log(`[TransIO] Found ${rows.length} load rows`);

  for (const [index, row] of rows.entries()) {
    if (!isEnabled) {
      console.log("[TransIO] Scrape stopped because extension was disabled");
      break;
    }

    try {
      const listData = extractListData(row);

      if (!listData.originText && !listData.destinationText) {
        continue;
      }

      console.log(`[TransIO] Scraping row ${index + 1}/${rows.length}`);

      const detailData = await clickRowAndReadDetails(row);
      const load = mergeLoadData(listData, detailData);
      const fingerprint = ensureFingerprint(load);

      if (!fingerprint || pageFingerprints.has(fingerprint)) {
        continue;
      }

      load.fingerprint = fingerprint;
      pageFingerprints.add(fingerprint);
      loads.push(load);
    } catch (error) {
      console.error(`[TransIO] Row ${index + 1} failed`, error);
    }
  }

  return loads;
}

function buildFakeLoads() {
  return [
    {
      fingerprint: "fake-test-1",
      source: "collector-test",
      origin: {
        city: "Chicago",
        state: "IL",
        address: "Chicago, IL",
      },
      destination: {
        city: "Dallas",
        state: "TX",
        address: "Dallas, TX",
      },
      rate: 2500,
      distance: 950,
      pickup_date: "2026-04-29",
      pickup_time: "08:00 AM",
      equipment: "Dry Van",
      trailer_type: "Dry Van",
      weight: 42000,
      broker: "Test Broker",
      contact: {
        phone: "(555) 123-4567",
      },
      notes: "FAKE TEST LOAD",
      received_at: new Date().toISOString(),
    },
  ];
}

async function getNewLoads(loads) {
  const storage = await getStorage({
    [STORAGE_KEYS.seenFingerprints]: [],
  });
  const storedFingerprints = normalizeSeenFingerprints(
    storage[STORAGE_KEYS.seenFingerprints]
  );
  const seenSet = new Set(storedFingerprints);
  const nextFingerprints = [...storedFingerprints];
  const newLoads = [];

  for (const load of loads) {
    const fingerprint = ensureFingerprint(load);

    if (!fingerprint || seenSet.has(fingerprint)) {
      continue;
    }

    load.fingerprint = fingerprint;
    seenSet.add(fingerprint);
    nextFingerprints.push(fingerprint);
    newLoads.push(load);
  }

  if (newLoads.length > 0) {
    await setStorage({
      [STORAGE_KEYS.seenFingerprints]: trimFingerprints(nextFingerprints),
    });
  }

  return newLoads;
}

async function sendLoadsToBackend(loads) {
  if (loads.length === 0) {
    console.log("[TransIO] No new loads to send");
    return null;
  }

  const response = await fetch(INGEST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loads }),
  });

  const responseText = await response.text();
  let responseBody = responseText;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    responseBody = responseText;
  }

  console.log("[TransIO] Response status:", response.status);
  console.log("[TransIO] Response body:", responseBody);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return responseBody;
}

async function scrapeAndSend() {
  if (!isEnabled) {
    return;
  }

  if (isScraping) {
    console.log("[TransIO] Scrape skipped because another run is active");
    return;
  }

  isScraping = true;

  try {
    const loads = TEST_MODE ? buildFakeLoads() : await collectLoadsFromPage();
    const newLoads = await getNewLoads(loads);

    if (newLoads.length === 0) {
      console.log("[TransIO] No new loads found");
      return;
    }

    console.log(`[TransIO] Sending ${newLoads.length} new load(s)`);
    await sendLoadsToBackend(newLoads);
  } catch (error) {
    console.error("[TransIO] Scrape cycle failed", error);
  } finally {
    isScraping = false;
  }
}

function stopScrapeLoop() {
  if (scrapeIntervalId !== null) {
    window.clearInterval(scrapeIntervalId);
    scrapeIntervalId = null;
  }
}

function startScrapeLoop() {
  stopScrapeLoop();

  if (!isEnabled) {
    return;
  }

  void scrapeAndSend();

  scrapeIntervalId = window.setInterval(() => {
    void scrapeAndSend();
  }, SCRAPE_INTERVAL_MS);
}

async function enableTransio() {
  if (isEnabled) {
    return;
  }

  isEnabled = true;
  await setStorage({
    [STORAGE_KEYS.enabled]: true,
  });
  console.log("[TransIO] Extension enabled");
  startScrapeLoop();
}

async function disableTransio() {
  if (!isEnabled) {
    return;
  }

  isEnabled = false;
  stopScrapeLoop();
  await setStorage({
    [STORAGE_KEYS.enabled]: false,
  });
  console.log("[TransIO] Extension disabled");
}

function applyEnabledState(nextEnabled) {
  if (nextEnabled === isEnabled) {
    return;
  }

  isEnabled = nextEnabled;

  if (isEnabled) {
    console.log("[TransIO] Extension enabled");
    startScrapeLoop();
    return;
  }

  console.log("[TransIO] Extension disabled");
  stopScrapeLoop();
}

async function initialize() {
  const storage = await getStorage({
    [STORAGE_KEYS.enabled]: false,
    [STORAGE_KEYS.seenFingerprints]: [],
  });

  isEnabled = Boolean(storage[STORAGE_KEYS.enabled]);

  if (!Array.isArray(storage[STORAGE_KEYS.seenFingerprints])) {
    await setStorage({
      [STORAGE_KEYS.seenFingerprints]: trimFingerprints(
        normalizeSeenFingerprints(storage[STORAGE_KEYS.seenFingerprints])
      ),
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEYS.enabled]) {
      return;
    }

    applyEnabledState(Boolean(changes[STORAGE_KEYS.enabled].newValue));
  });

  if (isEnabled) {
    console.log("[TransIO] Extension is enabled, starting scrape loop");
    startScrapeLoop();
    return;
  }

  console.log(
    "[TransIO] Extension is disabled. Use the popup button to begin."
  );
}

void initialize();
