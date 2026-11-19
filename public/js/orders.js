(function () {
  initLayout();
  const app = document.getElementById("app");
  const orders = Orders.all();

  const fresh = qs("new");
  const banner = fresh && orders.some((o) => o.id === fresh)
    ? `<div class="alert success show">🎉 Đặt hàng thành công! Mã đơn hàng của bạn là <b>${esc(fresh)}</b>. Chúng tôi sẽ liên hệ xác nhận sớm.</div>`
    : "";

  const list = orders.length
    ? orders.map((o) => `
      <section class="panel order">
        <div class="order-head">
          <div><b>Đơn hàng #${esc(o.id)}</b><small>Đặt lúc ${esc(new Date(o.created_at).toLocaleString("vi-VN"))}</small></div>
          <span class="status">${esc(o.status)}</span>
        </div>
        <div class="order-items">
          ${(o.items || []).map((i) => `<div><span>${esc(i.name)} × ${Number(i.quantity)}</span><span>${money(i.price * i.quantity)}</span></div>`).join("")}
        </div>
        <div class="order-foot">
          <span>Giao đến: ${esc(o.full_name)} · ${esc(o.phone)} · ${esc(o.address)}<br>
          Thanh toán: ${o.payment === "BANK" ? "Chuyển khoản" : "Khi nhận hàng (COD)"}</span>
          <span>Tổng tiền: <b>${money(o.total)}</b></span>
        </div>
      </section>`).join("")
    : `<div class="empty">Bạn chưa có đơn hàng nào.<br><a href="/" class="btn">Bắt đầu mua sắm</a></div>`;

  app.innerHTML = `${banner}<div class="section-head"><h2>Đơn hàng của tôi</h2><small>${orders.length} đơn hàng</small></div>${list}`;
})();
