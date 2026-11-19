// ===== Tiện ích dùng chung cho mọi trang =====
const SHOP_NAME = "THEANHJewelry";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const money = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#fdecea"/>' +
      '<g fill="none" stroke="#ff9b9b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="150" y="120" width="100" height="170" rx="18"/><path d="M175 120v-30h50v30M150 175h100"/></g></svg>'
  );

const imgSrc = (file) => (file ? "/images/" + encodeURIComponent(file) : PLACEHOLDER);
const img = (file, alt) =>
  `<img src="${imgSrc(file)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src=PLACEHOLDER">`;

const qs = (name) => new URLSearchParams(location.search).get(name) || "";

// Lưu trữ an toàn trong trình duyệt
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  },
};

// Dữ liệu sản phẩm (đọc từ /data/products.json)
let _catalog = null;
async function loadCatalog() {
  if (_catalog) return _catalog;
  const res = await fetch("/data/products.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Không tải được danh sách sản phẩm. Vui lòng thử lại.");
  const data = await res.json();
  const catName = Object.fromEntries(data.categories.map((c) => [c.id, c.name]));
  data.products.forEach((p) => (p.category_name = catName[p.category_id] || ""));
  return (_catalog = data);
}

// Giỏ hàng
const Cart = {
  key: "theanh_cart",
  items() { return store.get(this.key, []); },
  save(items) { store.set(this.key, items); updateCartBadge(); },
  add(p, quantity = 1) {
    const items = this.items();
    const found = items.find((i) => i.id === p.id);
    const max = p.stock ?? 99;
    if (found) found.quantity = Math.min(found.quantity + quantity, max);
    else items.push({ id: p.id, name: p.name, price: p.price, image: p.image, stock: max, quantity: Math.min(quantity, max) });
    this.save(items);
  },
  setQty(id, quantity) {
    const items = this.items();
    const it = items.find((i) => i.id === id);
    if (it) it.quantity = Math.max(1, Math.min(quantity, it.stock || 99));
    this.save(items);
  },
  remove(id) { this.save(this.items().filter((i) => i.id !== id)); },
  clear() { this.save([]); },
  count() { return this.items().reduce((s, i) => s + i.quantity, 0); },
  total() { return this.items().reduce((s, i) => s + i.price * i.quantity, 0); },
};

// Đơn hàng đã đặt trên trình duyệt này
const Orders = {
  key: "theanh_orders",
  all() { return store.get(this.key, []); },
  add(order) { store.set(this.key, [order, ...this.all()].slice(0, 50)); },
};

function updateCartBadge() {
  const b = document.getElementById("cart-count");
  if (!b) return;
  const n = Cart.count();
  b.textContent = n;
  b.style.display = n ? "grid" : "none";
}

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function showAlert(el, msg, type = "error") {
  el.textContent = msg;
  el.className = `alert ${type} show`;
}

function renderHeader() {
  document.getElementById("header").innerHTML = `
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo"><span>THEANH</span> Jewelry</a>
      <form class="search" action="/" method="get" role="search">
        <input type="search" name="search" placeholder="Tìm kiếm mỹ phẩm cao cấp..." value="${esc(qs("search"))}" maxlength="100">
        <button type="submit">Tìm</button>
      </form>
      <nav class="nav">
        <a href="/">Trang chủ</a>
        <a href="/orders">Đơn hàng</a>
        <a href="/cart" class="cart-link accent">Giỏ hàng<span class="badge" id="cart-count"></span></a>
      </nav>
    </div>
  </header>`;
  updateCartBadge();
}

function renderFooter() {
  document.getElementById("footer").innerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a href="/" class="logo"><span style="color:var(--primary)">THEANH</span> Jewelry</a>
        <p>Hệ thống bán lẻ mỹ phẩm chăm sóc sắc đẹp chính hãng hàng đầu Việt Nam. Tự hào mang lại trải nghiệm làm đẹp an toàn, tự nhiên và tối ưu.</p>
      </div>
      <div>
        <h4>Liên kết nhanh</h4>
        <ul>
          <li><a href="/">Trang chủ</a></li>
          <li><a href="/cart">Giỏ hàng của tôi</a></li>
          <li><a href="/orders">Theo dõi đơn hàng</a></li>
          <li><a href="#contact">Liên hệ trợ giúp</a></li>
        </ul>
      </div>
      <div id="contact">
        <h4>Liên hệ</h4>
        <ul>
          <li>Địa chỉ: 123 Đường Cầu Giấy, Hà Nội</li>
          <li>Hotline hỗ trợ: 0987654321</li>
          <li>Email: abc@gmail.com</li>
        </ul>
      </div>
    </div>
    <div class="container copyright">© ${new Date().getFullYear()} ${SHOP_NAME}. Tất cả quyền được bảo lưu.</div>
  </footer>`;
}

function initLayout() {
  renderHeader();
  renderFooter();
}
