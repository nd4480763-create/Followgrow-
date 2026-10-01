export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const orderId = String(
      req.query?.order_id || ""
    ).trim();

    if (!/^FG[A-Za-z0-9_-]{6,80}$/.test(orderId)) {
      return res.status(400).json({
        error: "Valid order_id is required"
      });
    }

    const response = await fetch(
      "https://sandbox.cashfree.com/pg/orders/" +
      encodeURIComponent(orderId) +
      "/payments",
      {
        method: "GET",

        headers: {
          "Accept": "application/json",
          "x-api-version": "2025-01-01",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Cashfree status request failed",
        details: data
      });
    }

    const payments = Array.isArray(data) ? data : [];

    const success = payments.some(
      p =>
        String(p?.payment_status || "")
          .toUpperCase() === "SUCCESS"
    );

    const pending = payments.some(
      p =>
        String(p?.payment_status || "")
          .toUpperCase() === "PENDING"
    );

    return res.status(200).json({
      order_id: orderId,
      status: success
        ? "SUCCESS"
        : pending
        ? "PENDING"
        : "FAILED"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Payment status server error",
      message: error.message
    });
  }
}
