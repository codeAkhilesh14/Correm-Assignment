import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { TableSkeleton, ChartSkeleton } from "../components/LoadingSkeleton";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  ArrowUpDown,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// ─── Category badge colour map ────────────────────────────────────────────────
const BADGE_STYLES = {
  "Salary": "bg-emerald-500/10 text-emerald-600 border-emerald-400/30",
  "EMI / Loan": "bg-rose-500/10 text-rose-600 border-rose-400/30",
  "Rent": "bg-blue-500/10 text-blue-600 border-blue-400/30",
  "Food & Dining": "bg-orange-500/10 text-orange-600 border-orange-400/30",
  "UPI / Transfer": "bg-indigo-500/10 text-indigo-600 border-indigo-400/30",
  "Cash Withdrawal": "bg-slate-400/10 text-slate-600 border-slate-400/30",
  "Shopping": "bg-purple-500/10 text-purple-600 border-purple-400/30",
  "Travel": "bg-sky-500/10 text-sky-600 border-sky-400/30",
  "Healthcare": "bg-red-500/10 text-red-600 border-red-400/30",
  "Investments": "bg-teal-500/10 text-teal-600 border-teal-400/30",
  "Insurance": "bg-cyan-500/10 text-cyan-600 border-cyan-400/30",
  "Utilities": "bg-yellow-400/10 text-yellow-700 border-yellow-400/30",
  "Telecom": "bg-violet-500/10 text-violet-600 border-violet-400/30",
  "Entertainment": "bg-pink-500/10 text-pink-600 border-pink-400/30",
  "Education": "bg-lime-500/10 text-lime-700 border-lime-400/30",
  "Other": "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200/50 dark:border-white/10",
};

const CHART_COLORS = [
  "#3362fc", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#64748b", "#a855f7", "#06b6d4",
];

