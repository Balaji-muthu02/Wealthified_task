// WealthFeed Main Application Coordinator & Bootstrapper - Simplified Beginner-Level Code
// Treat this file as completely isolated. Do not assume any other file exists or will be modified.

import * as api from './api.js';
import * as utils from './utils.js';
import { initDateFilters, currentFilters } from './filters.js';
import { initTransactionsView } from './transactions.js';
import { initAddInvestorForm, initInvestorDetailsView } from './investors.js';
import { initInvestorsListPage } from './investors-page.js';
import { initFundsPage } from './funds-page.js';
import { initAnalyticsPage } from './analytics.js';

// Global cache variables to store data from the backend server
let cachedFunds = [];
let cachedTransactions = [];
let cachedInvestors = [];
let activeTabFilter = "all";
let activeSearchQuery = "";

// Chart.js instance references — stored so we can destroy before re-rendering
let chartBarInstance = null;
let chartDoughnutInstance = null;
let chartLineInstance = null;

// ==========================================================================
// 1. LAYOUT & SIDEBAR NAVIGATION SETUP
// ==========================================================================

// This function sets up the sidebar collapsing behavior and highlights active navigation links
function initLayout() {
    const sidebarElement = document.querySelector(".sidebar");
    const toggleButton = document.getElementById("sidebar_toggle");
    
    // Check if the toggle button exists, then add a click listener to collapse or expand
    if (sidebarElement && toggleButton) {
        toggleButton.addEventListener("click", () => {
            sidebarElement.classList.toggle("collapsed");
            // Let the browser know the screen size changed so table sizing can adapt
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 200);
        });
    }

    // Get the current page URL path from the browser window
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".sidebar-nav-item");
    
    // Loop through each sidebar menu link to check if it matches the current page
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        const isDashboardDefault = currentPath.endsWith("/") && href === "index.html";
        const isCurrentPage = href && (currentPath.endsWith(href) || isDashboardDefault);
        
        if (isCurrentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// ==========================================================================
// 2. SCHEME UTILITY HELPERS
// ==========================================================================

// Helper function to check the name of a mutual fund and determine its category (Equity, Gold, Debt)
function getSchemeCategory(schemeName) {
    const lowerName = schemeName.toLowerCase();
    
    // Check for Equity keywords
    if (lowerName.includes("index") || lowerName.includes("nifty") || lowerName.includes("bluechip") || lowerName.includes("contra")) {
        return "Equity";
    }
    
    // Check for Gold keywords
    if (lowerName.includes("gold") || lowerName.includes("silver") || lowerName.includes("commodity")) {
        return "Gold FOF";
    }
    
    // Check for Debt keywords
    if (lowerName.includes("ultra short") || lowerName.includes("liquid") || lowerName.includes("savings") || lowerName.includes("duration")) {
        return "Debt / Liquid";
    }
    
    // Default fallback category if no keyword matches
    return "Equity";
}

// ==========================================================================
// 3. TABLE RENDERING ENGINES
// ==========================================================================

// Helper function to generate unique investor profiles (initials, name, PAN) for a fund
function getHolderProfilesForFund(fundTransactions) {
    const uniqueHoldersSet = new Set();
    const holderProfiles = [];
    
    fundTransactions.forEach(transaction => {
        const investorName = transaction.investor_name;
        
        // If we haven't processed this investor yet, add them to the list
        if (!uniqueHoldersSet.has(investorName)) {
            uniqueHoldersSet.add(investorName);
            
            // Get investor initials safely (e.g. "Balaji Muthu" -> "BM")
            const nameParts = (investorName || 'Unknown').split(' ').filter(part => part.length > 0);
            const initials = nameParts.map(part => part[0]).join('').substring(0, 2).toUpperCase() || 'NA';
            
            // Find the investor PAN from our cache for profiling links
            const matchingInvestor = cachedInvestors.find(investor => investor.investor_name === investorName);
            const panCode = matchingInvestor ? matchingInvestor.pan_number : '';
            
            holderProfiles.push({
                initials: initials,
                name: investorName || 'Unknown',
                pan: panCode
            });
        }
    });
    
    return holderProfiles;
}

// Helper function to find the most recent transaction date string for a fund
function getLatestTransactionDate(fundTransactions) {
    if (fundTransactions.length === 0) {
        return "N/A";
    }
    
    // Sort transactions by date in descending order to get the newest date first
    const sortedTransactions = [...fundTransactions].sort((a, b) => {
        return new Date(b.transaction_date) - new Date(a.transaction_date);
    });
    
    return utils.formatDate(sortedTransactions[0].transaction_date);
}

// Helper function to render a single mutual fund table row
function renderFundRow(fund, totalInvestmentAmount, tbodyElement) {
    // Get all transactions for this specific mutual fund
    const fundTransactions = cachedTransactions.filter(transaction => {
        return transaction.mutual_fund_name === fund.mutual_fund_name;
    });
    
    // Get unique investor profiles for this fund
    const holderProfiles = getHolderProfilesForFund(fundTransactions);
    
    // Get the most recent transaction date
    const latestTransactionDateString = getLatestTransactionDate(fundTransactions);

    // Calculate allocation metrics
    const fundAmount = parseFloat(fund.total_amount_invested) || 0;
    const sharePercentage = totalInvestmentAmount > 0 ? (fundAmount / totalInvestmentAmount) * 100 : 0;

    // Pick progress bar colors based on mutual fund category
    let barColor = "#3b82f6"; // Default Blue
    const category = getSchemeCategory(fund.mutual_fund_name);
    if (category === "Equity") {
        barColor = "#10b981"; // Green
    } else if (category === "Gold FOF") {
        barColor = "#f59e0b"; // Yellow
    } else if (category === "Debt / Liquid") {
        barColor = "#8b5cf6"; // Purple
    }

    // Build the avatar bubble elements HTML code
    let holdersHTML = '<div class="avatar-group">';
    const visibleProfiles = holderProfiles.slice(0, 3);
    
    visibleProfiles.forEach(holder => {
        holdersHTML += `
            <a href="investor-details.html?investor_id=${holder.pan}" class="avatar-group-item" title="${holder.name}">
                ${holder.initials}
            </a>
        `;
    });
    
    // If there are more than 3 holders, show a "+X more" bubble indicator
    if (holderProfiles.length > 3) {
        holdersHTML += `<div class="avatar-group-item" title="${holderProfiles.length} total holders">+${holderProfiles.length - 3}</div>`;
    }
    holdersHTML += '</div>';

    // Insert the row directly to our table body element
    const tableRowElement = document.createElement("tr");
    tableRowElement.innerHTML = `
        <td><strong>${fund.mutual_fund_name}</strong></td>
        <td><span style="color: var(--text-secondary); font-weight: 500;">${category}</span></td>
        <td>${holdersHTML}</td>
        <td><span style="color: var(--text-light); font-size: 11px;">${latestTransactionDateString}</span></td>
        <td class="text-right font-semibold text-primary" style="font-family: 'Outfit', sans-serif;">
            ${utils.formatCurrency(fundAmount)}
        </td>
        <td>
            <div class="progress-container">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${sharePercentage.toFixed(1)}%; background: ${barColor};"></div>
                </div>
                <span class="progress-pct">${sharePercentage.toFixed(0)}%</span>
            </div>
        </td>
    `;
    tbodyElement.appendChild(tableRowElement);
}

// Render the Mutual Fund Portfolios table based on active tab and search query
function renderMutualFundTable() {
    const tbodyElement = document.getElementById("tbl_project_summary");
    if (!tbodyElement) return;
    
    tbodyElement.innerHTML = "";
    
    // Calculate total amount to find shares
    const totalAmount = cachedFunds.reduce((sum, item) => sum + item.total_amount_invested, 0);
    
    // Filter mutual funds list using active search & tabs
    const filteredFunds = cachedFunds.filter(fund => {
        const category = getSchemeCategory(fund.mutual_fund_name).toLowerCase();
        
        // Match active tabs category
        if (activeTabFilter === "equity" && category !== "equity") return false;
        if (activeTabFilter === "debt-gold" && category === "equity") return false;
        
        // Match global active search text
        if (activeSearchQuery) {
            const query = activeSearchQuery.toLowerCase();
            const nameMatch = fund.mutual_fund_name.toLowerCase().includes(query);
            const categoryMatch = getSchemeCategory(fund.mutual_fund_name).toLowerCase().includes(query);
            return nameMatch || categoryMatch;
        }
        
        return true;
    });

    // Display empty state message if no mutual funds match criteria
    if (filteredFunds.length === 0) {
        tbodyElement.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 32px; color: var(--text-secondary);">No mutual funds found.</td></tr>`;
        return;
    }

    // Render rows one by one
    filteredFunds.forEach(fund => {
        renderFundRow(fund, totalAmount, tbodyElement);
    });
}

// Render the Recent Transactions list
function renderRecentTransactions() {
    const listContainerElement = document.getElementById("recent_payments_list");
    if (!listContainerElement) return;
    
    listContainerElement.innerHTML = "";
    
    // Sort transactions and grab the top 4 most recent entries
    const recentTransactionsList = [...cachedTransactions]
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 4);

    if (recentTransactionsList.length === 0) {
        listContainerElement.innerHTML = `<div class="text-center" style="padding: 24px; color: var(--text-secondary);">No recent activities.</div>`;
        return;
    }

    // Construct DOM element items
    recentTransactionsList.forEach(transaction => {
        const nameParts = (transaction.investor_name || 'Unknown').split(' ').filter(part => part.length > 0);
        const initials = nameParts.map(part => part[0]).join('').substring(0, 2).toUpperCase() || 'NA';

        const transactionType = transaction.nav_price ? 'Purchase' : 'Switch In';
        const formattedDate = utils.formatDate(transaction.transaction_date);
        const purchaseAmountVal = parseFloat(transaction.purchase_amount) || 0;
        const fundSchemeName = transaction.mutual_fund_name || 'Unknown Fund';
        const panCode = transaction.pan_number || '';
        const investorFullName = transaction.investor_name || 'Unknown';

        const paymentItem = document.createElement("div");
        paymentItem.className = "recent-payment-item";
        paymentItem.innerHTML = `
            <div class="payment-left">
                <a href="investor-details.html?investor_id=${panCode}" class="payment-avatar" style="text-decoration: none;">
                    ${initials}
                </a>
                <div class="payment-meta">
                    <span class="payment-name">${investorFullName}</span>
                    <span class="payment-category">${fundSchemeName}</span>
                </div>
            </div>
            <div class="payment-right">
                <span class="payment-amount">${utils.formatCurrency(purchaseAmountVal)}</span>
                <span class="payment-date">${formattedDate} &bull; ${transactionType}</span>
            </div>
        `;
        listContainerElement.appendChild(paymentItem);
    });
}

