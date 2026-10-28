/**
 * Specification utilities and normalizer for TRIP Mobility products.
 * Handles live Firestore CMS spec formats, ranges (e.g. "40-60km", "40-50 km/h"),
 * single numbers ("800W", "310 kg"), key aliasing, and unit formatting.
 */

export const SPEC_ALIASES: Record<string, string[]> = {
  motor: ["motor", "Motor", "Motor Power", "motor_power", "motorPower", "Rated Power", "Peak Power"],
  battery: ["battery", "Battery", "Battery specifications", "battery_specifications", "Battery Specifications", "battery_capacity"],
  range: ["range", "Range", "Max Range", "max_range", "maxRange", "Estimated Range"],
  topSpeed: ["topSpeed", "top_speed", "Top Speed", "max_speed", "Max Speed", "speed", "Speed"],
  payload: ["payload", "Payload", "Load Capacity", "load_capacity", "max_payload", "Max Payload", "Max Load"],
  weight: ["weight", "Weight", "Net Weight", "net_weight", "Total Weight"],
  chargingTime: ["chargingTime", "charging_time", "chargeTime", "charge_time", "Charging Time", "Charge Time"],
  frame: ["frame", "Frame", "Frame Material", "frame_material", "Frame material"],
  brakes: ["brakes", "Brakes", "Brake System", "brake_system", "Brakes System"],
  tires: ["tires", "Tires", "Tire Specifications", "tire_specifications", "Tire size", "Tires Specification", "Tire"],
};

export const DEFAULT_SPEC_UNITS: Record<string, string> = {
  range: "km",
  topSpeed: "km/h",
  motor: "W",
  payload: "kg",
  weight: "kg",
};

export interface ParsedSpecMetric {
  isRange: boolean;
  min: number;
  max: number;
  value: number; // Single value or upper bound
  unit: string;
  formatted: string;
}

/**
 * Extracts numeric bounds, range, and unit from strings like:
 * "40-60km", "40 - 50 km/h", "800W", "Up to 310 kg", "60"
 */
export function parseSpecMetric(rawStr: string | number | undefined | null, defaultUnit = ""): ParsedSpecMetric {
  if (rawStr === undefined || rawStr === null) {
    return { isRange: false, min: 0, max: 0, value: 0, unit: defaultUnit, formatted: "" };
  }

  const str = String(rawStr).trim();
  if (!str) {
    return { isRange: false, min: 0, max: 0, value: 0, unit: defaultUnit, formatted: "" };
  }

  // Check for range format: e.g. "40-60km", "40–60 km", "40 to 60 km/h"
  const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:-|–|—|\s+to\s+)\s*(\d+(?:\.\d+)?)\s*([a-zA-Z/%]*)/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    let unit = rangeMatch[3]?.trim() || defaultUnit;
    // If unit still missing, check end of string
    if (!unit) {
      const unitMatch = str.match(/([a-zA-Z/%]+)$/);
      if (unitMatch) unit = unitMatch[1].trim();
    }
    const cleanUnit = unit || defaultUnit;
    return {
      isRange: true,
      min: Math.min(min, max),
      max: Math.max(min, max),
      value: Math.max(min, max),
      unit: cleanUnit,
      formatted: `${Math.min(min, max)}–${Math.max(min, max)}${cleanUnit ? " " + cleanUnit : ""}`,
    };
  }

  // Single numeric value: e.g. "800W", "310 kg", "45 km/h", "Up to 310kg"
  const singleMatch = str.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z/%]*)/i);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    let unit = singleMatch[2]?.trim() || defaultUnit;
    if (!unit) {
      const unitMatch = str.match(/([a-zA-Z/%]+)$/);
      if (unitMatch) unit = unitMatch[1].trim();
    }
    const cleanUnit = unit || defaultUnit;
    return {
      isRange: false,
      min: val,
      max: val,
      value: val,
      unit: cleanUnit,
      formatted: `${val}${cleanUnit ? " " + cleanUnit : ""}`,
    };
  }

  // Non-numeric string fallback
  return {
    isRange: false,
    min: 0,
    max: 0,
    value: 0,
    unit: defaultUnit,
    formatted: str,
  };
}

/**
 * Safely looks up a specification by key or known aliases
 */
export function getSpecValue(specs: Record<string, any> | undefined | null, key: string, fallback = ""): string {
  if (!specs || typeof specs !== "object") return fallback;

  // 1. Direct match
  if (specs[key] !== undefined && specs[key] !== null && String(specs[key]).trim() !== "") {
    return String(specs[key]).trim();
  }

  // 2. Alias match
  const aliases = SPEC_ALIASES[key] || [key];
  for (const alias of aliases) {
    if (specs[alias] !== undefined && specs[alias] !== null && String(specs[alias]).trim() !== "") {
      return String(specs[alias]).trim();
    }
  }

  // 3. Normalized key search (stripping spaces, underscores, dashes, lowercased)
  const targetNormalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [k, v] of Object.entries(specs)) {
    const kNormalized = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (kNormalized === targetNormalized && v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }

  return fallback;
}

/**
 * Normalizes all specs into a standard dictionary while retaining raw custom keys
 */
export function normalizeProductSpecs(rawSpecs: Record<string, any> | undefined | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!rawSpecs || typeof rawSpecs !== "object") return result;

  // Copy raw keys first
  for (const [k, v] of Object.entries(rawSpecs)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      result[k] = String(v).trim();
    }
  }

  // Fill normalized aliases
  const coreKeys = ["motor", "battery", "range", "topSpeed", "payload", "weight", "chargingTime", "frame", "brakes", "tires"];
  for (const coreKey of coreKeys) {
    const val = getSpecValue(rawSpecs, coreKey);
    if (val) {
      result[coreKey] = val;
    }
  }

  return result;
}
