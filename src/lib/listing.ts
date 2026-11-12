const ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
export type Draft = { title: string; price: number; sizes: Record<string, number> };
/** Parses notes like "Olive tee, S-L, $48, 5 each" */
export function parseNote(note: string): Draft {
  const price = Number(note.match(/\$\s?(\d+(?:\.\d+)?)/)?.[1] ?? 0);
  const qty = Number(note.match(/(\d+)\s*(?:each|units|pcs)/i)?.[1] ?? 1);
  const sizes: Record<string, number> = {};
  const range = note.match(/\b(XS|S|M|L|XL|XXL)\s*(?:-|–|to)\s*(XS|S|M|L|XL|XXL)\b/i);
  if (range) {
    const a = ORDER.indexOf((range[1] ?? "").toUpperCase()), b = ORDER.indexOf((range[2] ?? "").toUpperCase());
    ORDER.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((s) => (sizes[s] = qty));
  } else {
    (note.toUpperCase().match(/\b(XS|S|M|L|XL|XXL)\b/g) || []).forEach((s) => (sizes[s] = qty));
  }
  if (!Object.keys(sizes).length) sizes["One size"] = qty;
  const first = (note.split(",")[0] ?? "").trim();
  return { title: first ? first.replace(/\b\w/g, (c) => c.toUpperCase()) : "New item", price, sizes };
}
