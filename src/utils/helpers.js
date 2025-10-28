import fetch from "node-fetch";

// Wait helper
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Fetch with retry helper
export async function fetchWithRetry(url, retries = 5, delayMs = 4000) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch(url);
    if (resp.ok) return resp.json();
    console.log(`      ⏳ Waiting for Blockscout to index... (Attempt ${i + 1}/${retries})`);
    await delay(delayMs);
  }
  throw new Error(`Failed after ${retries} attempts`);
}