// ==========================================================================
// 4. KPI DISPLAY & MANAGEMENT
// ==========================================================================

// Populate all 6 KPI cards on the dashboard view
function renderKpiCards(statsData) {
    const updateText = (elementId, valueText) => {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.textContent = valueText;
        }
    };
    
    updateText("kpi_total_investment", utils.formatCurrency(statsData.total_investment || 0));
    updateText("kpi_total_nav_units", (statsData.total_nav_units || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 }));
    updateText("kpi_total_investors", statsData.total_investors || 0);
    updateText("kpi_total_funds", statsData.total_mutual_funds || 0);
    updateText("kpi_avg_nav", utils.formatCurrency(statsData.average_nav_price || 0));
    updateText("kpi_total_transactions", statsData.total_transactions || 0);
}

// Setup loading placeholders for stats components during API fetches
function showLoadingSkeletons() {
    const totalWealthElement = document.getElementById("stat_total_wealth");
    const activeInvestorsElement = document.getElementById("stat_active_investors");
    const tbodyElement = document.getElementById("tbl_project_summary");
    const recentListElement = document.getElementById("recent_payments_list");

    if (totalWealthElement) totalWealthElement.innerHTML = `<span class="skeleton" style="width: 70px; height: 16px; display: inline-block;"></span>`;
    if (activeInvestorsElement) activeInvestorsElement.innerHTML = `<span class="skeleton" style="width: 30px; height: 16px; display: inline-block;"></span>`;
    if (tbodyElement) tbodyElement.innerHTML = `<tr><td colspan="6" class="text-center"><span class="skeleton" style="width: 100%; height: 60px; display: inline-block;"></span></td></tr>`;
    if (recentListElement) recentListElement.innerHTML = `<span class="skeleton" style="width: 100%; height: 150px; display: inline-block;"></span>`;
}

