import { ChevronLeft, ChevronRight } from "lucide-react";

function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-violet-100 bg-white px-4 py-4 text-sm text-slate-600 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <p className="font-medium text-slate-600">
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="inline-flex items-center gap-2 rounded-[10px] border border-violet-100 bg-white px-4 py-2 font-medium text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="inline-flex items-center gap-2 rounded-[10px] border border-violet-100 bg-white px-4 py-2 font-medium text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
