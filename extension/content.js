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
  origin: '[data-test="load-origin-cell"]',
  destination: '[data-test="load-destination-cell"]',
  rate: '[data-test="load-rate-cell"] .offer',
  distance: '[data-test="load-trip-cell"]',
  pickupDate: '[data-test="load-pick-up-cell"]',
  equipment: '[data-test="load-eq-cell"]',
  weight: '[data-test="load-weight-cell"]',
  company: '[data-test="load-company-cell"]',
  phone: '[data-test="load-contact-cell"]',
};

const DETAIL_SELECTORS = {
  panel: ".expanded-detail-row",
  route: ".trip-place",
  distance: ".trip-miles",
  contact: '[data-test="contact-information-container"] a',
  comments: '[data-test="comments-container"]',
  company: '[data-test="company-details-container"]',
  equipmentDetail: '[data-test="details-container"]',
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

function getText(root, selector) {
  return normalizeText(root?.querySelector(selector)?.textContent);
}

function getTexts(root, selector) {
  return Array.from(root?.querySelectorAll(selector) ?? [])
    .map((element) => normalizeText(element?.textContent))
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

function extractPhone(value) {
  const match = normalizeText(value).match(
    /(\+?1[\s.-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/
  );

  return match ? normalizeText(match[0]) : normalizeText(value);
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
    const dateMatch = raw.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);

    if (dateMatch) {
      const month = Number(dateMatch[1]) - 1;
      const day = Number(dateMatch[2]);
      const year = dateMatch[3]
        ? Number(dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3])
        : now.getFullYear();

      baseDate = new Date(year, month, day);
    }
  }

  const timeMatch = raw.match(/\b\d{1,2}:\d{2}\s?(AM|PM)\b/i);

  return {
    pickup_date:
      baseDate && !Number.isNaN(baseDate.getTime())
        ? baseDate.toISOString().slice(0, 10)
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

  return `dat-${(hash >>> 0).toString(16)}`;
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

function extractListData(row) {
  return {
    originText: getText(row, LIST_SELECTORS.origin),
    destinationText: getText(row, LIST_SELECTORS.destination),
    rateText: getText(row, LIST_SELECTORS.rate),
    distanceText: getText(row, LIST_SELECTORS.distance),
    pickupText: getText(row, LIST_SELECTORS.pickupDate),
    equipmentText: getText(row, LIST_SELECTORS.equipment),
    weightText: getText(row, LIST_SELECTORS.weight),
    companyText: getText(row, LIST_SELECTORS.company),
    phoneText: getText(row, LIST_SELECTORS.phone),
  };
}

function extractDetailData(panel) {
  return {
    routes: getTexts(panel, DETAIL_SELECTORS.route),
    distanceText: getText(panel, DETAIL_SELECTORS.distance),
    contacts: getTexts(panel, DETAIL_SELECTORS.contact),
    comments: getText(panel, DETAIL_SELECTORS.comments),
    companyDetail: getText(panel, DETAIL_SELECTORS.company),
    equipmentDetail: getText(panel, DETAIL_SELECTORS.equipmentDetail),
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
    load?.equipment,
    load?.weight,
    load?.broker,
    load?.contact?.phone,
  ]);
}

function mergeLoadData(listData, detailData) {
  const pickup = parsePickup(listData.pickupText);
  const originText = detailData?.routes?.[0] || listData.originText;
  const destinationText = detailData?.routes?.[1] || listData.destinationText;
  const equipment = normalizeText(
    listData.equipmentText || detailData?.equipmentDetail
  );
  const phone = extractPhone(
    detailData?.contacts?.find((item) => /\d{3}.*\d{3}.*\d{4}/.test(item)) ||
      listData.phoneText
  );
  const origin = parseLocation(originText || "Unknown, NA");
  const destination = parseLocation(destinationText || "Unknown, NA");
  const notes = [
    detailData?.comments,
    detailData?.companyDetail,
    detailData?.equipmentDetail,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" | ");

  const load = {
    fingerprint: "",
    source: "dat-extension",
    origin,
    destination,
    rate: parseMoney(listData.rateText),
    distance: parseInteger(detailData?.distanceText || listData.distanceText),
    pickup_date: pickup.pickup_date,
    pickup_time: pickup.pickup_time,
    equipment,
    trailer_type: equipment || null,
    weight: parseInteger(listData.weightText),
    broker:
      normalizeText(listData.companyText || detailData?.companyDetail) || null,
    contact: {
      phone: phone || null,
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

async function waitForDatRows() {
  const startTime = Date.now();

  while (Date.now() - startTime < ROW_WAIT_TIMEOUT_MS) {
    if (!isEnabled) {
      return [];
    }

    const rows = Array.from(document.querySelectorAll(LIST_SELECTORS.row));

    if (rows.length > 0) {
      return rows;
    }

    console.log("[TransIO] Waiting for DAT rows...");
    await sleep(ROW_WAIT_STEP_MS);
  }

  return [];
}

async function collectLoadsFromPage() {
  const rows = await waitForDatRows();

  if (rows.length === 0) {
    console.log("[TransIO] No DAT rows available for scraping");
    return [];
  }

  const pageFingerprints = new Set();
  const loads = [];

  console.log(`[TransIO] Found ${rows.length} DAT rows`);

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
      source: "extension-test",
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

  console.log("[TransIO] Extension is disabled. Use the popup button to begin.");
}

void initialize();
