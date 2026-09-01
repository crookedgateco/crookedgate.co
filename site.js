/* =========================================================
   CROOKED GATE
   SHARED SITE JAVASCRIPT
   ========================================================= */


/* =========================================================
   PRODUCT CATALOG
   ========================================================= */

const CROOKED_GATE_PRODUCTS = [

  {
    id: "ranch",
    number: "01",
    name: "Ranch",
    image: "/IMG_5974.jpeg",
    url: "/seasonings/ranch/",
    description:
      "Good on burgers, fries, potatoes, chicken and vegetables."
  },

  {
    id: "poultry-rub",
    number: "02",
    name: "Poultry Rub",
    image: "/IMG_5973.jpeg",
    url: "/seasonings/poultry-rub/",
    description:
      "Good on chicken, turkey, potatoes and roasted vegetables."
  },

  {
    id: "butchers-blend",
    number: "03",
    name: "Butcher's Blend",
    image: "/IMG_5972.jpeg",
    url: "/seasonings/butchers-blend/",
    description:
      "Good on steak, burgers, pork, potatoes and vegetables."
  },

  {
    id: "smokehouse-rub",
    number: "04",
    name: "Smokehouse Rub",
    image: "/IMG_5971.jpeg",
    url: "/seasonings/smokehouse-rub/",
    description:
      "Good on pork, chicken, ribs, potatoes and grilled vegetables."
  },

  {
    id: "bbq-rub",
    number: "05",
    name: "BBQ Rub",
    image: "/IMG_5970.jpeg",
    url: "/seasonings/bbq-rub/",
    description:
      "Good on chicken, pork, burgers, ribs and roasted vegetables."
  },

  {
    id: "taco",
    number: "06",
    name: "Taco",
    image: "/IMG_5969.jpeg",
    url: "/seasonings/taco/",
    description:
      "Good in tacos, ground beef, chicken, rice and beans."
  },

  {
    id: "fajitas",
    number: "07",
    name: "Fajitas",
    image: "/IMG_5968.jpeg",
    url: "/seasonings/fajitas/",
    description:
      "Good with chicken, steak, peppers, onions and rice."
  },

  {
    id: "moms-spaghetti",
    number: "08",
    name: "Mom's Spaghetti",
    image: "/IMG_5967.jpeg",
    url: "/seasonings/moms-spaghetti/",
    description:
      "Made for pasta, meat sauce, meatballs and garlic bread."
  },

  {
    id: "italian-seasoning",
    number: "09",
    name: "Italian Seasoning",
    image: "/IMG_5966.jpeg",
    url: "/seasonings/italian-seasoning/",
    description:
      "Good in pasta, vegetables, chicken, bread and marinades."
  },

  {
    id: "garlic-salt",
    number: "10",
    name: "Garlic Salt",
    image: "/IMG_5965.jpeg",
    url: "/seasonings/garlic-salt/",
    description:
      "Good on potatoes, vegetables, eggs, chicken and everyday cooking."
  },

  {
    id: "homestead-blend",
    number: "11",
    name: "Homestead Blend",
    image: "/IMG_5964.jpeg",
    url: "/seasonings/homestead-blend/",
    description:
      "Good on meat, potatoes, vegetables, soups and everyday meals."
  }

];


/* =========================================================
   PRICES
   DISPLAY ONLY

   IMPORTANT:
   The authoritative checkout prices live inside the
   Cloudflare Worker, not in the browser.
   ========================================================= */

const CROOKED_GATE_SIZES = {
  "2 oz": 6,
  "8 oz": 20
};


/* =========================================================
   SQUARE CHECKOUT WORKER
   ========================================================= */

const CROOKED_GATE_CHECKOUT_URL =
  "https://crooked-gate-checkout.mgruttemeyer.workers.dev/checkout";


/* =========================================================
   CURRENT SIZE SELECTIONS
   ========================================================= */

const selectedSizes = {};


/* =========================================================
   PANTRY / CART
   ========================================================= */

let cart = [];

try {

  cart =
    JSON.parse(
      localStorage.getItem("crookedGatePantry")
    ) || [];

} catch {

  cart = [];

}


/* =========================================================
   PRODUCT GRID
   ========================================================= */

