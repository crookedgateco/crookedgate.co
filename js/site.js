/* =========================================================
   CROOKED GATE
   SITE INITIALIZATION & EVENT HANDLERS
   ========================================================= */


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

document.addEventListener(
  "click",
  event => {


    /* -----------------------------------------------------
       PRODUCT SIZE
       ----------------------------------------------------- */

    const sizeButton =
      event.target.closest(
        ".size-button"
      );


    if (
      sizeButton
    ) {

      selectProductSize(

        sizeButton.dataset.product,

        sizeButton.dataset.size,

        sizeButton

      );

      return;

    }


    /* -----------------------------------------------------
       ADD TO PANTRY
       ----------------------------------------------------- */

    const addButton =
      event.target.closest(
        "[data-add-product]"
      );


    if (
      addButton
    ) {

      handleProductAdd(
        addButton
      );

      return;

    }


    /* -----------------------------------------------------
       DECREASE QUANTITY
       ----------------------------------------------------- */

    const minusButton =
      event.target.closest(
        "[data-cart-minus]"
      );


    if (
      minusButton
    ) {

      changeQuantity(

        Number(
          minusButton.dataset.cartMinus
        ),

        -1

      );

      return;

    }


    /* -----------------------------------------------------
       INCREASE QUANTITY
       ----------------------------------------------------- */

    const plusButton =
      event.target.closest(
        "[data-cart-plus]"
      );


    if (
      plusButton
    ) {

      changeQuantity(

        Number(
          plusButton.dataset.cartPlus
        ),

        1

      );

      return;

    }


    /* -----------------------------------------------------
       REMOVE PANTRY ITEM
       ----------------------------------------------------- */

    const removeButton =
      event.target.closest(
        "[data-cart-remove]"
      );


    if (
      removeButton
    ) {

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
   FULFILLMENT METHOD
   ========================================================= */

document.addEventListener(
  "change",
  event => {

    const fulfillmentInput =
      event.target.closest(
        "[data-fulfillment-method]"
      );


    if (
      !fulfillmentInput
    ) {
      return;
    }


    setFulfillmentMethod(
      fulfillmentInput.dataset.fulfillmentMethod
    );

  }
);


/* =========================================================
   STATIC BUTTONS
   ========================================================= */

document
  .getElementById(
    "pantryButton"
  )
  ?.addEventListener(
    "click",
    openPantry
  );


document
  .getElementById(
    "closePantryButton"
  )
  ?.addEventListener(
    "click",
    closePantry
  );


document
  .getElementById(
    "pantryOverlay"
  )
  ?.addEventListener(
    "click",
    closePantry
  );


document
  .getElementById(
    "keepShoppingButton"
  )
  ?.addEventListener(
    "click",
    closePantry
  );


document
  .getElementById(
    "checkoutButton"
  )
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

    if (
      event.key ===
      "Escape"
    ) {

      closePantry();

    }

  }
);


/* =========================================================
   START CROOKED GATE
   ========================================================= */

ensureFulfillmentStyles();

renderProductGrid();

renderPantry();

handleOrderCompleteReturn();
