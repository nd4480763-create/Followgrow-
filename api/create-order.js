export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      order_id,
      order_amount,
      customer_name,
      customer_email,
      customer_phone
    } = req.body || {};

    if (!order_id || !order_amount || !customer_phone) {
      return res.status(400).json({
        error: "order_id, order_amount and customer_phone are required"
      });
    }

    const response = await fetch(
      "https://sandbox.cashfree.com/pg/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-api-version": "2025-01-01",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY
        },
        body: JSON.stringify({
          order_id: String(order_id),
          order_amount: Number(order_amount),
          order_currency: "INR",

          customer_details: {
            customer_id: String(customer_phone),
            customer_name: customer_name || "FollowGrow User",
            customer_email:
              customer_email || "customer@example.com",
            customer_phone: String(customer_phone)
          }
        })
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Payment server error",
      message: error.message
    });
  }
}
