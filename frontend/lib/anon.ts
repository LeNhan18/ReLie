const ANON_STORAGE_KEY = "anon_id";

let fallbackAnonId = "";

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const rand = Math.floor(Math.random() * 16);
    const val = ch === "x" ? rand : (rand & 0x3) | 0x8;
    return val.toString(16);
  });
}

export function peekAnonId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const existing = window.localStorage.getItem(ANON_STORAGE_KEY);
    if (existing && existing.trim().length > 0) {
      return existing;
    }
    return fallbackAnonId || null;
  } catch {
    return fallbackAnonId || null;
  }
}

export function getAnonId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const existing = window.localStorage.getItem(ANON_STORAGE_KEY);
    if (existing && existing.trim().length > 0) {
      return existing;
    }
    const created = generateUuidV4();
    window.localStorage.setItem(ANON_STORAGE_KEY, created);
    return created;
  } catch {
    if (!fallbackAnonId) {
      fallbackAnonId = generateUuidV4();
    }
    return fallbackAnonId;
  }
}

export function clearAnonId(): void {
  fallbackAnonId = "";
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(ANON_STORAGE_KEY);
  } catch {
    // Bỏ qua nếu trình duyệt chặn truy cập localStorage
  }
}

export function resetAnonId(): string {
  clearAnonId();
  return getAnonId();
}
