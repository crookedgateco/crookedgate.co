/* =========================================================
   CROOKED GATE
   PANTRY / CART
   ========================================================= */


/* =========================================================
   PANTRY / CART
   ========================================================= */

let cart = [];


try {

  cart =
    JSON.parse(
      localStorage.getItem(
        "crookedGatePantry"
      )
    ) || [];

} catch {

  cart = [];

}


/* =========================================================
   FULFILLMENT METHOD
   ========================================================= */

let fulfillmentMethod =
  localStorage.getItem(
    "crookedGateFulfillment"
  ) || "shipping";


if (
  fulfillmentMethod !== "shipping" &&
  fulfillmentMethod !== "pickup"
) {

  fulfillmentMethod =
    "shipping";

}


/* =========================================================
   FULFILLMENT / CALIFORNIA NOTICE STYLES
   ========================================================= */

function ensureFulfillmentStyles() {

  if (
    document.getElementById(
      "crookedGateFulfillmentStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement("style");


  style.id =
    "crookedGateFulfillmentStyles";


  style.textContent = `

    .cg-fulfillment {
      margin: 0 0 24px;
      padding: 20px;
      border: 2px solid #17140f;
      background: #f2eadc;
      color: #17140f;
    }

    .cg-fulfillment-title {
      margin: 0 0 14px;
      font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
      font-size: 1.35rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .cg-fulfillment-option {
      display: block;
      margin: 0 0 12px;
      padding: 15px;
      border: 1px solid rgba(23, 20, 15, 0.35);
      cursor: pointer;
    }

    .cg-fulfillment-option:last-of-type {
      margin-bottom: 0;
    }

    .cg-fulfillment-option.selected {
      border: 2px solid #17140f;
      background: rgba(23, 20, 15, 0.06);
    }

    .cg-fulfillment-option-top {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .cg-fulfillment-option input {
      margin-top: 4px;
      flex: 0 0 auto;
    }

    .cg-fulfillment-name {
      display: block;
      font-weight: 700;
      font-size: 1rem;
      line-height: 1.3;
    }

    .cg-fulfillment-free {
      display: inline-block;
      margin-left: 5px;
      font-size: 0.8rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .cg-fulfillment-description {
      display: block;
      margin-top: 5px;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .cg-pickup-details {
      margin-top: 14px;
      padding: 14px;
      border-top: 1px solid rgba(23, 20, 15, 0.35);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .cg-pickup-details strong {
      display: block;
      margin-bottom: 5px;
    }

    .cg-ca-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10050;
      background: rgba(23, 20, 15, 0.78);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .cg-ca-modal {
      position: relative;
      width: min(500px, 100%);
      box-sizing: border-box;
      background: #f2eadc;
      color: #17140f;
      border: 3px solid #17140f;
      padding: 30px 24px;
      box-shadow: 0 18px 55px rgba(0, 0, 0, 0.42);
      text-align: center;
    }

    .cg-ca-modal h2 {
      margin: 0 0 14px;
      font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
      font-size: 2rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .cg-ca-modal p {
      margin: 0 auto 22px;
      max-width: 400px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 1rem;
      line-height: 1.55;
    }

    .cg-ca-actions {
      display: flex;
      gap: 10px;
    }

    .cg-ca-actions button {
      padding: 14px 16px;
      border: 2px solid #17140f;
      font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
      font-size: 1rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .cg-ca-back {
      background: transparent;
      color: #17140f;
    }

    .cg-ca-continue {
      flex: 1;
      background: #17140f;
      color: #f2eadc;
    }

    @media (max-width: 560px) {

      .cg-ca-actions {
        flex-direction: column;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   ADD PRODUCT TO PANTRY
   ========================================================= */

function addProductToPantry(
  productId,
  size
) {

  const product =
    CROOKED_GATE_PRODUCTS.find(
      item =>
        item.id === productId
    );


  if (!product) {
    return;
  }


  const price =
    CROOKED_GATE_SIZES[size];


  const existing =
    cart.find(
      item =>
        item.id === productId &&
        item.size === size
    );


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,
      number: product.number,
      name: product.name,
      size,
      price,
      quantity: 1

    });

  }


  saveCart();

  renderPantry();

  bumpPantryButton();


  return product;

}


/* =========================================================
   SAVE PANTRY
   ========================================================= */

function saveCart() {

  localStorage.setItem(
    "crookedGatePantry",
    JSON.stringify(cart)
  );

}


/* =========================================================
   PANTRY QUANTITY
   ========================================================= */

function getCartQuantity() {

  return cart.reduce(

    (total, item) =>
      total + item.quantity,

    0

  );

}


/* =========================================================
   PANTRY PERSONALITY
   ========================================================= */

function getPantryMessage(count) {

  if (count === 0) {
    return "The pantry's empty.";
  }


  if (count === 1) {
    return "Good start.";
  }


  if (count < 5) {
    return "The pantry's filling up.";
  }


  return "Now we're cooking.";

}


/* =========================================================
   FULFILLMENT HTML
   ========================================================= */

function getFulfillmentHtml() {

  const shippingSelected =
    fulfillmentMethod ===
    "shipping";


  const pickupSelected =
    fulfillmentMethod ===
    "pickup";


  return `

    <div class="cg-fulfillment">

      <h3 class="cg-fulfillment-title">
        Delivery Method
      </h3>


      <label
        class="cg-fulfillment-option ${
          shippingSelected
            ? "selected"
            : ""
        }"
      >

        <span class="cg-fulfillment-option-top">

          <input
            type="radio"
            name="crooked-gate-fulfillment"
            value="shipping"
            data-fulfillment-method="shipping"
            ${
              shippingSelected
                ? "checked"
                : ""
            }
          >

          <span>

            <span class="cg-fulfillment-name">
              Ship My Order
            </span>

            <span class="cg-fulfillment-description">
              California shipping only. Shipping is based on order weight.
            </span>

          </span>

        </span>

      </label>


      <label
        class="cg-fulfillment-option ${
          pickupSelected
            ? "selected"
            : ""
        }"
      >

        <span class="cg-fulfillment-option-top">

          <input
            type="radio"
            name="crooked-gate-fulfillment"
            value="pickup"
            data-fulfillment-method="pickup"
            ${
              pickupSelected
                ? "checked"
                : ""
            }
          >

          <span>

            <span class="cg-fulfillment-name">
              Local Pickup - Lincoln, CA

              <span class="cg-fulfillment-free">
                FREE
              </span>

            </span>

            <span class="cg-fulfillment-description">
              Free local pickup is available in Lincoln, California.
            </span>

          </span>

        </span>


        ${
          pickupSelected
            ? `

              <span class="cg-pickup-details">

                <strong>
                  Pickup Details
                </strong>

                Please include a valid phone number and email address with your order so we can contact you about pickup. Orders are usually ready within 48 hours.

              </span>

            `
            : ""
        }

      </label>

    </div>

  `;

}


/* =========================================================
   SET FULFILLMENT METHOD
   ========================================================= */

function setFulfillmentMethod(method) {

  if (
    method !== "shipping" &&
    method !== "pickup"
  ) {
    return;
  }


  fulfillmentMethod =
    method;


  localStorage.setItem(
    "crookedGateFulfillment",
    fulfillmentMethod
  );


  renderPantry();

}


/* =========================================================
   RENDER PANTRY
   ========================================================= */

function renderPantry() {

  const pantryItems =
    document.getElementById(
      "pantryItems"
    );

  const cartCount =
    document.getElementById(
      "cartCount"
    );

  const pantryMessage =
    document.getElementById(
      "pantryMessage"
    );

  const pantryTotal =
    document.getElementById(
      "pantryTotal"
    );

  const checkoutButton =
    document.getElementById(
      "checkoutButton"
    );

  const pantryNote =
    document.querySelector(
      ".pantry-note"
    );


  const count =
    getCartQuantity();


  if (cartCount) {

    cartCount.textContent =
      count;

  }


  if (pantryMessage) {

    pantryMessage.textContent =
      getPantryMessage(count);

  }


  if (checkoutButton) {

    checkoutButton.textContent =
      fulfillmentMethod ===
      "pickup"
        ? "Continue to Pickup Checkout →"
        : "Head to Checkout →";


    checkoutButton.disabled =
      cart.length === 0;

  }


  if (pantryNote) {

    pantryNote.textContent =
      fulfillmentMethod ===
      "pickup"
        ? "Free local pickup in Lincoln, CA. Secure checkout powered by Square."
        : "California shipping only. Orders shipped outside California cannot be fulfilled. Secure checkout powered by Square.";

  }


  if (pantryItems) {

    if (
      cart.length === 0
    ) {

      pantryItems.innerHTML = `

        <div class="empty-pantry">

          <h3>
            The Pantry's Empty
          </h3>

          <p>
            Pick a Family Recipe and start stocking the shelves.
          </p>

        </div>

      `;

    } else {

      const itemsHtml =
        cart
          .map(
            (item, index) => `

            <div class="pantry-item">

              <div class="pantry-item-top">

                <div>

                  <div class="pantry-item-number">
                    No. ${item.number}
                  </div>

                  <h3>
                    ${item.name}
                  </h3>

                  <div class="pantry-item-size">
                    ${item.size} · $${item.price}
                  </div>

                </div>


                <div class="pantry-item-price">

                  $${(
                    item.price *
                    item.quantity
                  ).toFixed(2)}

                </div>

              </div>


              <div class="pantry-controls">

                <div class="qty-control">

                  <button
                    type="button"
                    data-cart-minus="${index}"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>


                  <span>
                    ${item.quantity}
                  </span>


                  <button
                    type="button"
                    data-cart-plus="${index}"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>


                <button
                  class="remove-item"
                  type="button"
                  data-cart-remove="${index}"
                >
                  Remove
                </button>

              </div>

            </div>

          `
          )
          .join("");


      pantryItems.innerHTML =
        getFulfillmentHtml() +
        itemsHtml;

    }

  }


  const total =
    cart.reduce(

      (sum, item) =>
        sum +
        item.price *
        item.quantity,

      0

    );


  if (pantryTotal) {

    pantryTotal.textContent =
      `$${total.toFixed(2)}`;

  }

}


/* =========================================================
   CHANGE QUANTITY
   ========================================================= */

function changeQuantity(
  index,
  amount
) {

  if (!cart[index]) {
    return;
  }


  cart[index].quantity +=
    amount;


  if (
    cart[index].quantity <= 0
  ) {

    cart.splice(
      index,
      1
    );

  }


  saveCart();

  renderPantry();

}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeCartItem(index) {

  if (!cart[index]) {
    return;
  }


  cart.splice(
    index,
    1
  );


  saveCart();

  renderPantry();

}


/* =========================================================
   OPEN PANTRY
   ========================================================= */

function openPantry() {

  const drawer =
    document.getElementById(
      "pantryDrawer"
    );

  const overlay =
    document.getElementById(
      "pantryOverlay"
    );


  if (
    !drawer ||
    !overlay
  ) {
    return;
  }


  drawer.classList.add(
    "open"
  );

  overlay.classList.add(
    "open"
  );


  drawer.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "pantry-open"
  );

}


/* =========================================================
   CLOSE PANTRY
   ========================================================= */

function closePantry() {

  const drawer =
    document.getElementById(
      "pantryDrawer"
    );

  const overlay =
    document.getElementById(
      "pantryOverlay"
    );


  if (
    !drawer ||
    !overlay
  ) {
    return;
  }


  drawer.classList.remove(
    "open"
  );

  overlay.classList.remove(
    "open"
  );


  drawer.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "pantry-open"
  );

}


/* =========================================================
   PANTRY BUTTON BUMP
   ========================================================= */

function bumpPantryButton() {

  const button =
    document.getElementById(
      "pantryButton"
    );


  if (!button) {
    return;
  }


  button.classList.remove(
    "bump"
  );


  void button.offsetWidth;


  button.classList.add(
    "bump"
  );

}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 4000);

}


/* =========================================================
   CALIFORNIA SHIPPING NOTICE
   ========================================================= */

function confirmCaliforniaShipping() {

  return new Promise(
    resolve => {

      const backdrop =
        document.createElement(
          "div"
        );


      backdrop.className =
        "cg-ca-backdrop";


      backdrop.innerHTML = `

        <div
          class="cg-ca-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cgCaTitle"
        >

          <h2
            id="cgCaTitle"
          >
            California Shipping Only
          </h2>


          <p>
            Crooked Gate currently ships only to California addresses. Continue to Square to enter your shipping information and payment.
          </p>


          <div
            class="cg-ca-actions"
          >

            <button
              id="cgCaBack"
              class="cg-ca-back"
              type="button"
            >
              Back
            </button>


            <button
              id="cgCaContinue"
              class="cg-ca-continue"
              type="button"
            >
              Continue to Payment →
            </button>

          </div>

        </div>

      `;


      document.body.appendChild(
        backdrop
      );


      const previousOverflow =
        document.body.style.overflow;


      document.body.style.overflow =
        "hidden";


      const close =
        result => {

          backdrop.remove();

          document.body.style.overflow =
            previousOverflow;

          resolve(result);

        };


      backdrop
        .querySelector(
          "#cgCaBack"
        )
        .addEventListener(
          "click",
          () => {

            close(false);

          }
        );


      backdrop
        .querySelector(
          "#cgCaContinue"
        )
        .addEventListener(
          "click",
          () => {

            close(true);

          }
        );

    }
  );

}
