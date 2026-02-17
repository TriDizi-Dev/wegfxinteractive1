const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const helmet = require("helmet");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Environment Variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_VERSION = 1;
const SUCCESS_URL = process.env.SUCCESS_URL;
const FAILURE_URL = process.env.FAILURE_URL;

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// ------------------- TOKEN FUNCTION -------------------
const getAccessToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_version", CLIENT_VERSION);
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "client_credentials");

    const response = await axios.post(
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching token:",
      error.response?.data || error.message
    );
    throw new Error("Unable to fetch access token");
  }
};

// ------------------- INITIATE PAYMENT -------------------
app.post("/initiate-payment", async (req, res) => {
  try {
    const { userId, amount, mobile, plan } = req.body;

    if (!userId || !amount || !mobile || !plan) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    const merchantOrderId = `TXN_${Date.now()}`;
    // const redirectUrlWithPlan = `https://api.think.wegfx.com/payment-status?merchantOrderId=${merchantOrderId}&plan=${plan}&details=false`;
    const redirectUrlWithPlan = `https://wegfxinteractive.onrender.com/payment-status?merchantOrderId=${merchantOrderId}&plan=${plan}&details=false`;

    const payload = {
      merchantOrderId,
      amount: amount * 100,
      metaInfo: {
        udf1: "additional-information-1",
        udf2: "additional-information-2",
        udf3: "additional-information-3",
        udf4: "additional-information-4",
        udf5: "additional-information-5",
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: `Payment for user ${userId} - Plan: ${plan}`,
        merchantUrls: {
          redirectUrl: redirectUrlWithPlan,
        },
      },
      paymentModeConfig: {
        enabledPaymentModes: [
          {
            type: "UPI_INTENT",
          },
          {
            type: "UPI_COLLECT",
          },
          {
            type: "UPI_QR",
          },
          {
            type: "NET_BANKING",
          },
          {
            type: "CARD",
            cardTypes: ["DEBIT_CARD", "CREDIT_CARD"],
          },
        ],
        disabledPaymentModes: [
          {
            type: "UPI_INTENT",
          },
          {
            type: "UPI_COLLECT",
          },
          {
            type: "UPI_QR",
          },
          {
            type: "NET_BANKING",
          },
          {
            type: "CARD",
            cardTypes: ["DEBIT_CARD", "CREDIT_CARD"],
          },
        ],
      },
    };

    const token = await getAccessToken();

    const response = await axios.post(
      "https://api.phonepe.com/apis/pg/checkout/v2/pay",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      }
    );

    const redirectUrl =
      response.data?.data?.redirectUrl ||
      response.data?.data?.instrumentResponse?.redirectInfo?.url ||
      response.data?.redirectUrl;

    if (!redirectUrl) {
      return res.status(500).json({
        error: "Missing redirect URL",
        details: response.data,
      });
    }

    return res.status(200).json({ route: redirectUrl, success: true });
  } catch (error) {
    console.error("Payment Init Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Payment initiation failed.",
      details: error.response?.data || error.message,
    });
  }
});

// ------------------- PAYMENT STATUS (Polling) -------------------
app.get("/payment-status", async (req, res) => {
  const { merchantOrderId, plan } = req.query;

  if (!merchantOrderId || !plan) {
    return res.status(400).json({ error: "Missing merchantOrderId or plan" });
  }

  try {
    const token = await getAccessToken();
    let attempts = 0;
    const maxAttempts = 10;
    const delayMs = 1000;

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `O-Bearer ${token}`,
          },
        }
      );

      const paymentStatus = response.data?.state;

      if (paymentStatus === "COMPLETED") {
        return res.redirect(`${SUCCESS_URL}?status=success&plan=${plan}`);
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
        return res.redirect(`${FAILURE_URL}`);
      } else if (paymentStatus === "PENDING") {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
    }

    return res
      .status(202)
      .json({ status: "PENDING", message: "Payment still processing" });
  } catch (error) {
    console.error(
      "Payment status error:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Unable to fetch payment status" });
  }
});

// ------------------- WEBHOOK ROUTE -------------------
app.post("/phonepe-webhook", (req, res) => {
  const webhookData = req.body;

  console.log("📩 Webhook Received:", JSON.stringify(webhookData, null, 2));

  const {
    merchantId,
    merchantTransactionId,
    transactionId,
    state,
    amount,
    message,
  } = webhookData;

  // 👉 TODO: Update order in your DB using merchantTransactionId
  // Example: mark order as COMPLETED or FAILED based on `state`

  if (state === "COMPLETED") {
    console.log(`✅ Payment SUCCESS: Order ID ${merchantTransactionId}`);
    // Update your database: payment success
  } else if (state === "FAILED" || state === "CANCELLED") {
    console.log(
      `❌ Payment FAILED/CANCELLED: Order ID ${merchantTransactionId}`
    );
    // Update your database: payment failed
  } else {
    console.log(
      `⏳ Payment Status: ${state} - Order ID ${merchantTransactionId}`
    );
  }

  // Always send 200 OK to acknowledge webhook
  res.status(200).send("Webhook received");
});

// ------------------- HEALTH CHECK -------------------
app.get("/", (req, res) => {
  res.send("✅ PhonePe Payment API is running");
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
