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

const PRODUCT_WEIGHTS = {
  "2 oz": 2,
  "8 oz": 8
};

const PACKAGING_WEIGHT_OZ = 3;

function calculateShipping(productWeightOz) {
  const shippingWeightOz =
    productWeightOz +
    PACKAGING_WEIGHT_OZ;

  if (shippingWeightOz <= 16) {
    return {
      weightOz: shippingWeightOz,
      amount: 850
    };
  }

  if (shippingWeightOz <= 32) {
    return {
      weightOz: shippingWeightOz,
      amount: 1250
    };
  }

  if (shippingWeightOz <= 48) {
    return {
      weightOz: shippingWeightOz,
      amount: 1550
    };
  }

  if (shippingWeightOz <= 80) {
    return {
      weightOz: shippingWeightOz,
      amount: 2050
    };
  }

  return null;
}

function corsHeaders(request) {
  const origin =
    request.headers.get("Origin");

  const headers = {
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",

    "Content-Type":
      "application/json"
  };

  if (
    origin &&
    ALLOWED_ORIGINS.has(origin)
  ) {
    headers[
      "Access-Control-Allow-Origin"
    ] = origin;

    headers["Vary"] = "Origin";
  }

  return headers;
}

function jsonResponse(
  request,
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:
        corsHeaders(request)
    }
  );
}

export default {
  async fetch(request, env) {
    const url =
      new URL(request.url);

    if (
      request.method === "OPTIONS"
    ) {
      const origin =
        request.headers.get("Origin");

      if (
        !origin ||
        !ALLOWED_ORIGINS.has(origin)
      ) {
        return new Response(
          null,
          { status: 403 }
        );
      }

      return new Response(
        null,
        {
          status: 204,
          headers:
            corsHeaders(request)
        }
      );
    }

    if (
      request.method === "GET" &&
      url.pathname === "/"
    ) {
      return jsonResponse(
        request,
        {
          ok: true,
          service:
            "Crooked Gate Checkout",
          mode: "production"
        }
      );
    }

    if (
      request.method !== "POST" ||
      url.pathname !== "/checkout"
    ) {
      return jsonResponse(
        request,
        {
          error: "Not found."
        },
        404
      );
    }

    const origin =
      request.headers.get("Origin");

    if (
      origin &&
      !ALLOWED_ORIGINS.has(origin)
    ) {
      return jsonResponse(
        request,
        {
          error:
            "Origin not allowed."
        },
        403
      );
    }

    try {
      if (
        !env.SQUARE_ACCESS_TOKEN ||
        !env.SQUARE_LOCATION_ID
      ) {
        console.error(
          "Crooked Gate checkout configuration is incomplete."
        );

        return jsonResponse(
          request,
          {
            error:
              "Checkout is temporarily unavailable. Please try again shortly."
          },
          500
        );
      }

      let body;

      try {
        body =
          await request.json();
      }

      catch {
        return jsonResponse(
          request,
          {
            error:
              "Invalid checkout request."
          },
          400
        );
      }

      if (
        !body ||
        !Array.isArray(body.items) ||
        body.items.length === 0
      ) {
        return jsonResponse(
          request,
          {
            error:
              "The pantry is empty."
          },
          400
        );
      }

      const lineItems = [];

      let productWeightOz = 0;

      for (
        const item of body.items
      ) {
        const product =
          PRODUCTS[item.id];

        const price =
          PRICES[item.size];

        const weight =
          PRODUCT_WEIGHTS[
            item.size
          ];

        const quantity =
          Number(
            item.quantity
          );

        if (
          !product ||
          !price ||
          !weight ||
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1 ||
          quantity > 20
        ) {
          return jsonResponse(
            request,
            {
              error:
                "One or more pantry items are invalid. Please refresh the page and try again."
            },
            400
          );
        }

        productWeightOz +=
          weight * quantity;

        lineItems.push({
          name:
            `No. ${product.number} ${product.name} - ${item.size}`,

          quantity:
            String(quantity),

          base_price_money: {
            amount: price,
            currency: "USD"
          }
        });
      }

      const shipping =
        calculateShipping(
          productWeightOz
        );

      if (!shipping) {
        return jsonResponse(
          request,
          {
            error:
              "This order is over our 5 lb shipping limit. Please reduce the order size."
          },
          400
        );
      }

      const squareRequest = {
        idempotency_key:
          crypto.randomUUID(),

        description:
          "Crooked Gate Seasonings website order",

        order: {
          location_id:
            env.SQUARE_LOCATION_ID,

          line_items:
            lineItems,

          service_charges: [
            {
              name: "Shipping",

              scope: "ORDER",

              calculation_phase:
                "TOTAL_PHASE",

              taxable: false,

              amount_money: {
                amount:
                  shipping.amount,

                currency:
                  "USD"
              }
            }
          ],

          pricing_options: {
            auto_apply_taxes: true
          }
        },

        checkout_options: {
          ask_for_shipping_address:
            true,

          allow_tipping:
            false,

          redirect_url:
            "https://crookedgate.co/?order=complete"
        },

        payment_note:
          "Crooked Gate Seasonings website order"
      };

      const squareResponse =
        await fetch(
          "https://connect.squareup.com/v2/online-checkout/payment-links",
          {
            method: "POST",

            headers: {
              "Authorization":
                `Bearer ${env.SQUARE_ACCESS_TOKEN}`,

              "Square-Version":
                "2026-08-19",

              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                squareRequest
              )
          }
        );

      let squareData = {};

      try {
        squareData =
          await squareResponse.json();
      }

      catch {
        console.error(
          "Square returned a non-JSON response.",
          squareResponse.status
        );
      }

      if (
        !squareResponse.ok
      ) {
        console.error(
          "Square checkout error:",
          squareResponse.status,
          squareData?.errors || squareData
        );

        return jsonResponse(
          request,
          {
            error:
              "Checkout couldn't start. Please try again."
          },
          502
        );
      }

      const checkoutUrl =
        squareData
          ?.payment_link
          ?.url;

      if (!checkoutUrl) {
        console.error(
          "Square returned no checkout URL.",
          squareData
        );

        return jsonResponse(
          request,
          {
            error:
              "Checkout couldn't start. Please try again."
          },
          502
        );
      }

      return jsonResponse(
        request,
        {
          ok: true,
          checkoutUrl
        }
      );
    }

    catch (error) {
      console.error(
        "Unexpected Crooked Gate checkout error:",
        error
      );

      return jsonResponse(
        request,
        {
          error:
            "Checkout couldn't start. Please try again."
        },
        500
      );
    }
  }
};
