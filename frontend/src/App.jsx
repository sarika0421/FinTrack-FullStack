import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Wallet, Plus, Search, LayoutDashboard,
  ReceiptText, Settings, Bell, ChevronDown, MoreHorizontal, Pencil,
  Trash2, X, CalendarDays, CircleHelp, LoaderCircle, TrendingUp, Menu
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid
} from "recharts";
import { api } from "./api";

const CATEGORIES = ["Food", "Shopping", "Transport", "Bills", "Education", "Health", "Salary", "Freelance", "Other"];
const COLORS = ["#7566e8", "#4e9b83", "#f2b45c", "#e47e91", "#6a9bd7", "#a58acb", "#8bb9a8", "#d69a65", "#9aa3b2"];
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const dateLabel = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const emptyForm = {
  title: "", amount: "", type: "expense", category: "Food",
  date: new Date().toISOString().slice(0, 10), note: ""
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, monthIncome: 0, monthExpenses: 0, categoryTotals: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setError("");
      const [items, totals] = await Promise.all([api.getTransactions(), api.getSummary()]);
      setTransactions(items);
      setSummary(totals);
    } catch (err) {
      setError(err.message + " — Check that the backend and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const visibleTransactions = useMemo(() => transactions.filter((item) => {
    const matchesType = filter === "all" || item.type === filter;
    const matchesSearch = `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  }), [transactions, filter, search]);

  const categoryData = Object.entries(summary.categoryTotals || {}).map(([name, value]) => ({ name, value }));
  const chartData = [
    { name: "Income", amount: summary.monthIncome },
    { name: "Expenses", amount: summary.monthExpenses }
  ];

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item._id);
    setForm({
      title: item.title,
      amount: String(item.amount),
      type: item.type,
      category: item.category,
      date: new Date(item.date).toISOString().slice(0, 10),
      note: item.note || ""
    });
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount), date: new Date(`${form.date}T12:00:00`).toISOString() };
      if (editing) await api.updateTransaction(editing, payload);
      else await api.createTransaction(payload);
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const currentMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Wallet size={21} /></div><span>fintrack<span className="brand-dot">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className="nav-item active" onClick={() => setMobileNav(false)}><LayoutDashboard size={18} />Dashboard</button>
          <button className="nav-item" onClick={() => { document.getElementById("transactions")?.scrollIntoView({ behavior: "smooth" }); setMobileNav(false); }}><ReceiptText size={18} />Transactions</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Need a hand?</strong><p>Keep your finances organized, one day at a time.</p></div>
          <button className="nav-item"><Settings size={18} />Settings</button>
          <div className="profile"><div className="avatar">S</div><div><strong>My Account</strong><small>Personal workspace</small></div><MoreHorizontal size={19} className="profile-more" /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>Dashboard</strong></div>
          <div className="top-actions"><button className="icon-button notification"><Bell size={18} /><i /></button><div className="top-avatar">S</div><span className="user-name">Sarika</span><ChevronDown size={15} /></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow">OVERVIEW</div><h1>Good to see you, Sarika <span>✦</span></h1><p>Here's what's happening with your money.</p></div>
            <button className="primary-button" onClick={openAdd}><Plus size={18} />Add transaction</button>
          </section>

          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError("")}><X size={16} /></button></div>}

          <section className="stats-grid">
            <StatCard label="Total balance" value={money(summary.balance)} icon={<Wallet size={19} />} tone="purple" note="Income minus expenses" />
            <StatCard label="Total income" value={money(summary.income)} icon={<ArrowDownLeft size={19} />} tone="green" note="All recorded income" />
            <StatCard label="Total expenses" value={money(summary.expenses)} icon={<ArrowUpRight size={19} />} tone="orange" note="All recorded expenses" />
          </section>

          <section className="insights-grid">
            <div className="panel monthly-panel">
              <div className="panel-heading"><div><h2>Monthly overview</h2><p>Your cash flow for {currentMonth}</p></div><div className="month-pill"><CalendarDays size={14} />This month</div></div>
              <div className="monthly-total">{money(summary.monthIncome - summary.monthExpenses)}<span>Net cash flow</span></div>
              <div className="bar-chart">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={chartData} barSize={42} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9299a8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9299a8", fontSize: 11 }} />
                    <Tooltip formatter={(value) => money(value)} />
                    <Bar dataKey="amount" radius={[7, 7, 0, 0]} fill="#7668e8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend"><span><i className="legend-green" />Income <strong>{money(summary.monthIncome)}</strong></span><span><i className="legend-purple" />Expenses <strong>{money(summary.monthExpenses)}</strong></span></div>
            </div>
            <div className="panel spending-panel">
              <div className="panel-heading"><div><h2>Spending by category</h2><p>Where your money goes</p></div><button className="icon-button"><MoreHorizontal size={20} /></button></div>
              {categoryData.length ? <>
                <div className="donut-wrap"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={3}>{categoryData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => money(value)} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(summary.expenses)}</strong><span>Total spent</span></div></div>
                <div className="category-legend">{categoryData.slice(0, 4).map((item, index) => <div key={item.name}><span><i style={{ background: COLORS[index % COLORS.length] }} />{item.name}</span><strong>{money(item.value)}</strong></div>)}</div>
              </> : <div className="empty-chart"><div className="empty-chart-icon"><TrendingUp size={22} /></div><strong>No spending data yet</strong><span>Add an expense to see your category breakdown.</span></div>}
            </div>
          </section>

          <section className="panel transactions-panel" id="transactions">
            <div className="panel-heading transaction-heading"><div><h2>Recent transactions</h2><p>Track and manage your latest activity</p></div><button className="outline-button" onClick={openAdd}><Plus size={16} />Add new</button></div>
            <div className="table-toolbar"><div className="filter-tabs"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All</button><button className={filter === "income" ? "selected" : ""} onClick={() => setFilter("income")}>Income</button><button className={filter === "expense" ? "selected" : ""} onClick={() => setFilter("expense")}>Expenses</button></div><div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." /></div></div>
            {loading ? <div className="loading-state"><LoaderCircle className="spin" />Loading transactions...</div> : visibleTransactions.length ? <div className="table-scroll"><table><thead><tr><th>NAME</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>{visibleTransactions.slice(0, 10).map((item) => <tr key={item._id}><td><div className="transaction-name"><div className={`transaction-icon ${item.type}`}>{item.type === "income" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</div><div><strong>{item.title}</strong><small>{item.note || (item.type === "income" ? "Money received" : "Payment made")}</small></div></div></td><td><span className="category-chip">{item.category}</span></td><td className="date-cell">{dateLabel(item.date)}</td><td className={`amount-cell ${item.type}`}>{item.type === "income" ? "+" : "−"}{money(item.amount)}</td><td><div className="row-actions"><button title="Edit" onClick={() => openEdit(item)}><Pencil size={15} /></button><button title="Delete" onClick={() => handleDelete(item._id)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <div className="empty-table"><div className="empty-table-icon"><ReceiptText size={22} /></div><strong>No transactions found</strong><span>Add your first income or expense to get started.</span><button className="primary-button small" onClick={openAdd}><Plus size={16} />Add transaction</button></div>}
            {visibleTransactions.length > 10 && <div className="table-footer">Showing 10 of {visibleTransactions.length} transactions</div>}
          </section>
          <footer className="footer">Made to make money management simpler <span>✦</span></footer>
        </div>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}><form className="transaction-modal" onSubmit={handleSubmit}>
        <div className="modal-heading"><div><div className="eyebrow">{editing ? "UPDATE DETAILS" : "NEW ENTRY"}</div><h2>{editing ? "Edit transaction" : "Add transaction"}</h2><p>Enter the details of your money movement.</p></div><button type="button" className="icon-button" onClick={() => setModalOpen(false)}><X size={20} /></button></div>
        <div className="type-switch"><button type="button" className={form.type === "expense" ? "active expense-active" : ""} onClick={() => setForm({ ...form, type: "expense", category: "Food" })}><ArrowUpRight size={16} />Expense</button><button type="button" className={form.type === "income" ? "active income-active" : ""} onClick={() => setForm({ ...form, type: "income", category: "Salary" })}><ArrowDownLeft size={16} />Income</button></div>
        <label>Transaction name<input required maxLength="80" placeholder="e.g. Grocery shopping" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <div className="form-row"><label>Amount (₹)<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}</select></label></div>
        <label>Date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
        <label>Note <span className="optional">(optional)</span><textarea rows="2" maxLength="250" placeholder="Add a short note..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
        <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add transaction"}</button></div>
      </form></div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone, note }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><strong className="stat-value">{value}</strong><div className="stat-note">{note}</div></div>;
}

export default App;
