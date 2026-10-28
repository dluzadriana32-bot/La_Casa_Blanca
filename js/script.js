/* ============================================================
   LA CASA BLANCA — interacciones básicas con JavaScript
   Filtros, búsqueda, carrito, formulario y navegación móvil.
   ============================================================ */
const products = {
  figura: { name: 'Figura coleccionable', price: 59900 },
  bandera: { name: 'Bandera madridista', price: 39900 },
  gorra: { name: 'Gorra blanca y azul', price: 44900 },
  bufanda: { name: 'Bufanda de hincha', price: 34900 },
  gafas: { name: 'Gafas de sol', price: 29900 },
  llavero: { name: 'Llavero coleccionable', price: 14900 },
  taza: { name: 'Taza madridista', price: 24900 },
  banderin: { name: 'Banderín decorativo', price: 19900 },
  pulsera: { name: 'Pulsera deportiva', price: 12900 },
  trofeo: { name: 'Mini trofeo decorativo', price: 49900 },
  gorro: { name: 'Gorro tejido', price: 32900 },
  botella: { name: 'Botella deportiva', price: 27900 }
};
const cart = {};
const currency = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');
let toastTimer;

// Mensaje breve para confirmar las acciones de la interfaz.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

// Actualiza cantidades, total y contenido visual del carrito.
function renderCart() {
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  const count = ids.reduce((sum, id) => sum + cart[id], 0);
  const total = ids.reduce((sum, id) => sum + products[id].price * cart[id], 0);
  cartCount.textContent = count;
  cartTotal.textContent = currency(total);
  if (!ids.length) {
    cartItems.innerHTML = '<p class="cart-empty">Tu carrito está esperando un fichaje. ⚽</p>';
    return;
  }
  cartItems.innerHTML = ids.map(id => `
    <article class="cart-item">
      <div><strong>${products[id].name}</strong><small>${currency(products[id].price)} · Subtotal: ${currency(products[id].price * cart[id])}</small></div>
      <div class="quantity-controls"><button type="button" data-cart-action="minus" data-id="${id}" aria-label="Quitar una unidad">−</button><b>${cart[id]}</b><button type="button" data-cart-action="plus" data-id="${id}" aria-label="Agregar una unidad">+</button></div>
    </article>`).join('');
}

// Añadir artículos al carrito desde las tarjetas del catálogo.
document.querySelectorAll('.add-btn').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.id;
    if (!products[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    showToast(`${products[id].name} se agregó al carrito`);
  });
});

// Botones para cambiar cantidades dentro del carrito.
cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const { id, cartAction } = { id: button.dataset.id, cartAction: button.dataset.cartAction };
  if (!cart[id]) return;
  cart[id] += cartAction === 'plus' ? 1 : -1;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
});

// Abrir y cerrar el panel lateral del carrito.
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
function toggleCart(open) {
  cartDrawer.classList.toggle('open', open);
  cartDrawer.setAttribute('aria-hidden', String(!open));
  cartOverlay.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}
document.getElementById('openCart').addEventListener('click', () => toggleCart(true));
document.getElementById('closeCart').addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));

// Filtros por categoría y búsqueda de texto en el catálogo.
let activeFilter = 'todos';
const searchInput = document.getElementById('searchInput');
function filterProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase('es');
  let visible = 0;
  document.querySelectorAll('.product-card').forEach(card => {
    const categoryMatches = activeFilter === 'todos' || card.dataset.category === activeFilter;
    const textMatches = `${card.dataset.name} ${card.textContent}`.toLocaleLowerCase('es').includes(query);
    const show = categoryMatches && textMatches;
    card.hidden = !show;
    if (show) visible++;
  });
  document.getElementById('emptyState').hidden = visible !== 0;
}
document.getElementById('filterList').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  filterProducts();
});
searchInput.addEventListener('input', filterProducts);

// Formulario académico: valida los datos y abre un borrador de correo.
const contactForm = document.getElementById('contactForm');
const birthDate = document.getElementById('birthDate');
const ageInput = document.getElementById('customerAge');
const feedback = document.getElementById('formFeedback');

// La edad se calcula al elegir la fecha de nacimiento; el usuario puede revisarla.
birthDate.addEventListener('change', () => {
  if (!birthDate.value) return;
  const birth = new Date(`${birthDate.value}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  if (age >= 1 && age <= 120) ageInput.value = age;
});

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`Consulta desde la web de La Casa Blanca: ${data.get('nombre')} ${data.get('apellidos')}`);
  const body = encodeURIComponent(
    `Nombre: ${data.get('nombre')}\nApellidos: ${data.get('apellidos')}\nFecha de nacimiento: ${data.get('fecha_nacimiento')}\nEdad: ${data.get('edad')}\nDirección: ${data.get('direccion')}\nCorreo: ${data.get('correo')}\nTeléfono: ${data.get('telefono')}\n\nMensaje:\n${data.get('mensaje')}`
  );
  // El dominio .example es reservado para demostraciones: reemplázalo antes de publicar.
  feedback.textContent = 'Se abrirá tu aplicación de correo con un borrador. Reemplaza el correo de ejemplo antes de publicar.';
  window.location.href = `mailto:hola@lacasablanca.example?subject=${subject}&body=${body}`;
});

// Preparar el resumen del carrito en un borrador de correo.
document.getElementById('checkoutButton').addEventListener('click', () => {
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  if (!ids.length) {
    showToast('Agrega al menos un producto antes de consultar el pedido');
    return;
  }
  const lines = ids.map(id => `${products[id].name} x ${cart[id]} — ${currency(products[id].price * cart[id])}`);
  const total = ids.reduce((sum, id) => sum + products[id].price * cart[id], 0);
  const subject = encodeURIComponent('Consulta de pedido - La Casa Blanca');
  const body = encodeURIComponent(`Hola, quiero consultar disponibilidad para estos productos:\n\n${lines.join('\n')}\n\nTotal estimado: ${currency(total)}\n\nMétodo de pago preferido: transferencia bancaria o efectivo.\nPor favor, confirmen disponibilidad y entrega.`);
  window.location.href = `mailto:hola@lacasablanca.example?subject=${subject}&body=${body}`;
});

// Menú responsive para pantallas pequeñas.
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Año automático en el pie de página.
document.getElementById('year').textContent = new Date().getFullYear();
renderCart();
