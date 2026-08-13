// cryptoUtil.js
// AES-GCM + PBKDF2 (SHA-256). Stores: base64( salt[16] || iv[12] || ciphertext )
const ITERATIONS = 250_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// --- helpers ---
const enc = new TextEncoder();
const dec = new TextDecoder();

function concatUint8(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function toBase64(u8) {
  // Browser-safe Base64 (no URL-safe transform since it goes into localStorage)
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary);
}

function fromBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(passphrase, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: ITERATIONS,
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// --- core APIs you’ll use ---
/**
 * Encrypt arbitrary plaintext (e.g., your token) with a passphrase.
 * Returns a compact base64 string bundling salt+iv+ciphertext.
 */
export async function encryptAES(plaintext, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plaintext)
    )
  );

  return toBase64(concatUint8(salt, iv, ciphertext));
}

/**
 * Decrypt a base64 payload produced by encryptAES with the same passphrase.
 */
export async function decryptAES(payloadBase64, passphrase) {
  const bundled = fromBase64(payloadBase64);
  const salt = bundled.slice(0, SALT_BYTES);
  const iv = bundled.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const ciphertext = bundled.slice(SALT_BYTES + IV_BYTES);

  const key = await deriveKey(passphrase, salt);
  const plaintextBytes = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
  );
  console.log(`Decrypted Token: ${dec.decode(plaintextBytes)}`);

  return dec.decode(plaintextBytes);
}

// --- convenient localStorage wrappers ---
/**
 * Encrypts and stores a token in localStorage.
 */
export async function setEncryptedToken(storageKey, token, passphrase) {
  const payload = await encryptAES(token, passphrase);
  localStorage.setItem(storageKey, payload);
}

/**
 * Reads and decrypts a token from localStorage.
 * Returns null if missing or decryption fails (bad passphrase / corrupted data).
 */
export async function getDecryptedToken(storageKey, passphrase) {
  const payload = localStorage.getItem(storageKey);
  if (!payload) return null;
  try {
    return await decryptAES(payload, passphrase);
  } catch {
    return null;
  }
}
