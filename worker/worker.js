const ALLOWED_ORIGINS = new Set([
  "https://crookedgate.co",
  "https://www.crookedgate.co"
]);

const PRODUCTS = {
  ranch: { number: "01", name: "Ranch" },
  "poultry-rub": { number: "02", name: "Poultry Rub" },
  "butchers-blend": { number: "03", name: "Butcher's Blend" },
  "smokehouse-rub": { number: "04", name: "Smokehouse Rub" },
  "bbq-rub": { number: "05", name: "BBQ Rub" },
  taco: { number: "06", name: "Taco" },
  fajitas: { number: "07", name: "Fajitas" },
  "moms-spaghetti": { number: "08", name: "Mom's Spaghetti" },
  "italian-seasoning": { number: "09", name: "Italian Seasoning" },
  "garlic-salt": { number: "10", name: "Garlic Salt" },
  "homestead-blend": { number: "11", name: "Homestead Blend" }
};

const PRICES = {
  "2 oz": 600,
  "8 oz": 2000
};

function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

function jsonResponse(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(request)
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin");

      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return jsonResponse(request, {
        ok: true,
        service: "Crooked Gate Checkout",
        mode: "sandbox"
      });
    }

    if (
      request.method !== "POST" ||
      url.pathname !== "/checkout"
    ) {
      return jsonResponse(
        request,
        { error: "Not found." },
        404
      );
    }

    const origin = request.headers.get("Origin");

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse(
        request,
        { error: "Origin not allowed." },
        403
      );
    }

    try {
      const body = await request.json();

      if (
        !body ||
        !Array.isArray(body.items) ||
        body.items.length === 0
      ) {
        return jsonResponse(
          request,
          { error: "The pantry is empty." },
          400
        );
      }

      const lineItems = [];

      for (const item of body.items) {
        const product = PRODUCTS[item.id];
        const price = PRICES[item.size];
        const quantity = Number(item.quantity);

        if (!product) {
          return jsonResponse(
            request,
            { error: "Invalid product." },
            400
          );
        }

        if (!price) {
          return jsonResponse(
            request,
            { error: "Invalid bag size." },
            400
          );
        }

        if (
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 20
        ) {
          return jsonResponse(
            request,
            { error: "Invalid quantity." },
            400
          );
        }

        lineItems.push({
          name:
            `No. ${product.number} ${product.name} - ${item.size}`,

          quantity: String(quantity),

          item_type: "ITEM",

          base_price_money: {
            amount: price,
            currency: "USD"
          }
        });
      }

      const squareRequest = {
        idempotency_key: crypto.randomUUID(),

        description:
          "Crooked Gate Seasonings website order",

        order: {
          location_id: env.SQUARE_LOCATION_ID,
          line_items: lineItems
        },

        checkout_options: {
          ask_for_shipping_address: true,
          allow_tipping: false,
          redirect_url:
            "https://crookedgate.co/?order=complete"
        },

        payment_note:
          "Crooked Gate Seasonings website order"
      };

      const squareResponse = await fetch(
        "https://connect.squareupsandbox.com/v2/online-checkout/payment-links",
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${env.SQUARE_ACCESS_TOKEN}`,

            "Square-Version": "2026-08-19",

            "Content-Type": "application/json"
          },

          body: JSON.stringify(squareRequest)
        }
      );

      const squareData =
        await squareResponse.json();

      if (!squareResponse.ok) {
        console.error(
          "Square checkout error:",
          JSON.stringify(squareData)
        );

        return jsonResponse(
          request,
          {
            error:
              "Square could not create the checkout."
          },
          502
        );
      }

      const checkoutUrl =
        squareData?.payment_link?.url;

      if (!checkoutUrl) {
        return jsonResponse(
          request,
          {
            error:
              "Square did not return a checkout link."
          },
          502
        );
      }

      return jsonResponse(request, {
        ok: true,
        checkoutUrl
      });
    }

    catch (error) {
      console.error(
        "Checkout Worker error:",
        error
      );

      return jsonResponse(
        request,
        {
          error:
            "Unable to start checkout."
        },
        500
      );
    }
  }
};
