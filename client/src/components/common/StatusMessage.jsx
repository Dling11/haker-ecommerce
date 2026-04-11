function StatusMessage({ type = "info", message }) {
  if (!message) {
    return null;
  }

  const toneMap = {
    info: "border-sky-500/20 bg-sky-500/10 text-sky-200",
    error: "border-rose-500/20 bg-rose-500/10 text-rose-200",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  };

  return (
    <div className={`rounded-[10px] border px-4 py-3 text-sm ${toneMap[type]}`}>
      {message}
    </div>
  );
}

export default StatusMessage;
