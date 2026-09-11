interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalItems, pageSize = 10, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500">
      <span>{firstItem}–{lastItem} sur {totalItems}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <span className="min-w-20 text-center font-mono font-bold text-slate-700">Page {page} / {totalPages}</span>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
