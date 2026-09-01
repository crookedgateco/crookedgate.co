const PRODUCTS = {
  ranch: {
    number: "01",
    name: "Ranch",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "poultry-rub": {
    number: "02",
    name: "Poultry Rub",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "butchers-blend": {
    number: "03",
    name: "Butcher's Blend",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "smokehouse-rub": {
    number: "04",
    name: "Smokehouse Rub",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "bbq-rub": {
    number: "05",
    name: "BBQ Rub",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  taco: {
    number: "06",
    name: "Taco",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  fajitas: {
    number: "07",
    name: "Fajitas",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "moms-spaghetti": {
    number: "08",
    name: "Mom's Spaghetti",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "italian-seasoning": {
    number: "09",
    name: "Italian Seasoning",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "garlic-salt": {
    number: "10",
    name: "Garlic Salt",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "homestead-blend": {
    number: "11",
    name: "Homestead Blend",
    prices: {
      "2 oz": 600,
      "8 oz": 2000
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  }
};


const ALLOWED_ORIGINS = new Set([
  "https://crookedgate.co",
  "https://www.crookedgate.co"
]);


function corsHeaders(request) {

  const origin =
    request.headers.get("Origin");


  const allowedOrigin =
    ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://crookedgate.co";


  return {
    "Access-Control-Allow-Origin":
      allowedOrigin,

    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",

    "Vary":
      "Origin",

    "Content-Type":
      "application/json"
  };

}


function jsonResponse(
  request,
  body,
  status = 200
) {

  return new Response(
    JSON.stringify(body),
    {
      status,
      headers:
        corsHeaders(request)
    }
  );

}


function calculateShipping(
  productOunces
) {

  /*
    Every shipment gets
    3 oz packaging allowance.
  */

  const shippingWeight =
    productOunces + 3;


  if (shippingWeight <= 16) {

    return {
      amount: 850,
      weight: shippingWeight
    };

  }


  if (shippingWeight <= 32) {

    return {
      amount: 1250,
      weight: shippingWeight
    };

  }


  if (shippingWeight <= 48) {

    return {
      amount: 1550,
      weight: shippingWeight
    };

  }


  if (shippingWeight <= 80) {

    return {
      amount: 2050,
      weight: shippingWeight
    };

  }


  throw new Error(
    "Orders over 5 lb cannot currently be shipped through online checkout."
  );

}


function buildLineItems(items) {

  const lineItems = [];

  let productOunces = 0;


  for (const item of items) {

    const product =
      PRODUCTS[item.id];


    if (!product) {

      throw new Error(
        "One of the products in the pantry is not available."
      );

    }


    const size =
      item.size;


    if (
      size !== "2 oz" &&
      size !== "8 oz"
    ) {

      throw new Error(
        "One of the selected bag sizes is not available."
      );

    }


    const quantity =
      Number(item.quantity);


    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 50
    ) {

      throw new Error(
        "One of the item quantities is invalid."
      );

    }


    const price =
      product.prices[size];


    const ounces =
      product.ounces[size];


    lineItems.push({

      name:
        `No. ${product.number} ${product.name}`,

      variation_name:
        size,

      quantity:
        String(quantity),

      base_price_money: {
        amount:
          price,

        currency:
          "USD"
      }

    });


    productOunces +=
      ounces *
      quantity;

  }


  return {
    lineItems,
    productOunces
  };

}


async function createCheckout(
  request,
  env
) {

  let body;


  try {

    body =
      await request.json();

  } catch {

    return jsonResponse(
      request,
      {
        error:
          "Checkout couldn't start. Please try again."
      },
      400
    );

  }


  if (
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


  const fulfillment =
    body.fulfillment === "pickup"
      ? "pickup"
      : "shipping";


  let built;


  try {

    built =
      buildLineItems(
        body.items
      );

  } catch (error) {

    console.error(
      "Crooked Gate cart validation error:",
      error
    );


    return jsonResponse(
      request,
      {
        error:
          error.message
      },
      400
    );

  }


  const order = {

    location_id:
      env.SQUARE_LOCATION_ID,

    line_items:
      built.lineItems,

    pricing_options: {
      auto_apply_taxes: true
    }

  };


  /*
    SHIPPING
  */

  if (
    fulfillment === "shipping"
  ) {

    let shipping;


    try {

      shipping =
        calculateShipping(
          built.productOunces
        );

    } catch (error) {

      return jsonResponse(
        request,
        {
          error:
            error.message
        },
        400
      );

    }


    order.service_charges = [

      {
        name:
          "Shipping",

        calculation_phase:
          "SUBTOTAL_PHASE",

        amount_money: {
          amount:
            shipping.amount,

          currency:
            "USD"
        },

        taxable:
          true

      }

    ];

  }


  /*
    REAL SQUARE PICKUP FULFILLMENT

    Square requires a recipient display
    name when the fulfillment is created.

    Checkout itself collects the buyer's
    actual email and phone in Square's
    normal Contact section.
  */

  if (
    fulfillment === "pickup"
  ) {

    order.fulfillments = [

      {
        type:
          "PICKUP",

        state:
          "PROPOSED",

        pickup_details: {

          schedule_type:
            "ASAP",

          prep_time_duration:
            "PT48H",

          recipient: {
            display_name:
              "Online Customer"
          },

          note:
            "Local pickup in Lincoln, CA. Contact customer when order is ready and provide pickup location and instructions."

        }

      }

    ];

  }


  const checkoutOptions = {

    allow_tipping:
      false,

    redirect_url:
      "https://crookedgate.co/?order=complete",

    ask_for_shipping_address:
      fulfillment === "shipping"

  };


  const squarePayload = {

    idempotency_key:
      crypto.randomUUID(),

    description:
      fulfillment === "pickup"
        ? "Crooked Gate Seasonings - Local Pickup - Lincoln, CA"
        : "Crooked Gate Seasonings - Shipping",

    order,

    checkout_options:
      checkoutOptions,

    payment_note:
      fulfillment === "pickup"
        ? "LOCAL PICKUP - LINCOLN, CA"
        : "CROOKED GATE WEBSITE ORDER"

  };


  let squareResponse;


  try {

    squareResponse =
      await fetch(
        "https://connect.squareup.com/v2/online-checkout/payment-links",
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
              squarePayload
            )

        }
      );

  } catch (error) {

    console.error(
      "Square network error:",
      error
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


  let squareData;


  try {

    squareData =
      await squareResponse.json();

  } catch {

    squareData = {};

  }


  if (
    !squareResponse.ok
  ) {

    console.error(
      "Square checkout error:",
      squareResponse.status,
      JSON.stringify(squareData)
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
    squareData.payment_link?.long_url ||
    squareData.payment_link?.url;


  if (!checkoutUrl) {

    console.error(
      "Square checkout missing URL:",
      JSON.stringify(squareData)
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
      checkoutUrl
    }
  );

}


export default {

  async fetch(
    request,
    env
  ) {

    if (
      request.method ===
      "OPTIONS"
    ) {

      return new Response(
        null,
        {
          status: 204,
          headers:
            corsHeaders(request)
        }
      );

    }


    const url =
      new URL(
        request.url
      );


    if (
      request.method === "POST" &&
      url.pathname === "/checkout"
    ) {

      return createCheckout(
        request,
        env
      );

    }


    return jsonResponse(
      request,
      {
        error:
          "Not found."
      },
      404
    );

  }

};
