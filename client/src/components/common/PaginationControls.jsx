import { ChevronLeft, ChevronRight } from "lucide-react";

function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-white/10 bg-surface-panel/90 px-4 py-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2 disabled:cursor-not-allowed disabled:text-white/30"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2 disabled:cursor-not-allowed disabled:text-white/30"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
