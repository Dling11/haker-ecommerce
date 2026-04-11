import AppModal from "./AppModal";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
}) {
  const confirmClass =
    tone === "danger"
      ? "rounded-[10px] bg-rose-500 px-5 py-3 text-sm font-semibold text-white"
      : "rounded-[10px] bg-white px-5 py-3 text-sm font-semibold text-[#10141b]";

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={title} description={description} width="max-w-md">
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={confirmClass}>
          {confirmLabel}
        </button>
      </div>
    </AppModal>
  );
}

export default ConfirmModal;
