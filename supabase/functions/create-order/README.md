# create-order

Public guest-checkout function. It ignores client prices, reads current prices
and stock from `products`, stores `orders` and `order_items`, then sends an
owner notification through Resend.

Required project secrets:

- `RESEND_API_KEY`
- `ORDER_NOTIFICATION_EMAIL`
- `ORDER_FROM_EMAIL` (optional after verifying a sending domain)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by the Supabase
Edge Functions environment.
