import { ethers } from "ethers";

export const RPC_URL = "http://127.0.0.1:8545";
export const BLOCKSCOUT_API = "http://127.0.0.1:80/api/v2/transactions";

export const provider = new ethers.JsonRpcProvider(RPC_URL);

console.log("🔍 Listening for new blocks on", RPC_URL);
