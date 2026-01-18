// // import dotenv from "dotenv";
// // dotenv.config({ path: "./.env" });  // Load early

// import express from "express";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js";
// import clerkWebhook from "./routes/clerk.webhook.js";

// const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
//     credentials: true,
//   })
// );

// /**
//  * 🔥 REQUIRED FOR INNGEST (RAW BODY)
//  * MUST come before serve()
//  */
// app.use(express.raw({ type: "application/json" }));

// /**
//  * ✅ Inngest endpoint
//  * MUST come before express.json()
//  */
// app.use("/api/inngest", serve({ client: inngest, functions }));

// /**
//  * ✅ Normal JSON middleware (for rest of app)
//  */
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(cookieParser());

// /**
//  * Clerk webhook
//  */
// app.use("/api/webhooks", clerkWebhook);

// /**
//  * Test route (keep for now)
//  */
// app.get("/test-inngest", async (req, res) => {
//   await inngest.send({
//     name: "clerk/user.created",
//     data: {
//       id: "test_user_123",
//       first_name: "Test",
//       last_name: "User",
//       email_addresses: [{ email_address: "test@example.com" }],
//       image_url: "https://placehold.co/400",
//     },
//   });
//   res.json({ sent: true });
// });

// // Root
// app.get("/", (req, res) => {
//   res.json({ ok: true });
// });

// export default app;
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import clerkWebhook from "./routes/clerk.webhook.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

/**
 * 🔥 REQUIRED FOR INNGEST (RAW BODY)
 * MUST come before serve()
 */
app.use(express.raw({ type: "application/json" }));

// ✅ Inngest endpoint with explicit signing keys for Vercel reliability [web:3][web:10]

const signingKey = process.env.INNGEST_SIGNING_KEY;
const signingKeyFallback = process.env.INNGEST_SIGNING_KEY_FALLBACK;
console.log(signingKey?.startsWith('signkey-prod-'))
app.use("/api/inngest", serve({ 
  client: inngest, 
  functions,
  signingKey, // Explicit for verification
  signingKeyFallback // Prevents rotation/downtime issues [web:3]
}));

/**
 * ✅ Normal JSON middleware (for rest of app)
 */
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

/**
 * Clerk webhook
 */
app.use("/api/webhooks", clerkWebhook);

/**
 * Test route (keep for now)
 */
app.get("/test-inngest", async (req, res) => {
  await inngest.send({
    name: "clerk/user.created",
    data: {
      id: "test_user_123",
      first_name: "Test",
      last_name: "User",
      email_addresses: [{ email_address: "test@example.com" }],
      image_url: "https://placehold.co/400",
    },
  });
  res.json({ sent: true });
});

// Root
app.get("/", (req, res) => {
  res.json({ ok: true });
});

export default app;
