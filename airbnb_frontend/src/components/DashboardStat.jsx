function DashboardStat({ title, value, hint }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <p className="text-slate-500 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      {hint && <p className="text-slate-400 text-sm mt-2">{hint}</p>}
    </div>
  );
}

export default DashboardStat;