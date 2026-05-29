export function findById<T extends { id: string }>(
  items: T[],
  id: string,
  fallbackIndex = 0,
) {
  return items.find((item) => item.id === id) ?? items[fallbackIndex];
}
