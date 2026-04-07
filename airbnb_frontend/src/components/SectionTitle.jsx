function SectionTitle({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-10">
      {badge && (
        <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h2>
      {subtitle && (
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

export default SectionTitle;