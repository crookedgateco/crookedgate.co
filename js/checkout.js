/* =========================================================
   CROOKED GATE
   SQUARE CHECKOUT
   ========================================================= */


/* =========================================================
   CHECKOUT WORKER
   ========================================================= */

const CROOKED_GATE_CHECKOUT_URL =
  "https://crooked-gate-checkout.mgruttemeyer.workers.dev/checkout";


/* =========================================================
   SQUARE CHECKOUT
   ========================================================= */

async function checkoutWithSquare() {

  if (
    cart.length === 0
  ) {

    showToast(
      "The pantry's empty."
    );

    return;

  }


  if (
    fulfillmentMethod ===
    "shipping"
  ) {

    const confirmed =
      await confirmCaliforniaShipping();


    if (!confirmed) {

      return;

    }

  }


  const button =
    document.getElementById(
      "checkoutButton"
    );


  if (!button) {
    return;
  }


  const originalText =
    button.textContent;


  button.disabled =
    true;


  button.textContent =
    fulfillmentMethod ===
    "pickup"
      ? "Opening Pickup Checkout..."
      : "Opening Secure Checkout...";


  try {

    const checkoutBody = {

      fulfillment:
        fulfillmentMethod,

      items:
        cart.map(
          item => ({

            id:
              item.id,

            size:
              item.size,

            quantity:
              item.quantity

          })
        )

    };


    const response =
      await fetch(
        CROOKED_GATE_CHECKOUT_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(
              checkoutBody
            )

        }
      );


    let data = {};


    try {

      data =
        await response.json();

    } catch {

      throw new Error(
        `Checkout server returned HTTP ${response.status}.`
      );

    }


    if (
      !response.ok
    ) {

      throw new Error(
        data.error ||
        `Checkout failed with HTTP ${response.status}.`
      );

    }


    if (
      !data.checkoutUrl
    ) {

      throw new Error(
        "Square did not return a checkout link."
      );

    }


    window.location.href =
      data.checkoutUrl;

  } catch (error) {

    console.error(
      "Crooked Gate checkout error:",
      error
    );


    button.disabled =
      false;


    button.textContent =
      originalText;


    showToast(
      error.message ||
      "Checkout couldn't start."
    );

  }

}
