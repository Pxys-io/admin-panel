

## ✅ 1. **FULL LIST OF API ENDPOINTS**

All endpoints are prefixed with:  
`{base_url}/admin/`

> *Note: Replace `{base_url}` with your actual domain (e.g., `http://localhost:8000` or `https://yourapp.com`)*

### 🔐 Authentication & Notifications
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `home/get_notification` | GET | Fetch unread notification count |
| `home/new_notification_list` | GET | Fetch full list of notifications |
| `Notification_settings/mark_all_as_read` | GET | Mark all notifications as read |

---

### 🛍️ Product Management
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `product/bulk_update_affiliate` | POST | Bulk toggle affiliate status |
| `manage_stock/get_variant_data` | GET | Load product variant for stock edit |
| `manage_stock/update_stock` *(inferred)* | POST | Adjust stock (form action) |
| `product/manage` *(inferred from form)* | POST/PUT | Create/update product |
| `attribute_sets/manage` | POST | CRUD attribute sets |
| `attributes/manage` | POST | CRUD attributes |
| `attribute_values/manage` | POST | CRUD attribute values |

---

### 📂 Category / Blog / Brand
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `category/manage` | POST | CRUD categories |
| `category/get_categories?from_select=1` | GET | Load categories for dropdown |
| `category/update_category_order` | GET (via query params) | Save drag-and-drop order |
| `blogs/manage` | POST | CRUD blog posts |
| `blog_category/manage` | POST | CRUD blog categories |
| `brands/manage` | POST | CRUD brands |

---

### 📦 Orders & Logistics
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `orders/edit_orders` | GET (with `?edit_id=`) | View/edit order |
| `orders/get-order-tracking` | GET | Fetch tracking history |
| `orders/update_order_status` | POST | Update order/consignment status |
| `orders/create_consignment` | POST | Create shipping consignment |
| `orders/delete_consignment` | POST | Delete consignment |
| `orders/update_shiprocket_order_status` | POST | Refresh Shiprocket tracking |

---

### 🎯 Marketing & Promotions
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `promo_code/manage` | POST | CRUD promo codes |
| `slider/manage` | POST | CRUD homepage sliders |
| `offer/manage` | POST | CRUD offers/banners |
| `featured_sections/manage` | POST | CRUD featured homepage sections |
| `featured_sections/update_section_order` | GET (query params) | Save section drag order |

---

### 🧾 Returns & Support
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `return-request/manage` | POST | CRUD return requests |
| `return-request/update` | POST | Update return status |
| `return-request/get_seller_id/{order_item_id}` | GET | Fetch seller for return |
| `tickets/manage` | POST | Create ticket |
| `tickets/get_ticket_messages` | GET | Load ticket messages |
| `tickets/edit-ticket-status` | POST | Update ticket status |

---

### 🚚 Delivery & Location
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `delivery_boys/manage` | POST | CRUD delivery boys |
| `delivery_boys/fund_transfer` | POST | Transfer wallet balance |
| `cities/manage` | POST | CRUD cities |
| `zipcode/manage` | POST | CRUD zipcodes |
| `pickup_location/manage` | POST | CRUD seller pickup locations |

---

### 💰 Finance & Wallet
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `Transaction_settings/manage` | POST | View transactions |
| `wallet/manage_customer_wallet` | POST | Credit/debit customer wallet |
| `payment-request/view-payment-request-list` | GET | List payout requests |
| `payment-request/update` | POST | Approve/reject payout |

---

### 🔁 Cron & Settlements (Manual Triggers)
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `cron_job/settle_cashback_discount` | GET | Settle promo code discounts |
| `cron_job/settle_referal_cashback_discount` | GET | Settle referral cashback |
| `cron_job/settle_referal_cashback_discount_for_referal` | GET | Settle referral earnings |
| `cron-job/settle_affiliate_commission` | GET | Settle affiliate commissions |
| `cron-job/settle-seller-commission` | GET | Settle seller commissions |

