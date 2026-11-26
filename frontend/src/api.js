const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  getTransactions: () => request("/transactions"),
  createTransaction: (payload) => request("/transactions", { method: "POST", body: JSON.stringify(payload) }),
  updateTransaction: (id, payload) => request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),
  getSummary: () => request("/summary")
};