// Setup static error empty-states if backend fails
function showDatabaseErrorState() {
    const tbodyElement = document.getElementById("tbl_project_summary");
    const recentListElement = document.getElementById("recent_payments_list");
    if (tbodyElement) tbodyElement.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#94a3b8;">Could not connect to database.</td></tr>`;
    if (recentListElement) recentListElement.innerHTML = `<div style="text-align:center;padding:24px;color:#94a3b8;">No recent transactions.</div>`;
}

// Fetch dashboard dataset and populates/renders all visual UI items
export async function refreshDashboardData(fromDateVal = "", toDateVal = "") {
    showLoadingSkeletons();

    try {
        // Run API promises in parallel
        const [dashboardStats, investorsList, fundsSummary, transactionsResponse] = await Promise.all([
            api.fetchDashboardStats(fromDateVal, toDateVal),
            api.fetchInvestorList(fromDateVal, toDateVal),
            api.fetchMutualFundSummary(fromDateVal, toDateVal),
            api.fetchTransactions({ from: fromDateVal, to: toDateVal, size: 5000 })
        ]);

        // Assign results to local caches safely
        cachedFunds = Array.isArray(fundsSummary) ? fundsSummary : [];
        cachedTransactions = Array.isArray(transactionsResponse?.data) ? transactionsResponse.data : [];
        cachedInvestors = Array.isArray(investorsList) ? investorsList : [];

        // 1. Populate all 6 top KPI cards
        if (dashboardStats) {
            renderKpiCards(dashboardStats);
        }

        // 2. Populate total wealth valuation parameters
        const totalInvestmentValuation = cachedFunds.reduce((sum, item) => sum + (parseFloat(item.total_amount_invested) || 0), 0);
        
        const totalWealthElement = document.getElementById("stat_total_wealth");
        if (totalWealthElement) {
            totalWealthElement.textContent = utils.formatCurrency(totalInvestmentValuation);
        }
        
        const activeInvestorsElement = document.getElementById("stat_active_investors");
        if (activeInvestorsElement) {
            activeInvestorsElement.textContent = cachedInvestors.length;
        }

        // 3. Render mutual funds grid list
        renderMutualFundTable();

        // 4. Render recent activity transaction rows
        renderRecentTransactions();

        // 5. Render the 3 dashboard charts using already-fetched cache data
        renderBarChart();
        renderDoughnutChart();
        renderLineChart();

    } catch (error) {
        console.error("Dashboard load error:", error);
        utils.showToast(error.message || "Failed to load dashboard data.", "error");
        showDatabaseErrorState();
    }
}

