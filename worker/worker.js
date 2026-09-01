const ALLOWED_ORIGINS = new Set([
  "https://crookedgate.co",
  "https://www.crookedgate.co"
]);


/* =========================================================
   PRODUCT CATALOG
   ========================================================= */

const PRODUCTS = {

  ranch: {
    number: "01",
    name: "Ranch"
  },

  "poultry-rub": {
    number: "02",
    name: "Poultry Rub"
  },

  "butchers-blend": {
    number: "03",
    name: "Butcher's Blend"
  },

  "smokehouse-rub": {
    number: "04",
    name: "Smokehouse Rub"
  },

  "bbq-rub": {
    number: "05",
    name: "BBQ Rub"
  },

  taco: {
    number: "06",
    name: "Taco"
  },

  fajitas: {
    number: "07",
    name: "Fajitas"
  },

  "moms-spaghetti": {
    number: "08",
    name: "Mom's Spaghetti"
  },

  "italian-seasoning": {
    number: "09",
    name: "Italian Seasoning"
  },

  "garlic-salt": {
    number: "10",
    name: "Garlic Salt"
  },

  "homestead-blend": {
    number: "11",
    name: "Homestead Blend"
  }

};


/* =========================================================
   PRODUCT PRICES
   CENTS
   ========================================================= */

const PRICES = {

  "2 oz": 600,

  "8 oz": 2000

};


/* =========================================================
   PRODUCT WEIGHTS
   OUNCES
   ========================================================= */

const PRODUCT_WEIGHTS = {

  "2 oz": 2,

  "8 oz": 8

};


/* =========================================================
   SHIPPING
   ========================================================= */

const PACKAGING_WEIGHT_OZ = 3;


function calculateShipping(
  productWeightOz
) {

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


/* =========================================================
   CORS
   ========================================================= */

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

    headers["Vary"] =
      "Origin";

  }


  return headers;

}


/* =========================================================
   JSON RESPONSE
   ========================================================= */

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


/* =========================================================
   WORKER
   ========================================================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /* =====================================================
       PREFLIGHT
       ===================================================== */

    if (
      request.method ===
      "OPTIONS"
    ) {

      const origin =
        request.headers.get(
          "Origin"
        );


      if (
        !origin ||
        !ALLOWED_ORIGINS.has(
          origin
        )
      ) {

        return new Response(
          null,
          {
            status: 403
          }
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


    /* =====================================================
       HEALTH CHECK
       ===================================================== */

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
          mode:
            "sandbox"
        }
      );

    }


    /* =====================================================
       CHECKOUT ROUTE
       ===================================================== */

    if (
      request.method !== "POST" ||
      url.pathname !== "/checkout"
    ) {

      return jsonResponse(
        request,
        {
          error:
            "Not found."
        },
        404
      );

    }


    /* =====================================================
       ORIGIN CHECK
       ===================================================== */

    const origin =
      request.headers.get(
        "Origin"
      );


    if (
      origin &&
      !ALLOWED_ORIGINS.has(
        origin
      )
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

      /* ===================================================
         ENVIRONMENT CHECK
         =================================================== */

      if (
        !env.SQUARE_ACCESS_TOKEN
      ) {

        return jsonResponse(
          request,
          {
            error:
              "Missing SQUARE_ACCESS_TOKEN."
          },
          500
        );

      }


      if (
        !env.SQUARE_LOCATION_ID
      ) {

        return jsonResponse(
          request,
          {
            error:
              "Missing SQUARE_LOCATION_ID."
          },
          500
        );

      }


      /* ===================================================
         REQUEST BODY
         =================================================== */

      const body =
        await request.json();


      if (
        !body ||
        !Array.isArray(
          body.items
        ) ||
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


      /* ===================================================
         BUILD ORDER
         =================================================== */

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
          Number(item.quantity);


        if (!product) {

          return jsonResponse(
            request,
            {
              error:
                `Invalid product: ${item.id}`
            },
            400
          );

        }


        if (!price) {

          return jsonResponse(
            request,
            {
              error:
                `Invalid bag size: ${item.size}`
            },
            400
          );

        }


        if (!weight) {

          return jsonResponse(
            request,
            {
              error:
                `Invalid product weight: ${item.size}`
            },
            400
          );

        }


        if (
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
                `Invalid quantity: ${item.quantity}`
            },
            400
          );

        }


        /* ADD PRODUCT WEIGHT */

        productWeightOz +=
          weight *
          quantity;


        /* ADD SQUARE LINE ITEM */

        lineItems.push({

          name:
            `No. ${product.number} ${product.name} - ${item.size}`,

          quantity:
            String(quantity),

          base_price_money: {

            amount:
              price,

            currency:
              "USD"

          }

        });

      }


      /* ===================================================
         CALCULATE SHIPPING
         =================================================== */

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


      /* ===================================================
         SQUARE REQUEST
         =================================================== */

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

              name:
                "Shipping",

              scope:
                "ORDER",

              calculation_phase:
                "TOTAL_PHASE",

              taxable:
                false,

              amount_money: {

                amount:
                  shipping.amount,

                currency:
                  "USD"

              }

            }

          ]

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


      /* ===================================================
         SEND TO SQUARE
         =================================================== */

      const squareResponse =
        await fetch(

          "https://connect.squareupsandbox.com/v2/online-checkout/payment-links",

          {

            method:
              "POST",


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


      const squareData =
        await squareResponse.json();


      /* ===================================================
         SQUARE ERROR
         =================================================== */

      if (
        !squareResponse.ok
      ) {

        return jsonResponse(
          request,
          {

            error:
              squareData
                ?.errors?.[0]
                ?.detail ||

              squareData
                ?.errors?.[0]
                ?.code ||

              "Square rejected the checkout.",


            squareStatus:
              squareResponse.status,


            squareErrors:
              squareData.errors || []

          },
          502
        );

      }


      /* ===================================================
         CHECKOUT URL
         =================================================== */

      const checkoutUrl =
        squareData
          ?.payment_link
          ?.url;


      if (!checkoutUrl) {

        return jsonResponse(
          request,
          {
            error:
              "Square created a response but returned no checkout URL."
          },
          502
        );

      }


      /* ===================================================
         SUCCESS
         =================================================== */

      return jsonResponse(
        request,
        {

          ok: true,

          checkoutUrl,

          shipping: {

            productWeightOz,

            packagingWeightOz:
              PACKAGING_WEIGHT_OZ,

            shippingWeightOz:
              shipping.weightOz,

            amount:
              shipping.amount

          }

        }
      );

    }


    /* =====================================================
       UNEXPECTED ERROR
       ===================================================== */

    catch (error) {

      return jsonResponse(
        request,
        {

          error:
            error?.message ||
            "Unable to start checkout."

        },
        500
      );

    }

  }

};