---

### ⚙️ System & Settings
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `themes/switch` | POST | Activate/deactivate theme |
| `language/manage` | POST | CRUD languages |
| `language/set_default_for_web` | POST | Set default language |
| `Sms_gateway_settings/add_sms_data` | POST | Save SMS gateway config |
| `updater/upload_update_file` | POST | Upload system/plugin ZIP |
| `settings/update_system_settings` *(inferred)* | POST | Save general settings |

---

### 👥 Users & Roles
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `sellers/add_seller` | POST | Add new seller |
| `sellers/get_seller_commission_data` | POST | Load seller commission rules |
| `sellers/remove_sellers` | GET | Soft-delete seller |
| `system_users/manage` | POST | CRUD admin users |
| `affiliate/manage` | POST | CRUD affiliate users |

---

### 📊 Reports & Analytics
| Endpoint | Method | Purpose |
|--------|--------|--------|
| `home/fetch_sales` | GET | Dashboard sales chart data |
| `home/category_wise_product_sales` | GET | Category-wise sales (pie) |
| `home/get_revenue_chart_data?period={daily/weekly/monthly}` | GET | Revenue trend |
| `home/get_stats_data?period={last_7_days/...}` | GET | Orders/customers stats |
| `sales_inventory/top_selling_products` | GET | Top products (for pie chart) |
| `sales_report/view` | GET | Sales report table |

---

## ✅ 2. **FORMS → ENDPOINT MAPPING**

| Form ID / Class | Submits To | Key Fields |
|----------------|-----------|----------|
| `#add_product_form` | `product/manage` | `name`, `category_id`, `variants[]`, `other_images[]`, `seo_*` |
| `#stock_adjustment_form` | `manage_stock/update_stock` | `variant_id`, `quantity`, `type` (add/subtract) |
| `#add_promocode` | `promo_code/manage` | `promo_code`, `discount`, `start_date`, `is_cashback`, `image` |
| `#addSlider` | `slider/manage` | `type`, `link`, `image` |
| `#addOffer` | `offer/manage` | `type`, `link`, `image` |
| `#addFeatureSection` | `featured_sections/manage` | `title`, `style`, `product_type`, `image`, `seo_*` |
| `#bulkAffiliateForm` | `product/bulk_update_affiliate` | `product_ids[]`, `is_in_affiliate` |
| `#sellerCommission` | `sellers/add_seller` | `category_id[]`, `commission[]` (JSON in `cat_data`) |
| `#smsgateway_setting_form` | `Sms_gateway_settings/add_sms_data` | `header_key[]`, `header_value[]`, `body_key[]`, etc. |
| `#update_customer_wallet_form` | `wallet/manage_customer_wallet` | `user_id`, `amount`, `type` (credit/debit), `message` |
| `#return_request_form` | `return-request/update` | `return_request_id`, `status`, `delivery_boy_id` |
| `#ticket_send_msg_form` | `tickets/manage` | `ticket_id`, `message`, `attachments[]` |

---

## ✅ 3. **DATA MODELS (as JSON Schema)**

### 📦 Product Variant
```json
{
  "id": "number",
  "product_id": "number",
  "stock": "number",
  "price": "number",
  "discounted_price": "number?",
  "attributes": [
    { "attribute_id": "number", "value_id": "number" }
  ],
  "images": ["string"]
}
```

### 🎟️ Promo Code
```json
{
  "id": "number?",
  "promo_code": "string",
  "message": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "discount": "number",
  "discount_type": "percentage|fixed",
  "max_discount_amount": "number?",
  "minimum_order_amount": "number",
  "no_of_users": "number",
  "no_of_repeat_usage": "number?",
  "is_cashback": "0|1",
  "list_promocode": "0|1",
  "status": "0|1",
  "image": "string?"
}
```

