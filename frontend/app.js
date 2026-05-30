// API Configuration
const API_BASE_URL = "http://localhost:8000/api";

// Application State
let state = {
    currentTab: "overview",
    filters: {
        from_date: "",
        to_date: ""
    },
    data: {
        investorSummary: [],       // /api/investor-summary
        fundSummaryByInvestor: [], // /api/fund-summary-by-investor
        investorList: [],          // /api/investors
        mutualFundSummary: []      // /api/mutual-fund-summary
    },
    charts: {
        fundAllocation: null,
        investorShare: null
    }
};

// DOM Elements
const elements = {
    // Sidebar Tabs
    navItems: document.querySelectorAll(".nav-item"),
    sections: document.querySelectorAll(".dashboard-section"),
    
    // Filters
    fromDateInput: document.getElementById("from_date"),
    toDateInput: document.getElementById("to_date"),
    applyFilterBtn: document.getElementById("apply_filter"),
    clearFilterBtn: document.getElementById("clear_filter"),
    
    // KPI Cards
    kpiTotalAmount: document.getElementById("kpi_total_amount"),
    kpiTotalUnits: document.getElementById("kpi_total_units"),
    kpiTotalInvestors: document.getElementById("kpi_total_investors"),
    kpiTotalFunds: document.getElementById("kpi_total_funds"),
    
    // Tables
    tblInvestorFund: document.getElementById("tbl_investor_fund").querySelector("tbody"),
    tblFundInvestor: document.getElementById("tbl_fund_investor").querySelector("tbody"),
    tblInvestorList: document.getElementById("tbl_investor_list").querySelector("tbody"),
    tblMutualFund: document.getElementById("tbl_mutual_fund").querySelector("tbody"),
    
    // Search Fields
    searchInvestorFund: document.getElementById("search_investor_fund"),
    searchFundInvestor: document.getElementById("search_fund_investor"),
    searchInvestors: document.getElementById("search_investors"),
    searchMutualFund: document.getElementById("search_mutual_fund"),
    
    // Alerts
    errorAlert: document.getElementById("error_alert"),
    errorMessage: document.getElementById("error_message")
};

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

// Format numeric values to Indian Rupee (INR) format
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(value);
}

// Format units with high precision decimal representation
function formatUnits(value) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    }).format(value);
}

// Format date into a more human-readable format
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Create a reusable spinner HTML for table loading states
function getLoadingSpinnerHTML(colSpan, message) {
    return `
        <tr>
            <td colspan="${colSpan}" class="text-center">
                <div class="spinner"></div>
                <p style="color: var(--text-secondary); font-size: 13px;">${message}</p>
            </td>
        </tr>
    `;
}

// Create a reusable empty state HTML for tables
function getEmptyStateHTML(colSpan) {
    return `
        <tr>
            <td colspan="${colSpan}">
                <div class="empty-state">
                    <i data-lucide="inbox"></i>
                    <h3>No Records Found</h3>
                    <p>No transaction data matches the selected date range or search terms.</p>
                </div>
            </td>
        </tr>
    `;
}

// ==========================================================================
// TAB NAVIGATION MANAGEMENT
// ==========================================================================
function initNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Remove active classes
            elements.navItems.forEach(nav => nav.classList.remove("active"));
            elements.sections.forEach(sec => sec.classList.remove("active"));
            
            // Set active class
            item.classList.add("active");
            const tabId = item.getAttribute("data-tab");
            state.currentTab = tabId;
            
            const targetSection = document.getElementById(`section_${tabId}`);
            if (targetSection) {
                targetSection.classList.add("active");
            }
            
            // Re-render corresponding data
            renderAllComponents();
            
            // Render Lucide icons in newly rendered elements
            lucide.createIcons();
        });
    });
}