// ==========================================================================
// 5. DASHBOARD CHARTS (Bar, Doughnut, Line)
// ==========================================================================

// Shared color palette — each mutual fund always gets the same color
// across both Bar Chart and Doughnut Chart.
const FUND_COLORS = [
    "#4a3aff", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6",
    "#ec4899", "#64748b"
];

// This object maps each fund name to a fixed color index.
// It is built once when charts first render and reused on every refresh.
const fundColorMap = {};

// Helper: returns the consistent color for a given fund name.
// If a fund is seen for the first time, it gets the next available color.
function getColorForFund(fundName) {
    if (!fundColorMap[fundName]) {
        const usedCount = Object.keys(fundColorMap).length;
        fundColorMap[fundName] = FUND_COLORS[usedCount % FUND_COLORS.length];
    }
    return fundColorMap[fundName];
}

// Chart 1: Bar Chart — Total Investment per Mutual Fund
// Uses cachedFunds which is already fetched in refreshDashboardData
function renderBarChart() {
    const canvasElement = document.getElementById("chart_bar_investments");
    if (!canvasElement) return;

    // Destroy the old chart instance before drawing a new one
    if (chartBarInstance) {
        chartBarInstance.destroy();
        chartBarInstance = null;
    }

    // Handle empty data safely
    if (cachedFunds.length === 0) return;

    // Get fund names and their total investment amounts
    // Guard against undefined/null names so no label shows as "undefined"
    const fundLabels = cachedFunds.map(fund => fund.mutual_fund_name || "Unknown");
    const fundAmounts = cachedFunds.map(fund => parseFloat(fund.total_amount_invested) || 0);

    // Get consistent color for each fund using the shared color map
    const barColors = fundLabels.map(name => getColorForFund(name));

    // Draw the bar chart using Chart.js
    chartBarInstance = new Chart(canvasElement, {
        type: "bar",
        data: {
            labels: fundLabels,
            datasets: [{
                label: "Total Investment (₹)",
                data: fundAmounts,
                backgroundColor: barColors.map(c => c + "bf"), // bf = ~75% opacity in hex
                borderColor: barColors,
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        // Show rupee formatted values in tooltip
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            return " ₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 9 },
                        maxRotation: 30,
                        // Shorten long fund names on x-axis labels
                        callback: function(value, index) {
                            const label = fundLabels[index] || "";
                            return label.length > 14 ? label.substring(0, 14) + "…" : label;
                        }
                    },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        font: { size: 9 },
                        callback: function(value) {
                            // Show values in lakhs/crores shorthand on y-axis
                            if (value >= 10000000) return "₹" + (value / 10000000).toFixed(1) + "Cr";
                            if (value >= 100000) return "₹" + (value / 100000).toFixed(1) + "L";
                            if (value >= 1000) return "₹" + (value / 1000).toFixed(1) + "K";
                            return "₹" + value;
                        }
                    },
                    grid: { color: "rgba(0,0,0,0.05)" }
                }
            }
        }
    });
}

