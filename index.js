import { ethers } from "ethers";
import fetch from "node-fetch";

const RPC_URL = "http://34.123.142.246:8545";
const BLOCKSCOUT_API = "http://localhost/api/v2/transactions";
const provider = new ethers.JsonRpcProvider(RPC_URL);

console.log("🔍 Listening for new blocks on", RPC_URL);

provider.on("block", async (blockNumber) => {
  try {
    const block = await provider.getBlock(blockNumber, true);

    console.log(`\n🧱 New Block #${block.number}`);
    console.log(`   🔗 Hash: ${block.hash}`);
    console.log(`   ⛏️  Miner: ${block.miner}`);
    console.log(`   ⏰ Timestamp: ${new Date(block.timestamp * 1000).toLocaleString()}`);
    console.log(`   🔢 Tx Count: ${block.transactions.length}`);

    if (!block.transactions.length) return;

    console.log(`\n👇 Transactions Summary:`);

    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];

      // Basic info from RPC
      console.log(`\n   #${i + 1}`);
      console.log(`      🧾 Tx Hash: ${tx.hash}`);
      console.log(`      👤 From: ${tx.from}`);
      console.log(`      🎯 To: ${tx.to}`);
      console.log(`      💰 Value: ${ethers.formatEther(tx.value || 0)} ETH`);

      // Fetch extra details from BlockScout
      try {
        const resp = await fetch(`${BLOCKSCOUT_API}/${tx.hash}`);
        if (!resp.ok) throw new Error("BlockScout fetch failed");

        const data = await resp.json();
        console.log(`      ⛽ Gas Used: ${data.gas_used}`);
        console.log(`      💸 Gas Price: ${data.gas_price}`);
        console.log(`      🧮 Block: ${data.block_number}`);
        console.log(`      ✅ Status: ${data.status}`);
      } catch (e) {
        console.log(`      ⚠️ Couldn’t fetch BlockScout details: ${e.message}`);
      }
    }

    // Collect unique affected addresses/contracts
    const affected = new Set(
      block.transactions.flatMap((t) => [t.from, t.to].filter(Boolean))
    );

    console.log(`\n💥 Addresses / Contracts affected in this block:`);
    for (const addr of affected) console.log(`   🔹 ${addr}`);

    console.log("\n✨ Finished processing block.");
  } catch (err) {
    console.error("❌ Error fetching block data:", err.message);
  }
});
