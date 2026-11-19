(async function () {
  initLayout();
  const app = document.getElementById("app");
  const category = qs("category");
  const search = qs("search").trim();

  let data;
  try {
    data = await loadCatalog();
  } catch (e) {
    app.innerHTML = `<div class="empty">${esc(e.message)}</div>`;
    return;
  }

  const { categories } = data;
  const term = search.toLowerCase();
  const products = data.products.filter(
    (p) => (!category || p.category_id === category) && (!term || p.name.toLowerCase().includes(term))
  );
  const current = categories.find((c) => c.id === category);
  const title = search ? `Kết quả tìm kiếm cho “${esc(search)}”` : current ? esc(current.name) : "Sản phẩm nổi bật";
  if (current) document.title = `${current.name} - ${SHOP_NAME}`;

  const hero = !category && !search
    ? `<section class="hero">
         <h1>Khám phá Vẻ đẹp<br>Tự nhiên cùng <span>${SHOP_NAME}</span></h1>
         <p>Hệ thống cung cấp mỹ phẩm chính hãng hàng đầu, mang lại vẻ đẹp tỏa sáng và sự tự tin trọn vẹn cho làn da của bạn.</p>
         <a href="#shop" class="btn">Mua sắm ngay</a>
       </section>`
    : "";

  const cats = [`<a href="/" class="${!category ? "active" : ""}">Tất cả sản phẩm</a>`]
    .concat(categories.map((c) => `<a href="/?category=${encodeURIComponent(c.id)}" class="${c.id === category ? "active" : ""}">${esc(c.name)}</a>`))
    .join("");

  const cards = products.length
    ? `<div class="grid">${products.map((p) => `
        <article class="card">
          <a href="/product?id=${encodeURIComponent(p.id)}" class="card-img">${img(p.image, p.name)}</a>
          <div class="card-body">
            <div class="card-cat">${esc(p.category_name)}</div>
            <a href="/product?id=${encodeURIComponent(p.id)}" class="card-name">${esc(p.name)}</a>
            <div class="card-foot">
              <span class="price">${money(p.price)}</span>
              <button class="add-btn" data-id="${esc(p.id)}" title="Thêm vào giỏ hàng" ${p.stock > 0 ? "" : "disabled"}>+</button>
            </div>
          </div>
        </article>`).join("")}</div>`
    : `<div class="empty">Không tìm thấy sản phẩm phù hợp.<br><a href="/" class="btn">Xem tất cả sản phẩm</a></div>`;

  app.innerHTML = `${hero}
    <div class="shop" id="shop">
      <aside class="sidebar"><h3>Danh mục mỹ phẩm</h3>${cats}</aside>
      <section>
        <div class="section-head"><h2>${title}</h2><small>Hiển thị ${products.length} sản phẩm</small></div>
        ${cards}
      </section>
    </div>`;

  app.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    const p = products.find((x) => x.id === btn.dataset.id);
    Cart.add(p, 1);
    toast(`Đã thêm “${p.name}” vào giỏ hàng`);
  });
})();
