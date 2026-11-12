export const SHOP_DOMAIN = "easystock-dev-2wcte9hv.myshopify.com";
const URL_ = `https://${SHOP_DOMAIN}/api/2026-10/graphql.json`;
const TOKEN = "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";

export type Variant = { id: string; title: string; quantityAvailable: number | null; availableForSale: boolean };
export type Product = { id: string; title: string; price: string; currency: string; image?: string | undefined; variants: Variant[] };

const QUERY = `{ products(first: 100, sortKey: UPDATED_AT, reverse: true) { edges { node {
  id title priceRange { minVariantPrice { amount currencyCode } }
  images(first: 1) { edges { node { url } } }
  variants(first: 20) { edges { node { id title quantityAvailable availableForSale } } }
} } } }`;

type Raw = { id: string; title: string; priceRange: { minVariantPrice: { amount: string; currencyCode: string } }; images: { edges: { node: { url: string } }[] }; variants: { edges: { node: Variant }[] } };

export async function fetchInventory(): Promise<Product[]> {
  const res = await fetch(URL_, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN }, body: JSON.stringify({ query: QUERY }) });
  if (res.status === 402) throw new Error("Your Shopify store needs an active plan to share inventory.");
  if (!res.ok) throw new Error(`Shopify error ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(", "));
  return (json.data.products.edges as { node: Raw }[]).map(({ node }) => ({
    id: node.id, title: node.title,
    price: node.priceRange.minVariantPrice.amount, currency: node.priceRange.minVariantPrice.currencyCode,
    image: node.images.edges[0]?.node.url,
    variants: node.variants.edges.map((e) => e.node),
  }));
}
