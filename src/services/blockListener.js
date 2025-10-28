import { ethers } from "ethers";
import { provider, BLOCKSCOUT_API } from "../config/constants.js";
import { fetchWithRetry } from "../utils/helpers.js";

export async function startBlockListener() {
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
}
