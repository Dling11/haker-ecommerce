function AdminStatCard({ label, value, hint }) {
  return (
    <article className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">
        {label}
      </p>
      <h3 className="mt-3 text-3xl font-black text-brand-900">{value}</h3>
      <p className="mt-2 text-sm text-ink-500">{hint}</p>
    </article>
  );
}

export default AdminStatCard;
