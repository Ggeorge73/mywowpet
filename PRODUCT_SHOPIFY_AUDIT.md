# Shopify Product Mapping Audit

## Current status

The local site catalog contains 24 products and `js/store.js` now stores both Shopify product IDs and Shopify variant IDs for local product IDs 1 through 24.

## Production risk addressed

The prior implementation assigned a fallback Shopify product ID when a local product did not have an explicit Shopify mapping. That can cause the wrong Shopify product to be displayed or purchased if a new local product is added without a Shopify ID.

## Required launch validation

Before production traffic, confirm each local product maps to the intended Shopify product and variant in Shopify Admin.

Recommended audit columns:

- Local product ID
- Local product name
- Local price
- Local weight
- Shopify product ID
- Shopify product title
- Shopify variant ID
- Shopify price
- Shopify inventory status
- Shopify image
- Match status
- Notes

## Expected behavior after this fix

If a local product does not have a Shopify variant ID, the product page disables purchase and the cart refuses to create a Shopify checkout for that item.

## Verified Shopify variant IDs

| Local ID | Shopify product ID | Shopify variant ID |
| --- | --- | --- |
| 1 | 7989696430163 | 45593123192915 |
| 2 | 7989696462931 | 45593123225683 |
| 3 | 7989696561235 | 45593123323987 |
| 4 | 7989696626771 | 45593123487827 |
| 5 | 7989696790611 | 45593123651667 |
| 6 | 7989696921683 | 45593125060691 |
| 7 | 7989696987219 | 45593125126227 |
| 8 | 7989697019987 | 45593125158995 |
| 9 | 7989697052755 | 45593125191763 |
| 10 | 7989697085523 | 45593125814355 |
| 11 | 7989697151059 | 45593125879891 |
| 12 | 7989697183827 | 45593125912659 |
| 13 | 7989697216595 | 45593125945427 |
| 14 | 7989697249363 | 45593125978195 |
| 15 | 7989697314899 | 45593126043731 |
| 16 | 7989697609811 | 45593126338643 |
| 17 | 7989697642579 | 45593126371411 |
| 18 | 7989697675347 | 45593126404179 |
| 19 | 7989697740883 | 45593139413075 |
| 20 | 7989697839187 | 45593139970131 |
| 21 | 7989697871955 | 45593140002899 |
| 22 | 7989698199635 | 45593140461651 |
| 23 | 7989698297939 | 45593143902291 |
| 24 | 7989698330707 | 45593143967827 |
