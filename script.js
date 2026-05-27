const cart = new Map();
const cartPanel = document.querySelector(".cart-panel");
const scrim = document.querySelector(".scrim");
const cartItems = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total");
const checkoutButton = document.querySelector(".checkout-button");
const form = document.querySelector(".signup-form");
const formMessage = document.querySelector(".form-message");

function formatPrice(value) {
  return `USD ${value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function setCartOpen(open) {
  cartPanel.classList.toggle("open", open);
  scrim.classList.toggle("open", open);
  cartPanel.setAttribute("aria-hidden", String(!open));
}

function renderCart() {
  const items = [...cart.values()];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);
  checkoutButton.disabled = false;

  if (!items.length) {
    cartItems.innerHTML = '<p class="empty-cart">Aún no has agregado productos.</p>';
    return;
  }

  cartItems.innerHTML = items
    .map(
      (item) => `
        <div class="cart-line">
          <div>
            <p>${item.name}</p>
            <span>${formatPrice(item.price)} x ${item.quantity}</span>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
          <button class="icon-button cart-remove" type="button" data-product="${item.name}" aria-label="Eliminar ${item.name}">
            <svg viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      `,
    )
    .join("");
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    const name = card.dataset.product;
    const price = Number(card.dataset.price);
    const current = cart.get(name) ?? { name, price, quantity: 0 };

    current.quantity += 1;
    cart.set(name, current);
    renderCart();
    setCartOpen(true);
  });
});

cartItems.addEventListener("click", (e) => {
  const removeButton = e.target.closest(".cart-remove");
  if (!removeButton) return;
  const name = removeButton.dataset.product;
  cart.delete(name);
  renderCart();
});

document.querySelector(".cart-toggle").addEventListener("click", () => setCartOpen(true));
document.querySelector(".cart-close").addEventListener("click", () => setCartOpen(false));
scrim.addEventListener("click", () => setCartOpen(false));

checkoutButton.addEventListener("click", () => {
  if (!cart.size) {
    cartItems.innerHTML = '<p class="empty-cart">Agrega al menos un producto para solicitar cotización.</p>';
    return;
  }

  checkoutButton.disabled = true;
  cartItems.insertAdjacentHTML(
    "beforeend",
    '<p class="empty-cart">Lista preparada. Déjanos tu correo en el formulario y nuestro equipo te contactará.</p>',
  );
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email").trim();

  if (!email) {
    formMessage.textContent = "Por favor ingresa un correo electrónico válido.";
    return;
  }

  formMessage.textContent = `Gracias. Enviaremos el catálogo y la información comercial a ${email}.`;
  form.reset();
});

renderCart();
