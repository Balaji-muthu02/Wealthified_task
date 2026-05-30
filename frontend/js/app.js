// WealthFeed Main Application Coordinator & Bootstrapper - Vektora Premium Aesthetic

import * as api from './api.js';
import * as utils from './utils.js';
import { initDateFilters, currentFilters } from './filters.js';
import { initTransactionsView } from './transactions.js';
import { initAddInvestorForm, initInvestorDetailsView } from './investors.js';
import { initInvestorsListPage } from './investors-page.js';
import { initFundsPage } from './funds-page.js';
import { initAnalyticsPage } from './analytics.js';

// Global cache of data to support tabs and real-time search filtering
let cachedFunds = [];
let cachedTransactions = [];
let cachedInvestors = [];
let activeTabFilter = "all";
let activeSearchQuery = "";

/**
 * Configure Sidebar Collapsing Toggle & Active links
 */
function initLayout() {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.getElementById("sidebar_toggle");
    
    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
            setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
        });
    }

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".sidebar-nav-item");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && (currentPath.endsWith(href) || (currentPath.endsWith("/") && href === "index.html"))) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

/**
 * Helper to dynamically determine Scheme Category Type
 */
function getSchemeCategory(schemeName) {
    const name = schemeName.toLowerCase();
    if (name.includes("index") || name.includes("nifty") || name.includes("bluechip") || name.includes("contra")) {
        return "Equity";
    } else if (name.includes("gold") || name.includes("silver") || name.includes("commodity")) {
        return "Gold FOF";
    } else if (name.includes("ultra short") || name.includes("liquid") || name.includes("savings") || name.includes("duration")) {
        return "Debt / Liquid";
    }
    return "Equity";
}

/**
 * Render the Mutual Fund Portfolios table based on filters (tabs + search)
 */
