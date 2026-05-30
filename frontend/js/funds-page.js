// WealthFeed – Mutual Fund Directory Page Logic
import * as api from './api.js';
import * as utils from './utils.js';
import { currentFilters } from './filters.js';

const PAGE_SIZE = 20;

let allFunds = [];
let filtered = [];
let sortCol = "total_amount_invested";
let sortDir = -1; // desc by default
let currentPage = 1;

/**
 * Entry point – fetch funds and render page.
 */
export async function initFundsPage(from = "", to = "") {
    const tbody = document.getElementById("tbl_funds");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-secondary);">Loading...</td></tr>`;

    try {
        allFunds = await api.fetchMutualFundSummary(from, to);
        filtered = [...allFunds];
        currentPage = 1;
        applyClientSearch();
        renderTable();
        renderPagination();
        bindExport(from, to);
        bindSearch();
        bindSort();
    } catch (err) {
        console.error("Funds page error:", err);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:#ef4444;">Failed to load mutual funds. Is the server running?</td></tr>`;
        utils.showToast(err.message || "Failed to load mutual funds.", "error");
    }
}

function applyClientSearch() {
    const searchVal = (document.getElementById("search_funds")?.value || "").toLowerCase().trim();
    filtered = searchVal
        ? allFunds.filter(f => (f.mutual_fund_name || "").toLowerCase().includes(searchVal))
        : [...allFunds];

    filtered.sort((a, b) => {
        let va = a[sortCol] ?? "";
        let vb = b[sortCol] ?? "";
        if (typeof va === "string") { va = va.toLowerCase(); vb = (vb || "").toString().toLowerCase(); }
        if (va < vb) return -sortDir;
        if (va > vb) return sortDir;
        return 0;
    });

    const countEl = document.getElementById("funds_count");
    if (countEl) countEl.textContent = `${filtered.length} fund${filtered.length !== 1 ? "s" : ""}`;
}

function renderTable() {
    const tbody = document.getElementById("tbl_funds");
    if (!tbody) return;
    tbody.innerHTML = "";

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageSlice = filtered.slice(start, start + PAGE_SIZE);

    if (pageSlice.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-secondary);">No mutual funds found.</td></tr>`;
        return;
    }

    // Total for allocation %
    const grandTotal = allFunds.reduce((s, f) => s + (f.total_amount_invested || 0), 0);

    pageSlice.forEach(fund => {
        const pct = grandTotal > 0 ? ((fund.total_amount_invested / grandTotal) * 100) : 0;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:var(--emerald-bg);color:var(--emerald);
                        display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">
                        ${(fund.mutual_fund_name || "?").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:13px;">${fund.mutual_fund_name || "—"}</div>
                        <div style="font-size:10px;color:var(--text-secondary);">${pct.toFixed(1)}% of portfolio</div>
                    </div>
                </div>
            </td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;font-weight:700;">${utils.formatCurrency(fund.total_amount_invested || 0)}</td>
            <td class="text-right">${(fund.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;color:var(--primary);font-weight:600;">${utils.formatCurrency(fund.average_nav || 0)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    const infoEl = document.getElementById("funds_pagination_info");
    const ctrlEl = document.getElementById("funds_pagination_controls");

    const start = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
    if (infoEl) infoEl.textContent = `Showing ${start}–${end} of ${filtered.length}`;
    if (!ctrlEl) return;
    ctrlEl.innerHTML = "";

    const prev = document.createElement("button");
    prev.className = "btn btn-secondary";
    prev.style.padding = "6px 14px";
    prev.innerHTML = `<i data-lucide="chevron-left" style="width:14px;height:14px;"></i>`;
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { currentPage--; renderTable(); renderPagination(); if (window.lucide) window.lucide.createIcons(); });
    ctrlEl.appendChild(prev);

    const pageInfo = document.createElement("span");
    pageInfo.style.cssText = "font-size:12px;color:var(--text-secondary);padding:0 12px;";
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    ctrlEl.appendChild(pageInfo);

    const next = document.createElement("button");
    next.className = "btn btn-secondary";
    next.style.padding = "6px 14px";
    next.innerHTML = `<i data-lucide="chevron-right" style="width:14px;height:14px;"></i>`;
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { currentPage++; renderTable(); renderPagination(); if (window.lucide) window.lucide.createIcons(); });
    ctrlEl.appendChild(next);

    if (window.lucide) window.lucide.createIcons();
}

function bindExport(from, to) {
    const btn = document.getElementById("btn_export_funds");
    if (!btn) return;
    btn.onclick = () => api.downloadExport("funds", from || currentFilters.from, to || currentFilters.to);
}

function bindSearch() {
    const input = document.getElementById("search_funds");
    if (!input) return;
    input.addEventListener("input", () => {
        currentPage = 1;
        applyClientSearch();
        renderTable();
        renderPagination();
    });
}

function bindSort() {
    document.querySelectorAll("th.sortable").forEach(th => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const col = th.dataset.col;
            if (sortCol === col) { sortDir = -sortDir; } else { sortCol = col; sortDir = 1; }
            document.querySelectorAll("th.sortable").forEach(h => h.style.color = "");
            th.style.color = "var(--primary)";
            currentPage = 1;
            applyClientSearch();
            renderTable();
            renderPagination();
        });
    });
}
