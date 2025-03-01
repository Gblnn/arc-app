// Create a new file for auth storage utilities

// Simple encryption/decryption functions
const ENCRYPTION_KEY = "ARC_APP_SECURE_KEY"; // In production, use a more secure key management approach

// Simple encryption function (for better security, use a proper encryption library in production)
export function encrypt(text: string): string {
  const textToChars = (text: string) =>
    text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code: number) =>
    textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
}

// Simple decryption function
export function decrypt(encoded: string): string {
  const textToChars = (text: string) =>
    text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code: number) =>
    textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

  return (
    encoded
      .match(/.{1,2}/g)
      ?.map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("") || ""
  );
}

// IndexedDB setup
const DB_NAME = "arcAuthDB";
const STORE_NAME = "authStore";
const DB_VERSION = 1;

// Open the database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

// Save auth data to IndexedDB
export async function saveAuthData(
  email: string,
  password: string,
  passwordVersion: number = 1
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Encrypt sensitive data
    const encryptedPassword = encrypt(password);

    // Store with timestamp and password version
    await store.put({
      id: "authData",
      email,
      password: encryptedPassword,
      passwordVersion,
      timestamp: new Date().getTime(),
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error saving auth data:", error);
    throw error;
  }
}

// Get auth data from IndexedDB
export async function getAuthData(): Promise<{
  email: string;
  password: string;
  passwordVersion: number;
  timestamp: number;
} | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("authData");

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          // Decrypt password
          data.password = decrypt(data.password);
          resolve(data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting auth data:", error);
    return null;
  }
}

// Clear auth data from IndexedDB
export async function clearAuthData(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete("authData");

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
}
