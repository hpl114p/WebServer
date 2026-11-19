# THEANHJewelry – Website bán mỹ phẩm

Website tĩnh (HTML/CSS/JS), chạy trên **Cloudflare Pages** — không cần database, không cần build.

Chức năng: trang chủ, lọc theo danh mục, tìm kiếm, chi tiết sản phẩm, giỏ hàng, đặt hàng, xem lại đơn hàng
(giỏ hàng và đơn hàng được lưu trên trình duyệt của khách).

```
public/
  index.html, product.html, cart.html, orders.html, 404.html
  style.css
  js/                 Code từng trang
  data/products.json  Danh mục + sản phẩm (sửa file này để thêm/bớt sản phẩm)
  images/             Ảnh sản phẩm
wrangler.toml         Cho Cloudflare biết thư mục web là "public"
```

## Triển khai lên Cloudflare
1. Đẩy code lên GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → chọn repo → **Save and Deploy**.
   (Nếu được hỏi: Framework preset **None**, Build command để trống, Build output directory **`public`**.)
3. Xong — website có địa chỉ `https://<tên-project>.pages.dev`.

Muốn dùng **WAF**, gắn tên miền riêng: project → **Custom domains** (tên miền phải được thêm vào Cloudflare trước).

## Xem thử trên máy
```bash
npx wrangler pages dev
```
Mở http://localhost:8788

## Thêm sản phẩm
Thêm một mục vào `public/data/products.json` và chép ảnh vào `public/images/`, rồi `git push`.

## Dùng kèm Cloudflare WAF
Tạo rule tại **Security → WAF → Custom rules** (Action: Block):

| Rule | Expression | Thử bằng |
|------|-----------|----------|
| Chặn XSS | `lower(url_decode(http.request.uri.query)) contains "<script"` | `/?search=<script>alert(1)</script>` |
| Chặn SQLi | `lower(url_decode(http.request.uri.query)) contains "' or '1'='1" or lower(url_decode(http.request.uri.query)) contains "union select"` | `/product?id=1' OR '1'='1` |
| Chặn công cụ quét | `lower(http.user_agent) contains "sqlmap"` | `curl -A sqlmap https://tenmien/` |

Xem nhật ký tại **Security → Events**.
