function HomepageBannerSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
      <div className="relative overflow-hidden rounded-[10px] border border-slate-200/70 bg-white shadow-soft lg:row-span-2">
        <div className="min-h-[360px] animate-pulse bg-[linear-gradient(135deg,#e5e7eb_0%,#f8fafc_52%,#d4d4d8_100%)] sm:min-h-[420px] lg:min-h-[656px]" />
        <div className="absolute inset-0 flex h-full flex-col justify-end p-6 sm:p-7">
          <div className="max-w-[26rem] space-y-4">
            <div className="h-8 w-28 rounded-full bg-white/55" />
            <div className="h-12 w-full max-w-xl rounded-[12px] bg-white/65 sm:h-14" />
            <div className="h-5 w-full max-w-lg rounded-full bg-white/45" />
            <div className="h-5 w-3/4 max-w-md rounded-full bg-white/45" />
            <div className="h-11 w-32 rounded-[10px] bg-white/65" />
          </div>
        </div>
      </div>

      {[0, 1].map((item) => (
        <div
          key={item}
          className="relative overflow-hidden rounded-[10px] border border-slate-200/70 bg-white shadow-soft"
        >
          <div className="min-h-[280px] animate-pulse bg-[linear-gradient(135deg,#e7e5e4_0%,#f8fafc_52%,#d4d4d8_100%)] sm:min-h-[320px]" />
          <div className="absolute inset-0 flex h-full flex-col justify-end p-6 sm:p-7">
            <div className="max-w-[20rem] space-y-4">
              <div className="h-8 w-24 rounded-full bg-white/55" />
              <div className="h-10 w-full rounded-[12px] bg-white/65" />
              <div className="h-5 w-full rounded-full bg-white/45" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default HomepageBannerSkeleton;