### 📦 Order Consignment (Shiprocket)
```json
{
  "consignment_id": "number",
  "order_id": "number",
  "order_item_ids": ["number"],
  "courier_agency": "string",
  "tracking_id": "string",
  "url": "string",
  "status": "pending|shipped|delivered|returned"
}
```

### 💬 Custom Notification Template
```json
{
  "id": "number?",
  "title": "string",
  "message": "string", // contains placeholders like {order_id}
  "type": "place_order|delivery_boy_order_deliver|...",
  "send_to": "all|specific_user",
  "user_id": "number?"
}
```

### 👨‍💼 Seller Commission Rule
```json
{
  "seller_id": "number",
  "commissions": [
    { "category_id": "number", "commission": "number" }
  ]
}
```

### 📱 SMS Gateway Config (Sent as FormData, stored as JSON)
```json
{
  "header_key": ["string"],
  "header_value": ["string"],
  "body_key": ["string"],
  "body_value": ["string"],
  "params_key": ["string"],
  "params_value": ["string"],
  "auth_method": "basic|bearer",
  "account_sid": "string",
  "auth_token": "string"
}
```

---

## ✅ 4. **QUERY PARAMS MAP (for Bootstrap Table)**

Your JS uses dynamic query builders. Here’s the mapping:

| Table Selector | Query Param Function | Filters Sent |
|----------------|----------------------|-------------|
| `#products_table` | `product_query_params` | `category_id`, `seller_id`, `status`, `brand_id` |
| `#orders_table` | `orders_query_params` | `start_date`, `end_date`, `order_status`, `payment_method`, `seller_id` |
| `#promo_code_table` | `promo_code_queryParams` | `discount_type_filter`, `status_filter` |
| `#return_request_table` | `return_request_queryParams` | `status_filter`, `seller_filter` |
| `#customer-transaction-table` | `customer_wallet_query_params` | `user_id`, `status`, `payment_type` |
| `#sales_report_table` | `sales_report_query_params` | `start_date`, `end_date`, `seller_id`, `payment_method_filter`, `order_status_filter` |

> 💡 **Tip for Vite**: When calling these APIs, always include CSRF token if your backend requires it:
> ```js
> const response = await axios.post('/admin/product/manage', data, {
>   headers: { 'X-Csrf-Token': csrfToken }
> });
> ```

---

## ✅ 5. **NOTABLE PLACEHOLDERS & DYNAMIC UI RULES**

### Notification Message Placeholders
Clicking these inserts into message field:
- `{order_id}`
- `{customer_name}`
- `{delivery_boy_name}`
- `{amount}`
- `{ticket_id}`
- `{promo_code}`

### Conditional UI Logic (JS-driven)
| Trigger Field | Value | Shows |
|--------------|------|-------|
| `.type_event_trigger` | `categories` | `.slider-categories`, `.offer-categories` |
| | `products` | `.slider-products`, `.offer-products` |
| | `sliderurl` | `.slider-url` |
| `.bonus_type` | `fixed_amount_per_order_item` | `.fixed_amount_per_order` |
| | `percentage_per_order_item` | `.percentage_per_order` |
| `.product_type` | `digital_product` | `.digital_products` |

---

## ✅ NEXT STEPS FOR YOUR VITE APP

1. **Create an `api/` folder** with services like:
   - `productService.js`
   - `orderService.js`
   - `promoCodeService.js`
2. **Define Zod schemas** or TypeScript interfaces using the JSON models above.
3. **Use Axios interceptors** to inject CSRF & handle auth.
4. **Replicate Bootstrap Table logic** using TanStack Table or similar.
5. **Use Pinia/Vuex** to manage global state (e.g., `base_url`, `csrfToken`, `currency`).

---

Would you like me to generate:
- A **Postman collection JSON** of all these endpoints?
- **TypeScript interfaces** for all data models?
- **Axios service files** ready for Vite + Vue/React?

Let me know!