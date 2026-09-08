/* =========================================================
   CROOKED GATE
   ORDER SUCCESS
   ========================================================= */


/* =========================================================
   ORDER SUCCESS MODAL
   ========================================================= */

function showOrderSuccessModal() {

  const existingModal =
    document.getElementById(
      "orderSuccessModal"
    );


  if (existingModal) {

    existingModal.remove();

  }


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "orderSuccessModal";


  modal.innerHTML = `

    <div
      id="orderSuccessBackdrop"
      style="
        position: fixed;
        inset: 0;
        background: rgba(23, 20, 15, 0.78);
        z-index: 9998;
      "
    ></div>


    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="orderSuccessTitle"
      style="
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(calc(100% - 30px), 560px);
        box-sizing: border-box;
        background: #f2eadc;
        color: #17140f;
        border: 3px solid #17140f;
        box-shadow: 0 18px 55px rgba(0, 0, 0, 0.42);
        padding: 34px 26px 28px;
        text-align: center;
        z-index: 9999;
      "
    >

      <button
        id="orderSuccessClose"
        type="button"
        aria-label="Close order confirmation"
        style="
          position: absolute;
          top: 12px;
          right: 14px;
          border: 0;
          background: transparent;
          color: #17140f;
          font-size: 2rem;
          line-height: 1;
          cursor: pointer;
          padding: 4px 8px;
        "
      >
        ×
      </button>


      <div
        style="
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 12px;
        "
      >
        Crooked Gate Seasonings
      </div>


      <div
        id="orderSuccessTitle"
        style="
          font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
          font-size: clamp(2.6rem, 11vw, 4.8rem);
          line-height: 0.92;
          letter-spacing: 0.025em;
          text-transform: uppercase;
          margin-bottom: 18px;
        "
      >
        Order Placed.
        <br>
        Thank You!
      </div>


      <p
        style="
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.05rem;
          line-height: 1.55;
          margin: 0 auto 24px;
          max-width: 420px;
        "
      >
        Your order is in. We'll take it from here.
      </p>


      <button
        id="orderSuccessContinue"
        type="button"
        style="
          width: 100%;
          border: 2px solid #17140f;
          background: #17140f;
          color: #f2eadc;
          font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 16px 18px;
          cursor: pointer;
        "
      >
        Back to Crooked Gate →
      </button>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  document.body.style.overflow =
    "hidden";


  const closeModal =
    () => {

      modal.remove();

      document.body.style.overflow =
        "";

    };


  document
    .getElementById(
      "orderSuccessClose"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "orderSuccessContinue"
    )
    ?.addEventListener(
      "click",
      closeModal
    );

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


  const cleanUrl =
    window.location.pathname +
    window.location.hash;


  window.history.replaceState(
    {},
    document.title,
    cleanUrl
  );


  showOrderSuccessModal();

}
