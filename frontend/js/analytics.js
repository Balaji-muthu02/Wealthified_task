// WealthFeed – Analytics Reports Page Logic
import * as api from './api.js';
import * as utils from './utils.js';
import { currentFilters } from './filters.js';

/**
 * Entry point – fetch all 4 reports and render.
 */
export async function initAnalyticsPage(from = "", to = "") {
    setLoading();

    try {
        const [r1, r2, r3, r4] = await Promise.all([
            api.fetchInvestorSummary(from, to),
            api.fetchFundSummaryByInvestor(from, to),
            api.fetchInvestorList(from, to),
            api.fetchMutualFundSummary(from, to)
        ]);

        // Summary KPIs
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set("akpi_investor_pairs", r1.length);
        set("akpi_fund_pairs",     r2.length);
        set("akpi_unique_funds",   r4.length);

        renderReport1(r1);
        renderReport2(r2);
        renderReport3(r3);
        renderReport4(r4);
        bindCollapseToggle();
        bindExport(from, to);
    } catch (err) {
        console.error("Analytics page error:", err);
        utils.showToast(err.message || "Failed to load analytics.", "error");
        ["tbl_r1", "tbl_r2", "tbl_r3", "tbl_r4"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#ef4444;">Failed to load data.</td></tr>`;
        });
    }
}

function setLoading() {
    const msg = (cols) => `<tr><td colspan="${cols}" style="text-align:center;padding:32px;color:var(--text-secondary);">Loading...</td></tr>`;
    const t = (id, cols) => { const el = document.getElementById(id); if (el) el.innerHTML = msg(cols); };
    t("tbl_r1", 4); t("tbl_r2", 4); t("tbl_r3", 6); t("tbl_r4", 4);
}

/** Report 1: Investor-wise Purchase Summary per Mutual Fund */
function renderReport1(data) {
    const tbody = document.getElementById("tbl_r1");
    const badge = document.getElementById("badge_r1");
    if (badge) badge.textContent = `${data.length} rows`;
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-secondary);">No data.</td></tr>`;
        return;
    }
    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:600;">${r.investor_name || "—"}</td>
            <td style="color:var(--text-secondary);">${r.mutual_fund_name || "—"}</td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;font-weight:700;">${utils.formatCurrency(r.total_purchase_amount || 0)}</td>
            <td class="text-right">${(r.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
        `;
        tbody.appendChild(tr);
    });
}

/** Report 2: Mutual Fund-wise Summary per Investor */
function renderReport2(data) {
    const tbody = document.getElementById("tbl_r2");
    const badge = document.getElementById("badge_r2");
    if (badge) badge.textContent = `${data.length} rows`;
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-secondary);">No data.</td></tr>`;
        return;
    }
    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:600;">${r.mutual_fund_name || "—"}</td>
            <td style="color:var(--text-secondary);">${r.investor_name || "—"}</td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;font-weight:700;">${utils.formatCurrency(r.total_amount_invested || 0)}</td>
            <td class="text-right">${(r.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
        `;
        tbody.appendChild(tr);
    });
}

/** Report 3: Investor List with Purchase Details */
function renderReport3(data) {
    const tbody = document.getElementById("tbl_r3");
    const badge = document.getElementById("badge_r3");
    if (badge) badge.textContent = `${data.length} rows`;
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-secondary);">No data.</td></tr>`;
        return;
    }
    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:600;">${r.investor_name || "—"}</td>
            <td><span style="font-family:monospace;font-size:12px;background:var(--bg-app);padding:2px 8px;border-radius:6px;">${r.pan_number || "—"}</span></td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;font-weight:700;">${utils.formatCurrency(r.total_amount_invested || 0)}</td>
            <td class="text-right">${(r.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
            <td class="text-center">
                <span style="background:var(--emerald-bg);color:var(--emerald);padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;">${r.number_of_funds || 0}</span>
            </td>
            <td class="text-center" style="color:var(--text-secondary);font-size:12px;">${r.latest_transaction_date ? utils.formatDate(r.latest_transaction_date) : "—"}</td>
        `;
        tbody.appendChild(tr);
    });
}

/** Report 4: Mutual Fund Summary */
function renderReport4(data) {
    const tbody = document.getElementById("tbl_r4");
    const badge = document.getElementById("badge_r4");
    if (badge) badge.textContent = `${data.length} rows`;
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-secondary);">No data.</td></tr>`;
        return;
    }
    data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:600;">${r.mutual_fund_name || "—"}</td>
            <td class="text-right" style="font-family:'Outfit',sans-serif;font-weight:700;">${utils.formatCurrency(r.total_amount_invested || 0)}</td>
            <td class="text-right">${(r.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 4 })}</td>
            <td class="text-right" style="color:var(--primary);font-weight:600;">${utils.formatCurrency(r.average_nav || 0)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/** Wire up collapsible report section headers */
function bindCollapseToggle() {
    document.querySelectorAll(".report-header").forEach(header => {
        header.addEventListener("click", () => {
            const targetId = header.dataset.target;
            const body = document.getElementById(targetId);
            const icon = header.querySelector(".collapse-icon");
            if (!body) return;
            const isOpen = body.classList.toggle("open");
            if (icon) icon.classList.toggle("open", isOpen);
        });
    });
}

/** Bind the combined analytics CSV export button */
function bindExport(from, to) {
    const btn = document.getElementById("btn_export_analytics");
    if (!btn) return;
    btn.onclick = () => api.downloadExport("analytics", from || currentFilters.from, to || currentFilters.to);
}
