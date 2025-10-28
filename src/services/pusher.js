import Pusher from "pusher";
import dotenv from "dotenv";
dotenv.config();

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

export const emitAddresses = async (addresses) => {
  if (!addresses || !addresses.length) return;

  await pusher.trigger("block-events", "addresses", {
    addresses
  });

  console.log("🚀 Emitted addresses to Pusher:", addresses);
};
