// WealthFeed – Investors Directory Page Logic
import * as api from './api.js';
import * as utils from './utils.js';
import { currentFilters } from './filters.js';

const PAGE_SIZE = 20;

// Page state
let allInvestors = [];
let filtered = [];
let sortCol = "investor_name";
let sortDir = 1; // 1 = asc, -1 = desc
let currentPage = 1;

/**
 * Fetch investors from backend, then render table & pagination.
 */
export async function initInvestorsListPage(from = "", to = "") {
    const tbody = document.getElementById("tbl_investors");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-secondary);">Loading...</td></tr>`;

    try {
        allInvestors = await api.fetchInvestorList(from, to);
        filtered = [...allInvestors];
        currentPage = 1;
        applyClientSearch();
        renderTable();
        renderPagination();
        bindExport(from, to);
        bindSearch();
        bindSort();
    } catch (err) {
        console.error("Investors page error:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#ef4444;">Failed to load investors. Is the server running?</td></tr>`;
        utils.showToast(err.message || "Failed to load investors.", "error");
    }
}

/** Apply search filter to allInvestors and reset to page 1 */
function applyClientSearch() {
    const searchVal = (document.getElementById("search_investors")?.value || "").toLowerCase().trim();
    if (!searchVal) {
        filtered = [...allInvestors];
    } else {
        filtered = allInvestors.filter(inv =>
            (inv.investor_name || "").toLowerCase().includes(searchVal) ||
            (inv.pan_number || "").toLowerCase().includes(searchVal)
        );
    }
    // Apply sort
    filtered.sort((a, b) => {
        let va = a[sortCol] ?? "";
        let vb = b[sortCol] ?? "";
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        if (va < vb) return -sortDir;
        if (va > vb) return sortDir;
        return 0;
    });
    // Update count badge
    const countEl = document.getElementById("investors_count");
    if (countEl) countEl.textContent = `${filtered.length} investor${filtered.length !== 1 ? "s" : ""}`;
}

/** Render the visible page slice of filtered investors */
function renderTable() {
    const tbody = document.getElementById("tbl_investors");
    if (!tbody) return;
    tbody.innerHTML = "";

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageSlice = filtered.slice(start, start + PAGE_SIZE);

    if (pageSlice.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-secondary);">No investors found.</td></tr>`;
        return;
    }

    pageSlice.forEach(inv => {
        const nameParts = (inv.investor_name || "").split(" ").filter(n => n.length > 0);
        const initials = nameParts.map(n => n[0]).join("").substring(0, 2).toUpperCase() || "NA";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--primary-glow);color:var(--primary);
                        display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;">
                        ${initials}
                    </div>
                    <span style="font-weight:600;">${inv.investor_name || "—"}</span>
                </div>
            </td>
            <td><span style="font-family:monospace;font-size:12px;background:var(--bg-app);padding:2px 8px;border-radius:6px;">${inv.pan_number || "—"}</span></td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;font-weight:700;">${utils.formatCurrency(inv.total_amount_invested || 0)}</td>
            <td class="text-right">${(inv.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
            <td class="text-center">
                <span style="background:var(--emerald-bg);color:var(--emerald);padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;">
                    ${inv.number_of_funds || 0}
                </span>
            </td>
            <td class="text-center" style="color:var(--text-secondary);font-size:12px;">
                ${inv.latest_transaction_date ? utils.formatDate(inv.latest_transaction_date) : "—"}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/** Render pagination controls */
function renderPagination() {
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    const infoEl = document.getElementById("inv_pagination_info");
    const ctrlEl = document.getElementById("inv_pagination_controls");

    const start = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
    if (infoEl) infoEl.textContent = `Showing ${start}–${end} of ${filtered.length}`;
    if (!ctrlEl) return;

    ctrlEl.innerHTML = "";

    // Prev button
    const prev = document.createElement("button");
    prev.className = "btn btn-secondary";
    prev.style.padding = "6px 14px";
    prev.innerHTML = `<i data-lucide="chevron-left" style="width:14px;height:14px;"></i>`;
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { currentPage--; renderTable(); renderPagination(); if (window.lucide) window.lucide.createIcons(); });
    ctrlEl.appendChild(prev);

    // Page number display
    const pageInfo = document.createElement("span");
    pageInfo.style.cssText = "font-size:12px;color:var(--text-secondary);padding:0 12px;";
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    ctrlEl.appendChild(pageInfo);

    // Next button
    const next = document.createElement("button");
    next.className = "btn btn-secondary";
    next.style.padding = "6px 14px";
    next.innerHTML = `<i data-lucide="chevron-right" style="width:14px;height:14px;"></i>`;
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { currentPage++; renderTable(); renderPagination(); if (window.lucide) window.lucide.createIcons(); });
    ctrlEl.appendChild(next);

    if (window.lucide) window.lucide.createIcons();
}

/** Bind CSV export button */
function bindExport(from, to) {
    const btn = document.getElementById("btn_export_investors");
    if (!btn) return;
    btn.onclick = () => api.downloadExport("investors", from || currentFilters.from, to || currentFilters.to);
}

/** Bind search input */
function bindSearch() {
    const input = document.getElementById("search_investors");
    if (!input) return;
    input.addEventListener("input", () => {
        currentPage = 1;
        applyClientSearch();
        renderTable();
        renderPagination();
    });
}

/** Bind sortable column headers */
function bindSort() {
    document.querySelectorAll("#tbl_investors")?.forEach(() => {});
    document.querySelectorAll("th.sortable").forEach(th => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const col = th.dataset.col;
            if (sortCol === col) {
                sortDir = -sortDir;
            } else {
                sortCol = col;
                sortDir = 1;
            }
            // Update header indicators
            document.querySelectorAll("th.sortable").forEach(h => h.style.color = "");
            th.style.color = "var(--primary)";
            currentPage = 1;
            applyClientSearch();
            renderTable();
            renderPagination();
        });
    });
}
