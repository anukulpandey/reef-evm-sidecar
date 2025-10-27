import { ethers } from "ethers";
import fetch from "node-fetch";

const RPC_URL = "http://34.123.142.246:8545";
const BLOCKSCOUT_API = "http://127.0.0.1:80/api/v2/transactions";
const provider = new ethers.JsonRpcProvider(RPC_URL);

console.log("🔍 Listening for new blocks on", RPC_URL);

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
      console.log(`      🧾 Blockscout Tx URL: ${BLOCKSCOUT_API}/${txHash}`);

      try {
        // Fetch from BlockScout
        const resp = await fetch(`${BLOCKSCOUT_API}/${txHash}`);
        if (!resp.ok) throw new Error(`BlockScout fetch failed (${resp.status})`);

        const data = await resp.json();

        // Pretty print some main details
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
        const resp = await fetch(`${BLOCKSCOUT_API}/${txHash}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.from?.hash) affected.add(data.from.hash);
          if (data.to?.hash) affected.add(data.to.hash);
        }
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