// Chart 2: Doughnut Chart — Fund Distribution by percentage
// Uses same cachedFunds data (no extra API call needed)
function renderDoughnutChart() {
    const canvasElement = document.getElementById("chart_doughnut_distribution");
    if (!canvasElement) return;

    // Destroy the old chart instance before drawing a new one
    if (chartDoughnutInstance) {
        chartDoughnutInstance.destroy();
        chartDoughnutInstance = null;
    }

    // Handle empty data safely
    if (cachedFunds.length === 0) return;

    // Get fund names and their amounts for the doughnut slices
    // Guard against undefined/null names so no label shows as "undefined"
    const fundLabels = cachedFunds.map(fund => fund.mutual_fund_name || "Unknown");
    const fundAmounts = cachedFunds.map(fund => parseFloat(fund.total_amount_invested) || 0);

    // Get consistent colors using the same shared color map as the Bar Chart
    const sliceColors = fundLabels.map(name => getColorForFund(name));

    // Draw the doughnut chart using Chart.js
    chartDoughnutInstance = new Chart(canvasElement, {
        type: "doughnut",
        data: {
            labels: fundLabels,
            datasets: [{
                data: fundAmounts,
                backgroundColor: sliceColors.slice(0, fundLabels.length),
                borderWidth: 2,
                borderColor: "#ffffff",
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { size: 9 },
                        boxWidth: 10,
                        padding: 8,
                        // Shorten long fund names in legend
                        // Read directly from chart.data.labels (which we control and guard with || "Unknown")
                        // Avoids "undefined" that can occur when calling Chart.defaults.generateLabels too early
                        generateLabels: function(chart) {
                            const labels = chart.data.labels || [];
                            const colors = chart.data.datasets[0]?.backgroundColor || [];
                            return labels.map(function(label, index) {
                                const displayText = (label && label.length > 16) ? label.substring(0, 16) + "…" : (label || "Unknown");
                                return {
                                    text: displayText,
                                    fillStyle: colors[index] || "#64748b",
                                    strokeStyle: "#ffffff",
                                    lineWidth: 2,
                                    hidden: false,
                                    index: index
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return " ₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " (" + pct + "%)";
                        }
                    }
                }
            }
        }
    });
}

// Chart 3: Line Chart — Investment Trend over time
// Uses cachedTransactions — groups purchase amounts by transaction date
function renderLineChart() {
    const canvasElement = document.getElementById("chart_line_trend");
    if (!canvasElement) return;

    // Destroy the old chart instance before drawing a new one
    if (chartLineInstance) {
        chartLineInstance.destroy();
        chartLineInstance = null;
    }

    // Handle empty data safely
    if (cachedTransactions.length === 0) return;

    // Step 1: Group all transaction amounts by their date
    const dailyTotals = {};
    cachedTransactions.forEach(transaction => {
        const dateKey = transaction.transaction_date ? transaction.transaction_date.substring(0, 10) : null;
        if (!dateKey) return;
        const amount = parseFloat(transaction.purchase_amount) || 0;
        if (dailyTotals[dateKey]) {
            dailyTotals[dateKey] += amount;
        } else {
            dailyTotals[dateKey] = amount;
        }
    });

    // Step 2: Sort dates in ascending order for the line chart
    const sortedDates = Object.keys(dailyTotals).sort();
    const sortedAmounts = sortedDates.map(date => dailyTotals[date]);

    // Step 3: Format date labels for display (e.g. "15 Jan")
    const dateLabels = sortedDates.map(dateStr => {
        const dateObj = new Date(dateStr);
        return dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    });

    // Draw the line chart using Chart.js
    chartLineInstance = new Chart(canvasElement, {
        type: "line",
        data: {
            labels: dateLabels,
            datasets: [{
                label: "Daily Investment (₹)",
                data: sortedAmounts,
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.10)",
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#10b981",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            return " ₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { font: { size: 9 }, maxRotation: 30 },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        font: { size: 9 },
                        callback: function(value) {
                            if (value >= 10000000) return "₹" + (value / 10000000).toFixed(1) + "Cr";
                            if (value >= 100000) return "₹" + (value / 100000).toFixed(1) + "L";
                            if (value >= 1000) return "₹" + (value / 1000).toFixed(1) + "K";
                            return "₹" + value;
                        }
                    },
                    grid: { color: "rgba(0,0,0,0.05)" }
                }
            }
        }
    });
}