function renderProductGrid() {

  const grid =
    document.getElementById("productGrid");

  if (!grid) {
    return;
  }


  grid.innerHTML =
    CROOKED_GATE_PRODUCTS
      .map(product => {

        selectedSizes[product.id] =
          selectedSizes[product.id] || "2 oz";


        return `

          <article class="product-card">

            <a
              class="product-label-link"
              href="${product.url}"
            >

              <div class="label-frame">

                <img
                  src="${product.image}"
                  alt="Crooked Gate No. ${product.number} ${product.name}"
                >

              </div>

            </a>


            <div class="product-info">

              <div class="product-number">
                No. ${product.number}
              </div>


              <a
                class="product-name"
                href="${product.url}"
              >
                ${product.name}
              </a>


              <p class="product-description">
                ${product.description}
              </p>


              <a
                class="view-product"
                href="${product.url}"
              >
                Explore No. ${product.number} →
              </a>


              <div class="buy-box">

                <span class="choose-label">
                  Choose Your Bag
                </span>


                <div class="size-options">

                  <button
                    class="size-button selected"
                    type="button"
                    data-product="${product.id}"
                    data-size="2 oz"
                  >
                    2 OZ · $6
                  </button>


                  <button
                    class="size-button"
                    type="button"
                    data-product="${product.id}"
                    data-size="8 oz"
                  >
                    8 OZ · $20
                  </button>

                </div>


                <button
                  class="add-pantry"
                  type="button"
                  data-add-product="${product.id}"
                >
                  Add to Pantry
                </button>

              </div>

            </div>

          </article>

        `;

      })
      .join("");

}


/* =========================================================
   SIZE SELECTION
   ========================================================= */

function selectProductSize(
  productId,
  size,
  clickedButton
) {

  selectedSizes[productId] =
    size;


  document
    .querySelectorAll(
      `.size-button[data-product="${productId}"]`
    )
    .forEach(button => {

      button.classList.remove("selected");

    });


  clickedButton.classList.add("selected");

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
      item => item.id === productId
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
   PRODUCT ADD BUTTON
   ========================================================= */

function handleProductAdd(button) {

  const productId =
    button.dataset.addProduct;


  const size =
    selectedSizes[productId] || "2 oz";


  const product =
    addProductToPantry(
      productId,
      size
    );


  if (!product) {
    return;
  }


  const originalText =
    button.textContent;


  button.classList.add("added");

  button.textContent =
    "✓ Added to Pantry";


  setTimeout(() => {

    button.classList.remove("added");

    button.textContent =
      originalText;

  }, 1000);


  showToast(
    `✓ No. ${product.number} ${product.name}, ${size}, added to the pantry.`
  );

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
   RENDER PANTRY
   ========================================================= */

function renderPantry() {

  const pantryItems =
    document.getElementById("pantryItems");

  const cartCount =
    document.getElementById("cartCount");

  const pantryMessage =
    document.getElementById("pantryMessage");

  const pantryTotal =
    document.getElementById("pantryTotal");

  const checkoutButton =
    document.getElementById("checkoutButton");

  const pantryNote =
    document.querySelector(".pantry-note");


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
      "Head to Checkout →";

    checkoutButton.disabled =
      cart.length === 0;

  }


  if (pantryNote) {

    pantryNote.textContent =
      "Secure checkout powered by Square.";

  }


  if (pantryItems) {

    if (cart.length === 0) {

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

      pantryItems.innerHTML =
        cart
          .map((item, index) => `

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

          `)
          .join("");

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


  cart[index].quantity += amount;


  if (cart[index].quantity <= 0) {

    cart.splice(index, 1);

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


  cart.splice(index, 1);


  saveCart();

  renderPantry();

}


/* =========================================================
   OPEN PANTRY
   ========================================================= */

function openPantry() {

  const drawer =
    document.getElementById("pantryDrawer");

  const overlay =
    document.getElementById("pantryOverlay");


  if (!drawer || !overlay) {
    return;
  }


  drawer.classList.add("open");

  overlay.classList.add("open");


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
    document.getElementById("pantryDrawer");

  const overlay =
    document.getElementById("pantryOverlay");


  if (!drawer || !overlay) {
    return;
  }


  drawer.classList.remove("open");

  overlay.classList.remove("open");


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
    document.getElementById("pantryButton");


  if (!button) {
    return;
  }


  button.classList.remove("bump");


  void button.offsetWidth;


  button.classList.add("bump");

}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById("toast");


  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 1800);

}


/* =========================================================
   SQUARE CHECKOUT
   ========================================================= */

async function checkoutWithSquare() {

  if (cart.length === 0) {

    showToast(
      "The pantry's empty."
    );

    return;

  }


  const button =
    document.getElementById("checkoutButton");


  if (!button) {
    return;
  }


  const originalText =
    button.textContent;


  button.disabled = true;

  button.textContent =
    "Opening Secure Checkout...";


  try {

    const response =
      await fetch(
        CROOKED_GATE_CHECKOUT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            items:
              cart.map(item => ({

                id: item.id,
                size: item.size,
                quantity: item.quantity

              }))

          })

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.checkoutUrl
    ) {

      throw new Error(
        data.error ||
        "Checkout could not be created."
      );

    }


    window.location.href =
      data.checkoutUrl;

  } catch (error) {

    console.error(
      "Crooked Gate checkout error:",
      error
    );


    button.disabled = false;

    button.textContent =
      originalText;


    showToast(
      "Checkout couldn't start. Try again."
    );

  }

}


