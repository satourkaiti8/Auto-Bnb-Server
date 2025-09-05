import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Web3 from "web3";

const app = express();
app.use(bodyParser.json());
app.use(cors()); // ✅ Allow frontend requests

// Connect to BSC RPC
const web3 = new Web3("https://bsc-dataseed.binance.org/");

// Load env vars (set these in Railway Variables tab)
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS;

// Root test route
app.get("/", (req, res) => {
  res.send("✅ Auto-BNB server is running");
});

// Auto-BNB endpoint
app.post("/send-bnb", async (req, res) => {
  console.log("✅ Request received:", req.body);

  try {
    const { recipient, amount } = req.body;

    if (!PRIVATE_KEY || !SERVER_ADDRESS) {
      console.error("❌ Server wallet not configured");
      return res.status(500).send({ error: "Server wallet not configured" });
    }

    if (!web3.utils.isAddress(recipient)) {
      console.error("❌ Invalid recipient:", recipient);
      return res.status(400).send({ error: "Invalid recipient address" });
    }

    console.log(`➡️ Sending ${amount} BNB to ${recipient}`);

    const tx = {
      from: SERVER_ADDRESS,
      to: recipient,
      value: web3.utils.toWei(amount, "ether"),
      gas: 21000,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    console.log("✅ Transaction signed");

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("✅ Transaction sent. Hash:", receipt.transactionHash);

    res.send({ success: true, txHash: receipt.transactionHash });
  } catch (err) {
    console.error("❌ Error in /send-bnb:", err.message || err);
    res.status(500).send({ error: "BNB transfer failed", details: err.message });
  }
});

// Railway dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Auto-BNB server running on port ${PORT}`);
});