function Badge({ cat }) {
  const cls = BADGE_STYLES[cat] || BADGE_STYLES["Other"];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${cls}`}>
      {cat}
    </span>
  );
}

// ─── Mini skeleton ────────────────────────────────────────────────────────────
function CardSkeletonMini() {
  return (
    <div className="glass-card p-6 rounded-2xl h-[130px] flex flex-col gap-3">
      <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
      <div className="h-6 w-1/2 rounded bg-slate-300 dark:bg-white/20 animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StatementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Table state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [txType, setTxType] = useState("All");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortField, setSortField] = useState("index");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res = await api.get(`/statements/${id}`);
      setStatement(res.data.statement);
      const txs = res.data.transactions.map((tx, idx) => ({ ...tx, index: idx }));
      setTransactions(txs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load statement details.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // ── Excel download ─────────────────────────────────────────────────────────
  const handleDownloadExcel = async () => {
    const toastId = toast.loading("Generating Excel report…");
    try {
      const token = localStorage.getItem("correm_token");
      const resp = await fetch(
        `${api.defaults.baseURL}/export/excel/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HDFC_Report_${id}.xlsx`;
      document.body.appendChild(a);
      a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel.", { id: toastId });
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-10">
        <div className="h-10 w-48 bg-slate-200 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeletonMini /><CardSkeletonMini /><CardSkeletonMini />
        </div>
        <ChartSkeleton />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (!statement) return null;

  const details = statement.accountDetails || {};
  const analytics = statement.analytics || {};
  const valReport = details.validationReport || {};
  const isSuccess = details.reconciliationStatus === "SUCCESS";

  // ── Filter + Sort + Paginate ───────────────────────────────────────────────
  const categoriesList = ["All", ...new Set(transactions.map((t) => t.category))];

  const filtered = transactions.filter((tx) => {
    const matchSearch = (tx.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.reference || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || tx.category === selectedCategory;
    const matchType = txType === "All" ||
      (txType === "Debit" && tx.debit > 0) ||
      (txType === "Credit" && tx.credit > 0);
    const amt = tx.debit > 0 ? tx.debit : tx.credit;
    const matchMin = minAmount === "" || amt >= parseFloat(minAmount);
    const matchMax = maxAmount === "" || amt <= parseFloat(maxAmount);
    return matchSearch && matchCat && matchType && matchMin && matchMax;
  });

  const sorted = [...filtered].sort((a, b) => {
    let vA = a[sortField], vB = b[sortField];
    if (sortField === "date" || sortField === "valueDate") {
      const p = (d) => { if (!d) return 0; const [dd, mm, yy] = d.split("/"); return new Date(`${yy.length === 2 ? "20" + yy : yy}-${mm}-${dd}`).getTime(); };
      vA = p(vA); vB = p(vB);
    }
    if (typeof vA === "string") return sortOrder === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
    return sortOrder === "asc" ? vA - vB : vB - vA;
  });

  const totalRows = sorted.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const pageRows = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
    setCurrentPage(1);
  };

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartBg = theme === "dark" ? "#0f172a" : "#ffffff";
  const chartGrid = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const chartAxis = theme === "dark" ? "#64748b" : "#94a3b8";

  const balanceTrend = (analytics.balanceTrend || []).map(t => ({ name: t.date, Balance: t.balance }));
  const monthlyFlow = (analytics.monthlySummary || []).map(m => ({ month: m.month, Inflow: m.credit, Outflow: m.debit }));
  const categoryPie = (analytics.categorySummary || [])
    .filter(c => c.debit > 0 || c.credit > 0)
    .map(c => ({ name: c.category, value: c.debit > 0 ? c.debit : c.credit }));

  const fmt = (n) => n?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "0.00";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-10">

      {/* ── Top nav + download ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-500 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <button
          onClick={handleDownloadExcel}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Download Excel Report (.xlsx)
        </button>
      </div>

      {/* ── Account info cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 — Account metadata */}
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-3">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Account Information</span>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-[10px] text-slate-500 block">ACCOUNT HOLDER</span>
              <span className="font-bold text-slate-800 dark:text-white">{details.accountHolderName || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">ACCOUNT NO</span>
                <span className="font-semibold text-xs">{details.accountNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">IFSC CODE</span>
                <span className="font-semibold text-xs">{details.ifsc || "N/A"}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">BANK & BRANCH</span>
              <span className="font-semibold text-xs truncate block">{details.bankName || "HDFC Bank"} — {details.branchName || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Card 2 — Statement period + balances */}
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-3">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Statement Period</span>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-bold">{details.startDate || "N/A"} — {details.endDate || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              ["Opening Balance", details.openingBalance, "text-slate-700 dark:text-white"],
              ["Closing Balance", details.closingBalance, "text-brand-500"],
              ["Total Credits", analytics.totalCredits, "text-emerald-500"],
              ["Total Debits", analytics.totalDebits, "text-red-500"],
            ].map(([label, val, cls]) => (
              <div key={label} className="p-2.5 bg-slate-50 dark:bg-white/3 rounded-xl border border-slate-200/30 dark:border-white/5">
                <span className="text-[9px] text-slate-400 block uppercase">{label}</span>
                <span className={`font-black text-sm ${cls}`}>₹{fmt(val || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Reconciliation */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Reconciliation</span>
              <p className={`text-lg font-black mt-1 ${isSuccess ? "text-emerald-500" : "text-red-500"}`}>
                {isSuccess ? "✓ Ledger Verified" : "⚠ Out of Balance"}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-white/3 rounded-xl border border-slate-200/30 dark:border-white/5">
            {isSuccess ? (
              <span className="text-[10px] text-slate-500 leading-relaxed block">
                All {valReport.totalTransactions || 0} transactions reconcile correctly. Zero dropped rows.
              </span>
            ) : (
              <div className="text-[10px] text-red-500 leading-relaxed space-y-1">
                <span>{valReport.mismatchCount} mismatch(es) detected.</span>
                {(valReport.mismatches || []).slice(0, 3).map((m, i) => (
                  <div key={i} className="pl-2 border-l border-red-400/30 font-normal">
                    • Tx #{m.index} ({m.date}): expected ₹{m.expected}, got ₹{m.actual}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 dark:bg-white/3 rounded-lg border border-slate-200/20">
              <span className="text-[9px] text-slate-400 block">Transactions</span>
              <span className="font-black">{analytics.transactionCount || 0}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-white/3 rounded-lg border border-slate-200/20">
              <span className="text-[9px] text-slate-400 block">Categorized</span>
              <span className="font-black text-brand-500">{analytics.categorizationPercentage || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Balance trend */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Balance Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3362fc" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3362fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                <XAxis dataKey="name" stroke={chartAxis} fontSize={10} tickLine={false} tick={{ fill: chartAxis }} />
                <YAxis stroke={chartAxis} fontSize={10} tickLine={false} tick={{ fill: chartAxis }} />
                <Tooltip contentStyle={{ background: chartBg, border: "none", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="Balance" stroke="#3362fc" strokeWidth={2} fillOpacity={1} fill="url(#balGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly cash flow */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Monthly Flow</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFlow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                <XAxis dataKey="month" stroke={chartAxis} fontSize={9} tickLine={false} tick={{ fill: chartAxis }} />
                <YAxis stroke={chartAxis} fontSize={9} tickLine={false} tick={{ fill: chartAxis }} />
                <Tooltip contentStyle={{ background: chartBg, border: "none", borderRadius: 8, fontSize: 12 }} />
                <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Category pie + Salary/EMI ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Pie chart */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Spend Distribution</h3>
          {categoryPie.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">No data</div>
          ) : (
            <>
              <div className="relative h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                      {categoryPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: chartBg, border: "none", borderRadius: 8, fontSize: 11 }} formatter={(v) => `₹${fmt(v)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Parsed</span>
                  <span className="text-xl font-black">{analytics.categorizationPercentage || 0}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 justify-center">
                {categoryPie.slice(0, 6).map((e, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {e.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Salary & EMI cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Salary */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Salary Detection</span>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-grow space-y-2 overflow-y-auto max-h-[180px] pr-1">
              {(!analytics.salaryDetection || analytics.salaryDetection.length === 0) ? (
                <p className="text-xs text-slate-400 text-center mt-8">No salary credits identified.</p>
              ) : analytics.salaryDetection.map((s, i) => (
                <div key={i} className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold truncate max-w-[130px]">{s.source}</span>
                    <span className="text-xs font-black text-emerald-500">₹{fmt(s.amount)}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-slate-500">
                    <span>{s.frequency}</span>
                    <span className="text-emerald-500 font-semibold">{Math.round(s.confidence * 100)}% conf.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMI */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">EMI / Recurring</span>
              <Layers className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex-grow space-y-2 overflow-y-auto max-h-[180px] pr-1">
              {(!analytics.emiDetection || analytics.emiDetection.length === 0) ? (
                <p className="text-xs text-slate-400 text-center mt-8">No recurring EMIs identified.</p>
              ) : analytics.emiDetection.map((e, i) => (
                <div key={i} className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold truncate max-w-[130px]">{e.source}</span>
                    <span className="text-xs font-black text-rose-500">₹{fmt(e.amount)}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-slate-500">
                    <span>{e.frequency}</span>
                    <span className="text-rose-500 font-semibold">{Math.round(e.confidence * 100)}% conf.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category breakdown table ──────────────────────────────────────── */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Category Summary</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-white/5">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                {["Category", "Total Debits (DR)", "Total Credits (CR)", "Tx Count"].map(h => (
                  <th key={h} className="p-3 font-bold text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(analytics.categorySummary || []).map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                  <td className="p-3"><Badge cat={c.category} /></td>
                  <td className="p-3 font-semibold text-red-500 text-right">
                    {c.debit > 0 ? `₹${fmt(c.debit)}` : "—"}
                  </td>
                  <td className="p-3 font-semibold text-emerald-500 text-right">
                    {c.credit > 0 ? `₹${fmt(c.credit)}` : "—"}
                  </td>
                  <td className="p-3 text-center font-bold">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Transaction Ledger ────────────────────────────────────────────── */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaction Ledger</h3>
            <span className="text-xs text-slate-500">{filtered.length} of {transactions.length} rows</span>
          </div>

          {/* Filter bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative col-span-2 sm:col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text" placeholder="Search narration or ref…"
                value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:border-brand-500 transition-all"
              />
            </div>

            {/* Category filter */}
            <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:border-brand-500 dark:text-white">
              {categoriesList.map(c => <option key={c}>{c}</option>)}
            </select>

            {/* Type filter */}
            <select value={txType} onChange={e => { setTxType(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:border-brand-500 dark:text-white">
              <option>All</option><option>Debit</option><option>Credit</option>
            </select>

            {/* Amount range */}
            <div className="flex gap-2">
              <input type="number" placeholder="Min ₹" value={minAmount} onChange={e => { setMinAmount(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:border-brand-500" />
              <input type="number" placeholder="Max ₹" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:border-brand-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto border border-slate-200/50 dark:border-white/5 rounded-2xl">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-100 dark:bg-white/5 text-xs text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10">
              <tr>
                {[
                  { label: "#", field: "index" },
                  { label: "Date", field: "date" },
                  { label: "Value Date", field: "valueDate" },
                  { label: "Description / Narration", field: "description" },
                  { label: "Cheque / Ref No", field: "reference" },
                  { label: "Deposits (CR)", field: "credit" },
                  { label: "Withdrawals (DR)", field: "debit" },
                  { label: "Balance", field: "balance" },
                  { label: "Category", field: null },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    onClick={() => field && handleSort(field)}
                    className={`p-3 whitespace-nowrap ${field ? "cursor-pointer hover:text-brand-500" : ""} transition-colors`}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {field && <ArrowUpDown className="h-3 w-3 opacity-60" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-white/5">
              {pageRows.length === 0 ? (
                <tr><td colSpan={9} className="p-10 text-center text-slate-400">No transactions match the filters.</td></tr>
              ) : pageRows.map((tx) => (
                <tr key={tx.id || tx.index} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors">
                  <td className="p-3 text-slate-400">{tx.index + 1}</td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{tx.date}</td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">{tx.valueDate}</td>
                  <td className="p-3 text-slate-800 dark:text-white max-w-[280px] truncate" title={tx.description}>{tx.description}</td>
                  <td className="p-3 text-slate-500 text-center">{tx.reference || "—"}</td>
                  <td className="p-3 text-right font-semibold text-emerald-600">
                    {tx.credit > 0 ? `₹${fmt(tx.credit)}` : "—"}
                  </td>
                  <td className="p-3 text-right font-semibold text-red-500">
                    {tx.debit > 0 ? `₹${fmt(tx.debit)}` : "—"}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800 dark:text-white whitespace-nowrap">₹{fmt(tx.balance)}</td>
                  <td className="p-3 text-center"><Badge cat={tx.category || "Other"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRows > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1); }}
                className="px-2 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-lg dark:text-white">
                {[15, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <span>Showing {(currentPage - 1) * rowsPerPage + 1} – {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-40 rounded-lg transition-all">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-40 rounded-lg transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
