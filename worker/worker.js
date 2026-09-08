const PRODUCTS = {
  ranch: {
    number: "01",
    name: "Ranch",
    catalogObjectIds: {
      "2 oz": "HMVKA6RPGJKGJKVMNUE6TNMV",
      "8 oz": "QZKG3TLGDOSDVAQONCZDOSBF"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "poultry-rub": {
    number: "02",
    name: "Poultry Rub",
    catalogObjectIds: {
      "2 oz": "PAHVOIQTMK7JVMWN63CFWJAX",
      "8 oz": "MKL7S3LT7TCC4YP76YFVMVR7"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "butchers-blend": {
    number: "03",
    name: "Butcher's Blend",
    catalogObjectIds: {
      "2 oz": "OJR7QL3NCZ3Y6KS4VXKXVLIN",
      "8 oz": "WI6NUUMOPYWNOJYPL7MGR27Q"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "smokehouse-rub": {
    number: "04",
    name: "Smokehouse Rub",
    catalogObjectIds: {
      "2 oz": "ZF3N7SUMGYHL3THTAL3LHD42",
      "8 oz": "46BHBDQJP5TIUELV7J6KHV75"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "bbq-rub": {
    number: "05",
    name: "BBQ Rub",
    catalogObjectIds: {
      "2 oz": "IOSJ25ZOJQD7CHD7PMQZ77TQ",
      "8 oz": "2XDQ377MXQ6PWAKZTHJAQMVM"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  taco: {
    number: "06",
    name: "Taco",
    catalogObjectIds: {
      "2 oz": "2XUXSC7TFSXW6RLOA2FJGLCE",
      "8 oz": "B3WWWAE5D7CIPR4ZQNH7IOOK"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  fajitas: {
    number: "07",
    name: "Fajitas",
    catalogObjectIds: {
      "2 oz": "MLTXV2LL4WJ3JRSNEMGQN732",
      "8 oz": "MA5LD7OUT6Y6YFOY2DQS6UF3"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "moms-spaghetti": {
    number: "08",
    name: "Mom's Spaghetti",
    catalogObjectIds: {
      "2 oz": "IVB6RUS2O7VISHUB227SJ2X5",
      "8 oz": "C4BQSKYX6EEKH2Z55I3KJFR7"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "italian-seasoning": {
    number: "09",
    name: "Italian Seasoning",
    catalogObjectIds: {
      "2 oz": "ZVVAUE352SWCGBEDYJTBZDB4",
      "8 oz": "RRNTWNO7IMBKOGHG23VRZ6IN"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "garlic-salt": {
    number: "10",
    name: "Garlic Salt",
    catalogObjectIds: {
      "2 oz": "YAFNMUGYOKUKGGVUDMYEWHLT",
      "8 oz": "MJ34RXSYNA2Q3MBNAR3IMWQJ"
    },
    ounces: {
      "2 oz": 2,
      "8 oz": 8
    }
  },

  "homestead-blend": {
    number: "11",
    name: "Homestead Blend",
    catalogObjectIds: {
      "2 oz": "UI5LHCHDFDIVLOTZQYSP3YHV",
      "8 oz": "D7XC7EOPHYPPFNTJC5HWNBYC"
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


    const catalogObjectId =
      product.catalogObjectIds[size];


    if (!catalogObjectId) {
      throw new Error(
        "One of the selected products is not available in the Square catalog."
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


function normalizePhone(phone) {

  const digits =
    String(phone || "")
      .replace(/\D/g, "");


  if (digits.length === 10) {
    return `+1${digits}`;
  }


  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    return `+${digits}`;
  }


  throw new Error(
    "Please enter a valid phone number."
  );

}


function validateShippingAddress(address) {

  if (
    !address ||
    typeof address !== "object"
  ) {
    throw new Error(
      "Please enter a California shipping address."
    );
  }


  const name =
    String(address.name || "")
      .trim();

  const email =
    String(address.email || "")
      .trim();

  const phone =
    normalizePhone(
      address.phone
    );

  const addressLine1 =
    String(
      address.addressLine1 || ""
    ).trim();

  const addressLine2 =
    String(
      address.addressLine2 || ""
    ).trim();

  const city =
    String(address.city || "")
      .trim();

  const state =
    String(address.state || "")
      .trim()
      .toUpperCase();

  const postalCode =
    String(
      address.postalCode || ""
    ).trim();

  const country =
    String(address.country || "")
      .trim()
      .toUpperCase();


  if (
    !name ||
    !email ||
    !addressLine1 ||
    !city ||
    !postalCode
  ) {
    throw new Error(
      "Please complete the shipping address."
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


  if (
    state !== "CA" ||
    country !== "US"
  ) {
    throw new Error(
      "Crooked Gate currently ships only to California addresses."
    );
  }


  if (
    !/^\d{5}(-\d{4})?$/.test(
      postalCode
    )
  ) {
    throw new Error(
      "Please enter a valid California ZIP code."
    );
  }


  const zip =
    Number(
      postalCode.slice(0, 5)
    );


  if (
    zip < 90001 ||
    zip > 96162
  ) {
    throw new Error(
      "Crooked Gate currently ships only to California addresses."
    );
  }


  return {
    name,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    postalCode
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


  let recipient =
    null;


  if (
    fulfillment === "shipping"
  ) {

    try {

      recipient =
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


    /*
      REAL SQUARE SHIPMENT

      Customer enters address once on
      Crooked Gate. That address is placed
      directly onto the Square order.
    */

    order.fulfillments = [
      {
        type:
          "SHIPMENT",

        state:
          "PROPOSED",

        shipment_details: {

          recipient: {

            display_name:
              recipient.name,

            phone_number:
              recipient.phone,

            address: {

              address_line_1:
                recipient.addressLine1,

              ...(recipient.addressLine2
                ? {
                    address_line_2:
                      recipient.addressLine2
                  }
                : {}),

              locality:
                recipient.city,

              administrative_district_level_1:
                "CA",

              postal_code:
                recipient.postalCode,

              country:
                "US"

            }

          }

        }

      }
    ];

  }


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

      /*
        Address has already been collected
        and validated by Crooked Gate.
      */

      ask_for_shipping_address:
        false

    },

    payment_note:
      fulfillment === "pickup"
        ? "LOCAL PICKUP - LINCOLN, CA"
        : "CROOKED GATE WEBSITE ORDER - CALIFORNIA SHIPPING"

  };


  /*
    PREFILL SQUARE CONTACT INFORMATION.

    Also give Square the same buyer address.
    Customer does not need to type it again.
  */

  if (
    fulfillment === "shipping"
  ) {

    squarePayload.pre_populated_data = {

      buyer_email:
        recipient.email,

      buyer_phone_number:
        recipient.phone,

      buyer_address: {

        address_line_1:
          recipient.addressLine1,

        ...(recipient.addressLine2
          ? {
              address_line_2:
                recipient.addressLine2
            }
          : {}),

        locality:
          recipient.city,

        administrative_district_level_1:
          "CA",

        postal_code:
          recipient.postalCode,

        country:
          "US"

      }

    };

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


  if (!squareResponse.ok) {

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
