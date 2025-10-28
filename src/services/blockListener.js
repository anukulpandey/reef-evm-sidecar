import { provider } from "../config/constants.js";
import { emitAddresses } from "./pusher.js";

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

      const affected = new Set();

      for (let i = 0; i < block.transactions.length; i++) {
        const txHash = block.transactions[i];
        const tx = await provider.getTransaction(txHash);

        if (!tx) continue;

        console.log(`\n   #${i + 1}`);
        console.log(`      🧾 Tx Hash: ${tx.hash}`);
        console.log(`      👤 From: ${tx.from}`);
        console.log(`      🎯 To: ${tx.to || "Contract Creation"}`);

        affected.add(tx.from);
        if (tx.to) affected.add(tx.to);
      }

      console.log(`\n💥 Addresses / Contracts affected in this block:`);
      if (affected.size === 0) {
        console.log("   (none)");
      } else {
        for (const addr of affected) console.log(`   🔹 ${addr}`);
      }
      emitAddresses(Array.from(affected));
      console.log("\n✨ Finished processing block.");
    } catch (err) {
      console.error("❌ Error fetching block data:", err.message);
    }
  });
}
