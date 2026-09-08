/* =========================================================
   CROOKED GATE
   PRODUCT GRID
   ========================================================= */


/* =========================================================
   CURRENT SIZE SELECTIONS
   ========================================================= */

const selectedSizes = {};


/* =========================================================
   RENDER PRODUCT GRID
   ========================================================= */

function renderProductGrid() {

  const grid =
    document.getElementById(
      "productGrid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML =
    CROOKED_GATE_PRODUCTS
      .map(product => {

        selectedSizes[product.id] =
          selectedSizes[product.id] ||
          "2 oz";


        const hasProductPage =
          product.id === "ranch";


        const productImage =
          hasProductPage
            ? `

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

            `
            : `

              <div class="label-frame">

                <img
                  src="${product.image}"
                  alt="Crooked Gate No. ${product.number} ${product.name}"
                >

              </div>

            `;


        const productName =
          hasProductPage
            ? `

              <a
                class="product-name"
                href="${product.url}"
              >
                ${product.name}
              </a>

            `
            : `

              <div class="product-name">
                ${product.name}
              </div>

            `;


        const exploreLink =
          hasProductPage
            ? `

              <a
                class="view-product"
                href="${product.url}"
              >
                Explore No. ${product.number} →
              </a>

            `
            : "";


        return `

          <article class="product-card">

            ${productImage}


            <div class="product-info">

              <div class="product-number">
                No. ${product.number}
              </div>


              ${productName}


              <p class="product-description">
                ${product.description}
              </p>


              ${exploreLink}


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

      button.classList.remove(
        "selected"
      );

    });


  clickedButton.classList.add(
    "selected"
  );

}


/* =========================================================
   PRODUCT ADD BUTTON
   ========================================================= */

function handleProductAdd(button) {

  /*
   * Prevent a second tap during the temporary
   * "Added to Pantry" state from overwriting
   * the button's real original text.
   */

  if (
    button.classList.contains(
      "added"
    )
  ) {
    return;
  }


  const productId =
    button.dataset.addProduct;


  const size =
    selectedSizes[productId] ||
    "2 oz";


  const product =
    addProductToPantry(
      productId,
      size
    );


  if (!product) {
    return;
  }


  /*
   * Save the real button label once.
   * This also preserves custom labels such as
   * "Add No. 01 to Pantry" on the Ranch page.
   */

  if (
    !button.dataset.originalText
  ) {

    button.dataset.originalText =
      button.textContent.trim();

  }


  button.classList.add(
    "added"
  );


  button.textContent =
    "✓ Added to Pantry";


  setTimeout(() => {

    button.classList.remove(
      "added"
    );


    button.textContent =
      button.dataset.originalText;

  }, 1000);


  showToast(
    `✓ No. ${product.number} ${product.name}, ${size}, added to the pantry.`
  );

}