function renderMutualFundTable() {
    const tbody = document.getElementById("tbl_project_summary");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    // Calculate total amount to find shares
    const totalAmount = cachedFunds.reduce((sum, item) => sum + item.total_amount_invested, 0);
    
    // Filter by Tabs and Search
    let filteredFunds = cachedFunds.filter(f => {
        const category = getSchemeCategory(f.mutual_fund_name).toLowerCase();
        
        // Tab check
        if (activeTabFilter === "equity" && category !== "equity") return false;
        if (activeTabFilter === "debt-gold" && category === "equity") return false; // Gold & Debt
        
        // Search check
        if (activeSearchQuery) {
            const query = activeSearchQuery.toLowerCase();
            const nameMatch = f.mutual_fund_name.toLowerCase().includes(query);
            const catMatch = getSchemeCategory(f.mutual_fund_name).toLowerCase().includes(query);
            return nameMatch || catMatch;
        }
        
        return true;
    });

    if (filteredFunds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 32px; color: var(--text-secondary);">No mutual funds found.</td></tr>`;
        return;
    }

    filteredFunds.forEach(fund => {
        // Find matching transactions to extract unique holders and dates
        const fundTxns = cachedTransactions.filter(t => t.mutual_fund_name === fund.mutual_fund_name);
        
        // Find unique investor names & avatars
        const holdersSet = new Set();
        const holderProfiles = [];
        
    fundTxns.forEach(txn => {
            if (!holdersSet.has(txn.investor_name)) {
                holdersSet.add(txn.investor_name);
                
                // Get initials safely
                const nameParts = (txn.investor_name || 'Unknown').split(' ').filter(n => n.length > 0);
                const initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA';
                
                // Look up PAN for profiling links
                const matchingInv = cachedInvestors.find(i => i.investor_name === txn.investor_name);
                const pan = matchingInv ? matchingInv.pan_number : '';
                
                holderProfiles.push({ initials, name: txn.investor_name || 'Unknown', pan });
            }
        });
        
        // Find last transaction date
        let lastDate = "N/A";
        if (fundTxns.length > 0) {
            const sortedTxns = [...fundTxns].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
            lastDate = utils.formatDate(sortedTxns[0].transaction_date);
        }

        // Calculate allocation share percentage
        const fundAmt = parseFloat(fund.total_amount_invested) || 0;
        const sharePct = totalAmount > 0 ? (fundAmt / totalAmount) * 100 : 0;

        // Build holder avatars HTML
        let holdersHTML = '<div class="avatar-group">';
        holderProfiles.slice(0, 3).forEach(holder => {
            holdersHTML += `
                <a href="investor-details.html?investor_id=${holder.pan}" class="avatar-group-item" title="${holder.name}">
                    ${holder.initials}
                </a>
            `;
        });
        if (holderProfiles.length > 3) {
            holdersHTML += `<div class="avatar-group-item" title="${holderProfiles.length} total holders">+${holderProfiles.length - 3}</div>`;
        }
        holdersHTML += '</div>';

        // Choose color for progress bar
        let barColor = "#3b82f6"; // Primary blue
        const category = getSchemeCategory(fund.mutual_fund_name);
        if (category === "Equity") barColor = "#10b981"; // Green
        if (category === "Gold FOF") barColor = "#f59e0b"; // Yellow
        if (category === "Debt / Liquid") barColor = "#8b5cf6"; // Purple

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <strong>${fund.mutual_fund_name}</strong>
            </td>
            <td><span style="color: var(--text-secondary); font-weight: 500;">${category}</span></td>
            <td>${holdersHTML}</td>
            <td><span style="color: var(--text-light); font-size: 11px;">${lastDate}</span></td>
            <td class="text-right font-semibold text-primary" style="font-family: 'Outfit', sans-serif;">
                ${utils.formatCurrency(parseFloat(fund.total_amount_invested) || 0)}
            </td>
            <td>
                <div class="progress-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${sharePct.toFixed(1)}%; background: ${barColor};"></div>
                    </div>
                    <span class="progress-pct">${sharePct.toFixed(0)}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Render the Recent Transactions / Payments vertical list (Card 4)
 */
function renderRecentTransactions() {
    const listContainer = document.getElementById("recent_payments_list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    
    // Get the top 4 most recent transactions
    const recentTxns = [...cachedTransactions]
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 4);

    if (recentTxns.length === 0) {
        listContainer.innerHTML = `<div class="text-center" style="padding: 24px; color: var(--text-secondary);">No recent activities.</div>`;
        return;
    }

    recentTxns.forEach(txn => {
        const nameParts = (txn.investor_name || 'Unknown').split(' ').filter(n => n.length > 0);
        const initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA';

        const trType = txn.nav_price ? 'Purchase' : 'Switch In';
        const dateStr = utils.formatDate(txn.transaction_date);
        const amount  = parseFloat(txn.purchase_amount) || 0;
        const fundName = txn.mutual_fund_name || 'Unknown Fund';
        const panNum   = txn.pan_number || '';
        const invName  = txn.investor_name || 'Unknown';

        const item = document.createElement("div");
        item.className = "recent-payment-item";
        item.innerHTML = `
            <div class="payment-left">
                <a href="investor-details.html?investor_id=${panNum}" class="payment-avatar" style="text-decoration: none;">
                    ${initials}
                </a>
                <div class="payment-meta">
                    <span class="payment-name">${invName}</span>
                    <span class="payment-category">${fundName}</span>
                </div>
            </div>
            <div class="payment-right">
                <span class="payment-amount">${utils.formatCurrency(amount)}</span>
                <span class="payment-date">${dateStr} &bull; ${trType}</span>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

/**
 * Populate the 6 KPI cards on the dashboard
 */
function renderKpiCards(stats) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("kpi_total_investment",  utils.formatCurrency(stats.total_investment || 0));
    set("kpi_total_nav_units",   (stats.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 }));
    set("kpi_total_investors",   stats.total_investors || 0);
    set("kpi_total_funds",       stats.total_mutual_funds || 0);
    set("kpi_avg_nav",           utils.formatCurrency(stats.average_nav_price || 0));
    set("kpi_total_transactions",stats.total_transactions || 0);
}

/**
 * Refresh dashboard state and reload charts
 */
export async function refreshDashboardData(from = "", to = "") {
    const statTotalWealth = document.getElementById("stat_total_wealth");
    const statActiveInvestors = document.getElementById("stat_active_investors");
    const tbody = document.getElementById("tbl_project_summary");
    const recentList = document.getElementById("recent_payments_list");

    if (statTotalWealth) statTotalWealth.innerHTML = `<span class="skeleton" style="width: 70px; height: 16px; display: inline-block;"></span>`;
    if (statActiveInvestors) statActiveInvestors.innerHTML = `<span class="skeleton" style="width: 30px; height: 16px; display: inline-block;"></span>`;
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center"><span class="skeleton" style="width: 100%; height: 60px; display: inline-block;"></span></td></tr>`;
    if (recentList) recentList.innerHTML = `<span class="skeleton" style="width: 100%; height: 150px; display: inline-block;"></span>`;

    try {
        const [stats, investors, funds, transactionsRes] = await Promise.all([
            api.fetchDashboardStats(from, to),
            api.fetchInvestorList(from, to),
            api.fetchMutualFundSummary(from, to),
            api.fetchTransactions({ from, to, size: 5000 })
        ]);

        // Guard against API errors returning non-array / missing .data
        cachedFunds        = Array.isArray(funds)                    ? funds            : [];
        cachedTransactions = Array.isArray(transactionsRes?.data)    ? transactionsRes.data : [];
        cachedInvestors    = Array.isArray(investors)                ? investors        : [];

        // 1. Render KPI cards
        if (stats) renderKpiCards(stats);

        // 2. Update stats
        const totalAmount = cachedFunds.reduce((sum, item) => sum + (parseFloat(item.total_amount_invested) || 0), 0);
        if (statTotalWealth)    statTotalWealth.textContent    = utils.formatCurrency(totalAmount);
        if (statActiveInvestors) statActiveInvestors.textContent = cachedInvestors.length;

        // 3. Render portfolio list table
        renderMutualFundTable();

        // 4. Render recent payments
        renderRecentTransactions();

    } catch (err) {
        console.error("Dashboard load error:", err);
        utils.showToast(err.message || "Failed to load dashboard data.", "error");
        // Show empty state so the page is not stuck in skeleton
        const tbody = document.getElementById("tbl_project_summary");
        const recentList = document.getElementById("recent_payments_list");
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#94a3b8;">Could not connect to database.</td></tr>`;
        if (recentList) recentList.innerHTML = `<div style="text-align:center;padding:24px;color:#94a3b8;">No recent transactions.</div>`;
    }
}

/**
 * Bind DOM UI listeners for Search, Tabs and Export on dashboard
 */
function initDashboardBindings() {
    // 1. Search filter
    const searchInput = document.getElementById("search_global");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            activeSearchQuery = e.target.value;
            renderMutualFundTable();
        });
    }

    // 2. Tabs filters
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeTabFilter = tab.dataset.filter;
            renderMutualFundTable();
        });
    });

    // 3. Export button — download transactions CSV
    const exportBtn = document.getElementById("btn_export_data");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            api.downloadExport("transactions", currentFilters.from, currentFilters.to);
        });
    }
}