// ==========================================================================
// FETCH ANALYTICS DATA FROM BACKEND
// ==========================================================================
async function fetchDashboardData() {
    // Show spinner loading states in all tables
    elements.tblInvestorFund.innerHTML = getLoadingSpinnerHTML(4, "Fetching investor summaries...");
    elements.tblFundInvestor.innerHTML = getLoadingSpinnerHTML(4, "Fetching fund portfolios...");
    elements.tblInvestorList.innerHTML = getLoadingSpinnerHTML(3, "Loading investor directory...");
    elements.tblMutualFund.innerHTML = getLoadingSpinnerHTML(4, "Loading mutual fund analytics...");
    
    // Hide error alert
    elements.errorAlert.classList.add("hidden");
    
    // Construct query parameters
    let queryParams = "";
    if (state.filters.from_date || state.filters.to_date) {
        const params = new URLSearchParams();
        if (state.filters.from_date) params.append("from_date", state.filters.from_date);
        if (state.filters.to_date) params.append("to_date", state.filters.to_date);
        queryParams = "?" + params.toString();
    }
    
    try {
        // Fetch all 4 API endpoints concurrently
        const [resInvestorFund, resFundInvestor, resInvestors, resMutualFund] = await Promise.all([
            fetch(`${API_BASE_URL}/investor-summary${queryParams}`),
            fetch(`${API_BASE_URL}/fund-summary-by-investor${queryParams}`),
            fetch(`${API_BASE_URL}/investors${queryParams}`),
            fetch(`${API_BASE_URL}/mutual-fund-summary${queryParams}`)
        ]);
        
        // Handle API failures
        if (!resInvestorFund.ok || !resFundInvestor.ok || !resInvestors.ok || !resMutualFund.ok) {
            // Read details if returned by backend (e.g. 400 Bad Request)
            const errRes = await resInvestorFund.json().catch(() => ({}));
            throw new Error(errRes.detail || "One or more APIs failed to load successfully.");
        }
        
        // Populate state values
        state.data.investorSummary = await resInvestorFund.json();
        state.data.fundSummaryByInvestor = await resFundInvestor.json();
        state.data.investorList = await resInvestors.json();
        state.data.mutualFundSummary = await resMutualFund.json();
        
        // Update components
        renderAllComponents();
        
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        
        // Display user-friendly alert
        elements.errorMessage.textContent = error.message || "Failed to load dashboard data. Ensure backend is running at localhost:8000.";
        elements.errorAlert.classList.remove("hidden");
        
        // Reset metrics
        elements.kpiTotalAmount.textContent = "₹0.00";
        elements.kpiTotalUnits.textContent = "0.0000";
        elements.kpiTotalInvestors.textContent = "0";
        elements.kpiTotalFunds.textContent = "0";
        
        // Clear tables
        elements.tblInvestorFund.innerHTML = getEmptyStateHTML(4);
        elements.tblFundInvestor.innerHTML = getEmptyStateHTML(4);
        elements.tblInvestorList.innerHTML = getEmptyStateHTML(3);
        elements.tblMutualFund.innerHTML = getEmptyStateHTML(4);
        
        lucide.createIcons();
    }
}

// ==========================================================================
// RENDER METHODS
// ==========================================================================

function renderAllComponents() {
    // 1. Calculate and update KPI Overview Card values
    renderKPIs();
    
    // 2. Render lists/tables depending on current view/search filters
    renderInvestorFundTable();
    renderFundInvestorTable();
    renderInvestorListTable();
    renderMutualFundTable();
    
    // 3. Render charts in the Overview Tab
    if (state.currentTab === "overview") {
        renderCharts();
    }
}

// KPI Render logic
function renderKPIs() {
    // Calculate total amount from mutual fund summaries
    const totalAmount = state.data.mutualFundSummary.reduce((sum, item) => sum + item.total_amount_invested, 0);
    const totalUnits = state.data.mutualFundSummary.reduce((sum, item) => sum + item.total_nav_units, 0);
    
    // Count active unique investors
    const totalInvestors = state.data.investorList.length;
    const totalFunds = state.data.mutualFundSummary.length;
    
    elements.kpiTotalAmount.textContent = formatCurrency(totalAmount);
    elements.kpiTotalUnits.textContent = formatUnits(totalUnits);
    elements.kpiTotalInvestors.textContent = totalInvestors;
    elements.kpiTotalFunds.textContent = totalFunds;
}

