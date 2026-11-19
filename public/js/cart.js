(function () {
  initLayout();
  const app = document.getElementById("app");
  const saved = store.get("theanh_customer", {});

  function render() {
    const items = Cart.items();
    if (!items.length) {
      app.innerHTML = `<div class="empty"><h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy khám phá các sản phẩm chăm sóc sắc đẹp của chúng tôi.</p>
        <a href="/" class="btn">Tiếp tục mua sắm</a></div>`;
      return;
    }

    const rows = items.map((i) => `
      <div class="cart-item" data-id="${esc(i.id)}">
        <a href="/product?id=${encodeURIComponent(i.id)}">${img(i.image, i.name)}</a>
        <div>
          <a href="/product?id=${encodeURIComponent(i.id)}" class="name">${esc(i.name)}</a>
          <div class="unit">${money(i.price)}</div>
          <button class="remove" data-act="remove">Xóa</button>
        </div>
        <div class="qty">
          <button type="button" data-act="minus">−</button>
          <input type="number" value="${i.quantity}" min="1" data-act="set">
          <button type="button" data-act="plus">+</button>
        </div>
        <div class="line">${money(i.price * i.quantity)}</div>
      </div>`).join("");

    app.innerHTML = `
      <div class="cart-layout">
        <section class="panel"><h2>Giỏ hàng (${Cart.count()} sản phẩm)</h2>${rows}</section>
        <aside class="panel">
          <h2>Thông tin đặt hàng</h2>
          <div class="summary-row"><span>Tạm tính</span><span>${money(Cart.total())}</span></div>
          <div class="summary-row"><span>Phí vận chuyển</span><span>Miễn phí</span></div>
          <div class="summary-row total"><span>Tổng cộng</span><span>${money(Cart.total())}</span></div>
          <form id="checkout" style="margin-top:20px">
            <div class="alert" id="msg"></div>
            <div class="field"><label>Họ và tên <i>*</i></label><input name="full_name" required maxlength="100" autocomplete="name" value="${esc(saved.full_name)}"></div>
            <div class="field"><label>Số điện thoại <i>*</i></label><input name="phone" required maxlength="11" autocomplete="tel" value="${esc(saved.phone)}"></div>
            <div class="field"><label>Địa chỉ giao hàng <i>*</i></label><input name="address" required maxlength="255" autocomplete="street-address" value="${esc(saved.address)}"></div>
            <div class="field"><label>Ghi chú</label><textarea name="note" maxlength="500" placeholder="Ví dụ: giao giờ hành chính"></textarea></div>
            <div class="field"><label>Phương thức thanh toán</label>
              <label class="radio"><input type="radio" name="payment" value="COD" checked> Thanh toán khi nhận hàng (COD)</label>
              <label class="radio"><input type="radio" name="payment" value="BANK"> Chuyển khoản ngân hàng</label>
            </div>
            <button class="btn btn-block" type="submit">Đặt hàng</button>
          </form>
        </aside>
      </div>`;

    document.getElementById("checkout").addEventListener("submit", submit);
  }

  app.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    const row = e.target.closest(".cart-item");
    if (!btn || !row || btn.tagName === "INPUT") return;
    const it = Cart.items().find((i) => i.id === row.dataset.id);
    if (!it) return;
    if (btn.dataset.act === "remove") Cart.remove(it.id);
    if (btn.dataset.act === "minus") Cart.setQty(it.id, it.quantity - 1);
    if (btn.dataset.act === "plus") Cart.setQty(it.id, it.quantity + 1);
    render();
  });
  app.addEventListener("change", (e) => {
    if (e.target.dataset.act !== "set") return;
    Cart.setQty(e.target.closest(".cart-item").dataset.id, Number(e.target.value) || 1);
    render();
  });

  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const get = (k) => String(fd.get(k) || "").trim();
    const customer = { full_name: get("full_name"), phone: get("phone"), address: get("address") };
    const msg = document.getElementById("msg");

    if (!customer.full_name || !customer.address) return showAlert(msg, "Vui lòng nhập đầy đủ thông tin nhận hàng.");
    if (!/^0\d{9,10}$/.test(customer.phone)) return showAlert(msg, "Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0).");

    const id = "DH" + Date.now().toString(36).toUpperCase();
    Orders.add({
      id,
      ...customer,
      note: get("note"),
      payment: fd.get("payment") === "BANK" ? "BANK" : "COD",
      items: Cart.items().map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      total: Cart.total(),
      status: "Chờ xác nhận",
      created_at: new Date().toISOString(),
    });
    store.set("theanh_customer", customer);
    Cart.clear();
    location.href = "/orders?new=" + encodeURIComponent(id);
  }

  render();
})();
