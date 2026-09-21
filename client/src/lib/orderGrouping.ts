export type OrderLine = {
  article_id: number;
  article_title: string;
  article_author?: string;
  quantity: number;
  total_amount: number;
};

type OrderRow = {
  id: number;
  order_group_id?: string | null;
  article_id: number;
  article_title: string;
  article_author?: string;
  quantity: number;
  total_amount: number;
  created_at: string;
};

export type GroupedOrder<T extends OrderRow> = Omit<T, "items"> & {
  items: OrderLine[];
  item_count: number;
};

export const groupOrders = <T extends OrderRow>(
  rows: T[],
): GroupedOrder<T>[] => {
  const groups = new Map<string, GroupedOrder<T>>();

  for (const row of rows) {
    const key = row.order_group_id || `legacy-${row.id}`;
    const item: OrderLine = {
      article_id: row.article_id,
      article_title: row.article_title,
      article_author: row.article_author,
      quantity: Number(row.quantity),
      total_amount: Number(row.total_amount),
    };
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      existing.quantity += item.quantity;
      existing.total_amount += item.total_amount;
      existing.item_count += 1;
    } else {
      groups.set(key, {
        ...row,
        quantity: item.quantity,
        total_amount: item.total_amount,
        items: [item],
        item_count: 1,
      });
    }
  }

  return [...groups.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};