// Table 1: Investor-wise Purchase Summary per Mutual Fund
function renderInvestorFundTable() {
    const searchVal = elements.searchInvestorFund.value.toLowerCase().trim();
    const tbody = elements.tblInvestorFund;
    tbody.innerHTML = "";
    
    // Apply local search filter
    const filtered = state.data.investorSummary.filter(item => 
        item.investor_name.toLowerCase().includes(searchVal) ||
        item.mutual_fund_name.toLowerCase().includes(searchVal)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = getEmptyStateHTML(4);
        lucide.createIcons();
        return;
    }
    
    filtered.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${row.investor_name}</strong></td>
            <td>${row.mutual_fund_name}</td>
            <td class="text-right"><strong>${formatCurrency(row.total_purchase_amount)}</strong></td>
            <td class="text-right">${formatUnits(row.total_nav_units)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Table 2: Mutual Fund-wise Summary per Investor
function renderFundInvestorTable() {
    const searchVal = elements.searchFundInvestor.value.toLowerCase().trim();
    const tbody = elements.tblFundInvestor;
    tbody.innerHTML = "";
    
    const filtered = state.data.fundSummaryByInvestor.filter(item => 
        item.mutual_fund_name.toLowerCase().includes(searchVal) ||
        item.investor_name.toLowerCase().includes(searchVal)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = getEmptyStateHTML(4);
        lucide.createIcons();
        return;
    }
    
    filtered.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${row.mutual_fund_name}</strong></td>
            <td>${row.investor_name}</td>
            <td class="text-right"><strong>${formatCurrency(row.total_amount_invested)}</strong></td>
            <td class="text-right">${formatUnits(row.total_nav_units)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Table 3: Investor List
function renderInvestorListTable() {
    const searchVal = elements.searchInvestors.value.toLowerCase().trim();
    const tbody = elements.tblInvestorList;
    tbody.innerHTML = "";
    
    const filtered = state.data.investorList.filter(item => 
        item.investor_name.toLowerCase().includes(searchVal) ||
        item.pan_number.toLowerCase().includes(searchVal)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = getEmptyStateHTML(3);
        lucide.createIcons();
        return;
    }
    
    filtered.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${row.investor_name}</strong></td>
            <td><code>${row.pan_number}</code></td>
            <td class="text-right"><strong>${formatCurrency(row.total_amount_invested)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// Table 4: Mutual Fund Summary
function renderMutualFundTable() {
    const searchVal = elements.searchMutualFund.value.toLowerCase().trim();
    const tbody = elements.tblMutualFund;
    tbody.innerHTML = "";
    
    const filtered = state.data.mutualFundSummary.filter(item => 
        item.mutual_fund_name.toLowerCase().includes(searchVal)
    );
    
    if (filtered.length === 0) {
        tbody.innerHTML = getEmptyStateHTML(4);
        lucide.createIcons();
        return;
    }
    
    filtered.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${row.mutual_fund_name}</strong></td>
            <td class="text-right"><strong>${formatCurrency(row.total_amount_invested)}</strong></td>
            <td class="text-right">${formatUnits(row.total_nav_units)}</td>
            <td class="text-right">₹${row.average_nav.toFixed(4)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// CHARTS RENDER USING CHART.JS
// ==========================================================================
function renderCharts() {
    // 1. Allocation Doughnut Chart (by Mutual Fund)
    const fundLabels = state.data.mutualFundSummary.map(item => item.mutual_fund_name);
    const fundAmounts = state.data.mutualFundSummary.map(item => item.total_amount_invested);
    
    if (state.charts.fundAllocation) {
        state.charts.fundAllocation.destroy();
    }
    
    const fundCtx = document.getElementById("fundAllocationChart").getContext("2d");
    
    if (fundLabels.length === 0) {
        // Draw empty text on canvas if no data
        fundCtx.clearRect(0, 0, 400, 400);
        fundCtx.font = "14px Inter";
        fundCtx.fillStyle = "#94a3b8";
        fundCtx.textAlign = "center";
        fundCtx.fillText("No dataset available", 200, 140);
    } else {
        state.charts.fundAllocation = new Chart(fundCtx, {
            type: 'doughnut',
            data: {
                labels: fundLabels,
                datasets: [{
                    data: fundAmounts,
                    backgroundColor: [
                        '#00e5ff', // Cyan
                        '#2979ff', // Blue
                        '#d500f9', // Purple
                        '#00e676', // Green
                        '#ff1744'  // Red
                    ],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11 },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 2. Bar Chart of Investor shares
    const investorLabels = state.data.investorList.map(item => item.investor_name);
    const investorShares = state.data.investorList.map(item => item.total_amount_invested);
    
    if (state.charts.investorShare) {
        state.charts.investorShare.destroy();
    }
    
    const investorCtx = document.getElementById("investorShareChart").getContext("2d");
    
    if (investorLabels.length === 0) {
        investorCtx.clearRect(0, 0, 400, 400);
        investorCtx.font = "14px Inter";
        investorCtx.fillStyle = "#94a3b8";
        investorCtx.textAlign = "center";
        investorCtx.fillText("No dataset available", 200, 140);
    } else {
        state.charts.investorShare = new Chart(investorCtx, {
            type: 'bar',
            data: {
                labels: investorLabels,
                datasets: [{
                    label: 'Total Invested Amount (₹)',
                    data: investorShares,
                    backgroundColor: 'rgba(0, 229, 255, 0.3)',
                    borderColor: '#00e5ff',
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
                            label: function(context) {
                                return ` Invested: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8', font: { family: 'Inter' } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { 
                            color: '#94a3b8', 
                            font: { family: 'Inter' },
                            callback: function(val) {
                                if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                                return `₹${val}`;
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    }
}

// ==========================================================================
// SEARCH & EVENT LISTENERS SETUP
// ==========================================================================
function initEvents() {
    // Apply Date Range Filter Click handler
    elements.applyFilterBtn.addEventListener("click", () => {
        const fromDateVal = elements.fromDateInput.value;
        const toDateVal = elements.toDateInput.value;
        
        // Basic Validation
        if (fromDateVal && toDateVal && fromDateVal > toDateVal) {
            elements.errorMessage.textContent = "Error: 'From' date cannot be later than 'To' date.";
            elements.errorAlert.classList.remove("hidden");
            lucide.createIcons();
            return;
        }
        
        state.filters.from_date = fromDateVal;
        state.filters.to_date = toDateVal;
        fetchDashboardData();
    });
    
    // Reset Filters Click handler
    elements.clearFilterBtn.addEventListener("click", () => {
        elements.fromDateInput.value = "";
        elements.toDateInput.value = "";
        state.filters.from_date = "";
        state.filters.to_date = "";
        fetchDashboardData();
    });
    
    // Bind search bar listeners
    elements.searchInvestorFund.addEventListener("input", renderInvestorFundTable);
    elements.searchFundInvestor.addEventListener("input", renderFundInvestorTable);
    elements.searchInvestors.addEventListener("input", renderInvestorListTable);
    elements.searchMutualFund.addEventListener("input", renderMutualFundTable);
}

// ==========================================================================
// INITIALIZATION ON PAGE LOAD
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initEvents();
    fetchDashboardData();
});