/* =========================================================
   ORDER COMPLETE RETURN
   ========================================================= */

function handleOrderCompleteReturn() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get("order") !==
    "complete"
  ) {

    return;

  }


  cart = [];

  saveCart();

  renderPantry();


  showToast(
    "Order placed. Thank you!"
  );


  const cleanUrl =
    window.location.pathname +
    window.location.hash;


  window.history.replaceState(
    {},
    document.title,
    cleanUrl
  );

}


/* =========================================================
   GLOBAL CLICK HANDLERS
   ========================================================= */

document.addEventListener(
  "click",
  event => {


    /* SIZE BUTTON */

    const sizeButton =
      event.target.closest(
        ".size-button"
      );


    if (sizeButton) {

      selectProductSize(

        sizeButton.dataset.product,

        sizeButton.dataset.size,

        sizeButton

      );

      return;

    }


    /* ADD PRODUCT */

    const addButton =
      event.target.closest(
        "[data-add-product]"
      );


    if (addButton) {

      handleProductAdd(
        addButton
      );

      return;

    }


    /* QUANTITY MINUS */

    const minusButton =
      event.target.closest(
        "[data-cart-minus]"
      );


    if (minusButton) {

      changeQuantity(

        Number(
          minusButton.dataset.cartMinus
        ),

        -1

      );

      return;

    }


    /* QUANTITY PLUS */

    const plusButton =
      event.target.closest(
        "[data-cart-plus]"
      );


    if (plusButton) {

      changeQuantity(

        Number(
          plusButton.dataset.cartPlus
        ),

        1

      );

      return;

    }


    /* REMOVE */

    const removeButton =
      event.target.closest(
        "[data-cart-remove]"
      );


    if (removeButton) {

      removeCartItem(

        Number(
          removeButton.dataset.cartRemove
        )

      );

      return;

    }

  }
);


/* =========================================================
   STATIC BUTTONS
   ========================================================= */


/* OPEN PANTRY */

document
  .getElementById("pantryButton")
  ?.addEventListener(
    "click",
    openPantry
  );


/* CLOSE PANTRY */

document
  .getElementById("closePantryButton")
  ?.addEventListener(
    "click",
    closePantry
  );


/* OVERLAY */

document
  .getElementById("pantryOverlay")
  ?.addEventListener(
    "click",
    closePantry
  );


/* KEEP SHOPPING */

document
  .getElementById("keepShoppingButton")
  ?.addEventListener(
    "click",
    closePantry
  );


/* SQUARE CHECKOUT */

document
  .getElementById("checkoutButton")
  ?.addEventListener(
    "click",
    checkoutWithSquare
  );


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closePantry();

    }

  }
);


/* =========================================================
   START
   ========================================================= */

renderProductGrid();

renderPantry();

handleOrderCompleteReturn();
