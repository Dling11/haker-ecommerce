import { LoaderCircle } from "lucide-react";

import AppModal from "./AppModal";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  isLoading = false,
  loadingLabel = "Working...",
}) {
  const confirmClass =
    tone === "danger"
      ? "rounded-[10px] bg-rose-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-rose-300"
      : "rounded-[10px] bg-white px-5 py-3 text-sm font-semibold text-[#10141b] disabled:cursor-not-allowed disabled:bg-white/60";

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={title} description={description} width="max-w-md">
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`inline-flex items-center justify-center gap-2 ${confirmClass}`}
        >
          {isLoading ? <LoaderCircle size={16} className="animate-spin" /> : null}
          {isLoading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </AppModal>
  );
}

export default ConfirmModal;
