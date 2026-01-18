import express from "express";
import { inngest } from "../inngest/index.js";

const router = express.Router();

router.post(
  "/clerk",
  express.json(),
  async (req, res) => {
    try {
      const event = req.body;

      // Forward event to Inngest
      await inngest.send({
        name: `clerk/${event.type}`,
        data: event.data,
      });

      console.log("✅ Clerk event forwarded to Inngest:", event.type);

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Clerk webhook error:", error);
      res.status(500).json({ error: "Webhook failed" });
    }
  }
);

export default router;
