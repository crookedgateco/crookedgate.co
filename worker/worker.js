const PRODUCTS = {
  ranch: {
    catalogObjectIds: {
      "2 oz": "HMVKA6RPGJKGJKVMNUE6TNMV",
      "8 oz": "QZKG3TLGDOSDVAQONCZDOSBF"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "poultry-rub": {
    catalogObjectIds: {
      "2 oz": "PAHVOIQTMK7JVMWN63CFWJAX",
      "8 oz": "MKL7S3LT7TCC4YP76YFVMVR7"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "butchers-blend": {
    catalogObjectIds: {
      "2 oz": "OJR7QL3NCZ3Y6KS4VXKXVLIN",
      "8 oz": "WI6NUUMOPYWNOJYPL7MGR27Q"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "smokehouse-rub": {
    catalogObjectIds: {
      "2 oz": "ZF3N7SUMGYHL3THTAL3LHD42",
      "8 oz": "46BHBDQJP5TIUELV7J6KHV75"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "bbq-rub": {
    catalogObjectIds: {
      "2 oz": "IOSJ25ZOJQD7CHD7PMQZ77TQ",
      "8 oz": "2XDQ377MXQ6PWAKZTHJAQMVM"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  taco: {
    catalogObjectIds: {
      "2 oz": "2XUXSC7TFSXW6RLOA2FJGLCE",
      "8 oz": "B3WWWAE5D7CIPR4ZQNH7IOOK"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  fajitas: {
    catalogObjectIds: {
      "2 oz": "MLTXV2LL4WJ3JRSNEMGQN732",
      "8 oz": "MA5LD7OUT6Y6YFOY2DQS6UF3"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "moms-spaghetti": {
    catalogObjectIds: {
      "2 oz": "IVB6RUS2O7VISHUB227SJ2X5",
      "8 oz": "C4BQSKYX6EEKH2Z55I3KJFR7"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "italian-seasoning": {
    catalogObjectIds: {
      "2 oz": "ZVVAUE352SWCGBEDYJTBZDB4",
      "8 oz": "RRNTWNO7IMBKOGHG23VRZ6IN"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "garlic-salt": {
    catalogObjectIds: {
      "2 oz": "YAFNMUGYOKUKGGVUDMYEWHLT",
      "8 oz": "MJ34RXSYNA2Q3MBNAR3IMWQJ"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  },

  "homestead-blend": {
    catalogObjectIds: {
      "2 oz": "UI5LHCHDFDIVLOTZQYSP3YHV",
      "8 oz": "D7XC7EOPHYPPFNTJC5HWNBYC"
    },
    ounces: { "2 oz": 2, "8 oz": 8 }
  }
};


const ALLOWED_ORIGINS = new Set([
  "https://crookedgate.co",
  "https://www.crookedgate.co"
]);


function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  const allowedOrigin =
    ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://crookedgate.co";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json"
  };
}


function jsonResponse(request, body, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders(request)
    }
  );
}


function calculateShipping(productOunces) {
  const shippingWeight = productOunces + 3;

  if (shippingWeight <= 16) {
    return 850;
  }

  if (shippingWeight <= 32) {
    return 1250;
  }

  if (shippingWeight <= 48) {
    return 1550;
  }

  if (shippingWeight <= 80) {
    return 2050;
  }

  throw new Error(
    "Orders over 5 lb cannot currently be shipped through online checkout."
  );
}


function isCaliforniaZip(postalCode) {
  if (
    typeof postalCode !== "string" ||
    !/^\d{5}(-\d{4})?$/.test(postalCode)
  ) {
    return false;
  }

  const zip = Number(
    postalCode.slice(0, 5)
  );

  return (
    zip >= 90001 &&
    zip <= 96162
  );
}


function validateShippingAddress(address) {
  if (
    !address ||
    typeof address !== "object"
  ) {
    throw new Error(
      "Please enter your California shipping address."
    );
  }


  const name =
    String(address.name || "").trim();

  const email =
    String(address.email || "").trim();

  const phone =
    String(address.phone || "").trim();

  const addressLine1 =
    String(address.addressLine1 || "").trim();

  const addressLine2 =
    String(address.addressLine2 || "").trim();

  const city =
    String(address.city || "").trim();

  const state =
    String(address.state || "")
      .trim()
      .toUpperCase();

  const postalCode =
    String(address.postalCode || "").trim();

  const country =
    String(address.country || "US")
      .trim()
      .toUpperCase();


  if (
    !name ||
    !email ||
    !phone ||
    !addressLine1 ||
    !city ||
    !postalCode
  ) {
    throw new Error(
      "Please complete your shipping address."
    );
  }


  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new Error(
      "Please enter a valid email address."
    );
  }


  if (state !== "CA") {
    throw new Error(
      "Crooked Gate currently ships only to California addresses."
    );
  }


  if (country !== "US") {
    throw new Error(
      "Crooked Gate currently ships only to California addresses."
    );
  }


  if (
    !isCaliforniaZip(
      postalCode
    )
  ) {
    throw new Error(
      "Please enter a valid California ZIP code."
    );
  }


  return {
    name,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    state: "CA",
    postalCode,
    country: "US"
  };
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

    const catalogObjectId =
      product.catalogObjectIds[size];

    if (!catalogObjectId) {
      throw new Error(
        "One of the selected products is not available."
      );
    }

    lineItems.push({
      catalog_object_id:
        catalogObjectId,

      quantity:
        String(quantity)
    });

    productOunces +=
      product.ounces[size] *
      quantity;
  }

  return {
    lineItems,
    productOunces
  };
}


async function createCheckout(request, env) {
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


  let shippingAddress =
    null;


  if (
    fulfillment === "shipping"
  ) {
    try {
      shippingAddress =
        validateShippingAddress(
          body.shippingAddress
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
  }


  let built;

  try {
    built =
      buildLineItems(
        body.items
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

    The customer enters the shipping address
    on Crooked Gate first.

    The Worker verifies that it is a California
    address before creating the Square checkout.

    Square then displays its normal shipping
    address section, pre-populated with the
    address supplied by Crooked Gate.
  */

  if (
    fulfillment === "shipping"
  ) {
    let shippingAmount;

    try {
      shippingAmount =
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
            shippingAmount,

          currency:
            "USD"
        },

        taxable:
          true
      }
    ];
  }


  /*
    PICKUP
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
            "Local pickup in Lincoln, CA."
        }
      }
    ];
  }


  const squarePayload = {
    idempotency_key:
      crypto.randomUUID(),

    description:
      fulfillment === "pickup"
        ? "Crooked Gate Seasonings - Local Pickup - Lincoln, CA"
        : "Crooked Gate Seasonings - California Shipping",

    order,

    checkout_options: {
      allow_tipping:
        false,

      redirect_url:
        "https://crookedgate.co/?order=complete",

      ask_for_shipping_address:
        fulfillment === "shipping"
    },

    payment_note:
      fulfillment === "pickup"
        ? "LOCAL PICKUP - LINCOLN, CA"
        : "CROOKED GATE WEBSITE ORDER - CALIFORNIA SHIPPING"
  };


  /*
    PRE-POPULATE SQUARE

    This saves the customer from retyping the
    address they just entered on Crooked Gate.

    Square can still display its own shipping
    address fields before payment.
  */

  if (
    fulfillment === "shipping" &&
    shippingAddress
  ) {
    squarePayload.pre_populated_data = {
      buyer_email:
        shippingAddress.email,

      buyer_phone_number:
        shippingAddress.phone,

      buyer_address: {
        address_line_1:
          shippingAddress.addressLine1,

        locality:
          shippingAddress.city,

        administrative_district_level_1:
          "CA",

        postal_code:
          shippingAddress.postalCode,

        country:
          "US"
      }
    };


    if (
      shippingAddress.addressLine2
    ) {
      squarePayload
        .pre_populated_data
        .buyer_address
        .address_line_2 =
          shippingAddress.addressLine2;
    }
  }


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


  if (
    !checkoutUrl
  ) {
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
  async fetch(request, env) {

    if (
      request.method === "OPTIONS"
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
      new URL(request.url);


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