// ==========================================================================
// 6. EVENT BINDINGS & BOOTSTRAP
// ==========================================================================

// Bind DOM event listeners for search filters, tabs clicking and export buttons
function initDashboardBindings() {
    // Search filter input listener
    const searchInputElement = document.getElementById("search_global");
    if (searchInputElement) {
        searchInputElement.addEventListener("input", (event) => {
            activeSearchQuery = event.target.value;
            renderMutualFundTable();
        });
    }

    // Tabs navigation buttons selection
    const tabsButtons = document.querySelectorAll(".tab-btn");
    tabsButtons.forEach(tab => {
        tab.addEventListener("click", () => {
            tabsButtons.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeTabFilter = tab.dataset.filter;
            renderMutualFundTable();
        });
    });

    // Combined download CSV trigger
    const exportButton = document.getElementById("btn_export_data");
    if (exportButton) {
        exportButton.addEventListener("click", () => {
            api.downloadExport("transactions", currentFilters.from, currentFilters.to);
        });
    }
}

// DomContentLoaded Bootstrapper coordinating standard routers matching current URL
document.addEventListener("DOMContentLoaded", () => {
    initLayout();

    const currentPath = window.location.pathname;

    // Route: index.html or root endpoint
    if (currentPath.endsWith("index.html") || currentPath.endsWith("/")) {
        initDashboardBindings();
        initDateFilters(
            (from, to) => refreshDashboardData(from, to),
            () => refreshDashboardData()
        );
        refreshDashboardData(currentFilters.from, currentFilters.to);
    } 
    // Route: transactions.html
    else if (currentPath.endsWith("transactions.html")) {
        initDateFilters(
            () => initTransactionsView(),
            () => initTransactionsView()
        );
        initTransactionsView();
    } 
    // Route: add-investor.html
    else if (currentPath.endsWith("add-investor.html")) {
        initAddInvestorForm();
    } 
    // Route: investor-details.html
    else if (currentPath.endsWith("investor-details.html")) {
        initInvestorDetailsView();
    }
    // Route: investors.html
    else if (currentPath.endsWith("investors.html")) {
        initDateFilters(
            (from, to) => initInvestorsListPage(from, to),
            () => initInvestorsListPage()
        );
        initInvestorsListPage(currentFilters.from, currentFilters.to);
    }
    // Route: funds.html
    else if (currentPath.endsWith("funds.html")) {
        initDateFilters(
            (from, to) => initFundsPage(from, to),
            () => initFundsPage()
        );
        initFundsPage(currentFilters.from, currentFilters.to);
    }
    // Route: analytics.html
    else if (currentPath.endsWith("analytics.html")) {
        initDateFilters(
            (from, to) => initAnalyticsPage(from, to),
            () => initAnalyticsPage()
        );
        initAnalyticsPage(currentFilters.from, currentFilters.to);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
