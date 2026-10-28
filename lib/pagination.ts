export type PageSlice<T> = { items: T[]; page: number; pages: number; total: number; from: number; to: number };

/** Страница списка: номер приводится к допустимому (после удаления или обновления списка не уходит за последнюю). */
export function paginate<T>(list: readonly T[], page: number, size: number): PageSlice<T> {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(pages, Math.max(1, Math.floor(page) || 1));
  const start = (current - 1) * size;
  const items = list.slice(start, start + size);
  return { items, page: current, pages, total, from: total ? start + 1 : 0, to: start + items.length };
}
