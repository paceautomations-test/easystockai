export const SHOP_DOMAIN = "easystock-dev-2wcte9hv.myshopify.com";
const URL_ = `https://${SHOP_DOMAIN}/admin/api/2026-10/graphql.json`;
// WARNING: Revoke this token in Shopify immediately and use process.env.SHOPIFY_TOKEN
const TOKEN = import.meta.env.VITE_SHOPIFY_TOKEN;

export type Variant = { id: string; title: string; inventoryQuantity: number; price: string };
export type Product = { id: string; title: string; image?: string; variants: Variant[] };

const QUERY = `{
  products(first: 100, sortKey: UPDATED_AT, reverse: true) {
    edges {
      node {
        id
        title
        images(first: 1) { edges { node { url } } }
        variants(first: 20) { edges { node { id title price inventoryQuantity } } }
      }
    }
  }
}`;

type Raw = {
  id: string;
  title: string;
  images: { edges: { node: { url: string } }[] };
  variants: { edges: { node: Variant }[] };
};

export async function fetchInventory(): Promise<Product[]> {
  const res = await fetch(URL_, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query: QUERY }),
  });

  if (res.status === 402) throw new Error("Your Shopify store needs an active plan to share inventory.");
  if (!res.ok) throw new Error(`Shopify error ${res.status}`);
  
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(", "));
  
  return (json.data.products.edges as { node: Raw }[]).map(({ node }) => ({
    id: node.id,
    title: node.title,
    image: node.images.edges[0]?.node.url,
    variants: node.variants.edges.map((e) => e.node),
  }));
}