/**
 * Bootstrapper
 */
document.addEventListener("DOMContentLoaded", () => {
    initLayout();

    const currentPath = window.location.pathname;

    if (currentPath.endsWith("index.html") || currentPath.endsWith("/")) {
        initDashboardBindings();
        // Wire up date filters on dashboard
        initDateFilters(
            (from, to) => refreshDashboardData(from, to),
            ()         => refreshDashboardData()
        );
        refreshDashboardData(currentFilters.from, currentFilters.to);
    } 
    else if (currentPath.endsWith("transactions.html")) {
        initDateFilters(
            () => initTransactionsView(),
            () => initTransactionsView()
        );
        initTransactionsView();
    } 
    else if (currentPath.endsWith("add-investor.html")) {
        initAddInvestorForm();
    } 
    else if (currentPath.endsWith("investor-details.html")) {
        initInvestorDetailsView();
    }
    else if (currentPath.endsWith("investors.html")) {
        initDateFilters(
            (from, to) => initInvestorsListPage(from, to),
            ()         => initInvestorsListPage()
        );
        initInvestorsListPage(currentFilters.from, currentFilters.to);
    }
    else if (currentPath.endsWith("funds.html")) {
        initDateFilters(
            (from, to) => initFundsPage(from, to),
            ()         => initFundsPage()
        );
        initFundsPage(currentFilters.from, currentFilters.to);
    }
    else if (currentPath.endsWith("analytics.html")) {
        initDateFilters(
            (from, to) => initAnalyticsPage(from, to),
            ()         => initAnalyticsPage()
        );
        initAnalyticsPage(currentFilters.from, currentFilters.to);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
