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
  // Fetch from the local Vite proxy, NOT directly from Shopify.
  const res = await fetch("/api/shopify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(", "));
  
  return (json.data.products.edges as { node: Raw }[]).map(({ node }) => ({
    id: node.id,
    title: node.title,
    image: node.images.edges[0]?.node.url,
    variants: node.variants.edges.map((e) => e.node),
  }));
}
