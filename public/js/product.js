(async function () {
  initLayout();
  const app = document.getElementById("app");
  const id = qs("id");

  let p;
  try {
    p = (await loadCatalog()).products.find((x) => x.id === id);
  } catch (e) {
    app.innerHTML = `<div class="empty">${esc(e.message)}</div>`;
    return;
  }
  if (!p) {
    app.innerHTML = `<div class="empty">Không tìm thấy sản phẩm.<br><a href="/" class="btn">Về trang chủ</a></div>`;
    return;
  }
  document.title = `${p.name} - ${SHOP_NAME}`;
  const inStock = p.stock > 0;

  app.innerHTML = `
    <nav class="breadcrumb">
      <a href="/">Trang chủ</a> › <a href="/?category=${encodeURIComponent(p.category_id)}">${esc(p.category_name)}</a> › ${esc(p.name)}
    </nav>
    <section class="detail">
      <div class="detail-img">${img(p.image, p.name)}</div>
      <div>
        <div class="card-cat">${esc(p.category_name)}</div>
        <h1>${esc(p.name)}</h1>
        <div class="price">${money(p.price)}</div>
        <div class="stock">Tình trạng: ${inStock ? `<b>Còn hàng</b> (tồn kho: ${p.stock})` : `<b class="out">Hết hàng</b>`}</div>
        <div class="desc"><h3>Mô tả sản phẩm</h3><p>${esc(p.description || "Đang cập nhật.")}</p></div>
        <div class="buy-row">
          <div class="qty">
            <button type="button" id="minus">−</button>
            <input type="number" id="qty" value="1" min="1" max="${p.stock}">
            <button type="button" id="plus">+</button>
          </div>
          <button class="btn" id="add" ${inStock ? "" : "disabled"}>Thêm vào giỏ hàng</button>
          <button class="btn btn-outline" id="buy" ${inStock ? "" : "disabled"}>Mua ngay</button>
        </div>
      </div>
    </section>`;

  const q = document.getElementById("qty");
  const clamp = (v) => Math.max(1, Math.min(Number(v) || 1, p.stock || 1));
  document.getElementById("minus").onclick = () => (q.value = clamp(q.value - 1));
  document.getElementById("plus").onclick = () => (q.value = clamp(+q.value + 1));
  q.onchange = () => (q.value = clamp(q.value));
  document.getElementById("add").onclick = () => {
    Cart.add(p, clamp(q.value));
    toast("Đã thêm vào giỏ hàng");
  };
  document.getElementById("buy").onclick = () => {
    Cart.add(p, clamp(q.value));
    location.href = "/cart";
  };
})();
