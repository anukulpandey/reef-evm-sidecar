import { ethers } from "ethers";
import fetch from "node-fetch";

const RPC_URL = "http://34.123.142.246:8545";
const BLOCKSCOUT_API = "http://127.0.0.1:80/api/v2/transactions";
const provider = new ethers.JsonRpcProvider(RPC_URL);

console.log("🔍 Listening for new blocks on", RPC_URL);

// Helper: wait for n milliseconds
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Helper: retry fetch until success or max attempts reached
async function fetchWithRetry(url, retries = 5, delayMs = 4000) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch(url);
    if (resp.ok) return resp.json();
    console.log(`      ⏳ Waiting for Blockscout to index... (Attempt ${i + 1}/${retries})`);
    await delay(delayMs);
  }
  throw new Error(`Failed after ${retries} attempts`);
}

provider.on("block", async (blockNumber) => {
  try {
    const block = await provider.getBlock(blockNumber);
    console.log(`\n🧱 New Block #${block.number}`);
    console.log(`   🔗 Hash: ${block.hash}`);
    console.log(`   ⛏️  Miner: ${block.miner}`);
    console.log(`   ⏰ Timestamp: ${new Date(block.timestamp * 1000).toLocaleString()}`);
    console.log(`   🔢 Tx Count: ${block.transactions.length}`);

    if (!block.transactions.length) return;

    console.log(`\n👇 Transactions Summary:`);

    for (let i = 0; i < block.transactions.length; i++) {
      const txHash = block.transactions[i];
      console.log(`\n   #${i + 1}`);
      console.log(`      🧾 Tx Hash: ${txHash}`);
      console.log(`      🌐 ${BLOCKSCOUT_API}/${txHash}`);

      try {
        const data = await fetchWithRetry(`${BLOCKSCOUT_API}/${txHash}`);

        console.log(`      👤 From: ${data.from?.hash || "N/A"}`);
        console.log(`      🎯 To: ${data.to?.hash || "Contract Creation"}`);
        console.log(`      💰 Value: ${ethers.formatEther(data.value || 0)} ETH`);
        console.log(`      ⛽ Gas Used: ${data.gas_used}`);
        console.log(`      💸 Gas Price: ${ethers.formatUnits(data.gas_price || 0, "gwei")} Gwei`);
        console.log(`      🧮 Block: ${data.block_number}`);
        console.log(`      ✅ Status: ${data.status}`);
        console.log(`      🧠 Type: ${data.type || "Legacy Tx"}`);
      } catch (e) {
        console.log(`      ⚠️ Couldn’t fetch BlockScout details: ${e.message}`);
      }
    }

    // Collect unique affected addresses/contracts
    const affected = new Set();
    for (const txHash of block.transactions) {
      try {
        const data = await fetchWithRetry(`${BLOCKSCOUT_API}/${txHash}`, 3, 3000);
        if (data.from?.hash) affected.add(data.from.hash);
        if (data.to?.hash) affected.add(data.to.hash);
      } catch {}
    }

    console.log(`\n💥 Addresses / Contracts affected in this block:`);
    if (affected.size === 0) {
      console.log("   (none)");
    } else {
      for (const addr of affected) console.log(`   🔹 ${addr}`);
    }

    console.log("\n✨ Finished processing block.");
  } catch (err) {
    console.error("❌ Error fetching block data:", err.message);
  }
});
