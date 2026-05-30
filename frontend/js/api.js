// WealthFeed Centralized Backend API Client Service

const API_BASE_URL = "http://localhost:8000/api";

/**
 * Appends from_date and to_date filters to a URLSearchParams instance if provided.
 */
function buildQueryString(params = {}) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value);
        }
    }
    const str = searchParams.toString();
    return str ? `?${str}` : "";
}

/**
 * Safe fetch wrapper that checks HTTP response codes and throws structured errors.
 */
async function fnRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.detail || `HTTP Request failed with status ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error(`API Call failed [${endpoint}]:`, err);
        throw err;
    }
}

/**
 * 1. GET /api/investor-summary
 */
export async function fetchInvestorSummary(from = "", to = "") {
    const qs = buildQueryString({ from_date: from, to_date: to });
    return await fnRequest(`/investor-summary${qs}`);
}

/**
 * 2. GET /api/fund-summary-by-investor
 */
export async function fetchFundSummaryByInvestor(from = "", to = "") {
    const qs = buildQueryString({ from_date: from, to_date: to });
    return await fnRequest(`/fund-summary-by-investor${qs}`);
}

/**
 * 3. GET /api/investors
 */
export async function fetchInvestorList(from = "", to = "") {
    const qs = buildQueryString({ from_date: from, to_date: to });
    return await fnRequest(`/investors${qs}`);
}

/**
 * 4. GET /api/mutual-fund-summary
 */
export async function fetchMutualFundSummary(from = "", to = "") {
    const qs = buildQueryString({ from_date: from, to_date: to });
    return await fnRequest(`/mutual-fund-summary${qs}`);
}

/**
 * 5. GET /api/transactions (Paginated, Searchable, Sortable)
 */
export async function fetchTransactions({
    page = 1,
    size = 10,
    search = "",
    sortBy = "transaction_date",
    sortOrder = "desc",
    from = "",
    to = ""
} = {}) {
    const qs = buildQueryString({
        page,
        size,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        from_date: from,
        to_date: to
    });
    return await fnRequest(`/transactions${qs}`);
}

/**
 * 6. POST /api/transactions
 */
export async function createTransaction(transactionData) {
    return await fnRequest("/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transactionData)
    });
}

/**
 * 7. DELETE /api/transactions/{id}
 */
export async function deleteTransaction(transactionId) {
    return await fnRequest(`/transactions/${transactionId}`, {
        method: "DELETE"
    });
}

/**
 * 8. PUT /api/transactions/{id}
 */
export async function updateTransaction(transactionId, updatedData) {
    return await fnRequest(`/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    });
}

/**
 * 9. GET /api/dashboard-stats
 */
export async function fetchDashboardStats(from = "", to = "") {
    const qs = buildQueryString({ from_date: from, to_date: to });
    return await fnRequest(`/dashboard-stats${qs}`);
}

/**
 * 10. Trigger a CSV file download by opening the export URL in a new tab.
 * entity can be: "investors" | "funds" | "analytics" | "transactions"
 */
export function downloadExport(entity, from = "", to = "") {
    const params = new URLSearchParams();
    if (from) params.append("from_date", from);
    if (to) params.append("to_date", to);
    const qs = params.toString();
    const url = `${API_BASE_URL}/export/${entity}${qs ? "?" + qs : ""}`;
    window.open(url, "_blank");
}
