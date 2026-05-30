// WealthFeed Investors & Transactions Forms Controller
// Handles add-investor.html and investor-details.html

import * as api from './api.js';
import * as utils from './utils.js';

// ==========================================================================
// 1. ADD TRANSACTION FORM ENGINE (add-investor.html)
// ==========================================================================

export function initAddInvestorForm() {
    const form = document.getElementById("frm_add_txn");
    if (!form) return;

    const btnSubmit = form.querySelector("button[type='submit']");
    
    // Auto calculations variables
    const amountInput = document.getElementById("purchase_amount");
    const unitsInput = document.getElementById("nav_units");
    const priceInput = document.getElementById("nav_price");

    // Dynamic Autocalculation helper
    function handleAutoCalc() {
        const amount = parseFloat(amountInput.value);
        const units = parseFloat(unitsInput.value);
        
        if (!isNaN(amount) && !isNaN(units) && units > 0) {
            priceInput.value = (amount / units).toFixed(4);
        } else {
            priceInput.value = "";
        }
    }

    if (amountInput && unitsInput) {
        amountInput.addEventListener("input", handleAutoCalc);
        unitsInput.addEventListener("input", handleAutoCalc);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Reset field validations
        form.querySelectorAll(".form-error").forEach(el => {
            el.textContent = "";
            el.classList.add("hidden");
        });
        form.querySelectorAll("input").forEach(el => el.classList.remove("input-error"));

        // Extract inputs
        const investor_name = document.getElementById("investor_name").value.trim();
        const pan_number = document.getElementById("pan_number").value.trim().toUpperCase();
        const mutual_fund_name = document.getElementById("mutual_fund_name").value.trim();
        const transaction_date = document.getElementById("transaction_date").value;
        const purchase_amount = parseFloat(document.getElementById("purchase_amount").value);
        const nav_units = parseFloat(document.getElementById("nav_units").value);
        const nav_price = parseFloat(document.getElementById("nav_price").value) || null;

        // Perform Client-side validations
        let hasErrors = false;

        function setError(fieldId, message) {
            const errorEl = document.getElementById(`err_${fieldId}`);
            const inputEl = document.getElementById(fieldId);
            if (errorEl && inputEl) {
                errorEl.textContent = message;
                errorEl.classList.remove("hidden");
                inputEl.classList.add("input-error");
            }
            hasErrors = true;
        }

        if (investor_name.length < 2) {
            setError("investor_name", "Investor Name must be at least 2 characters.");
        }

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(pan_number)) {
            setError("pan_number", "Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F).");
        }

        if (mutual_fund_name.length < 3) {
            setError("mutual_fund_name", "Please specify a valid Mutual Fund scheme.");
        }

        if (!transaction_date) {
            setError("transaction_date", "Please pick a transaction date.");
        }

        if (isNaN(purchase_amount) || purchase_amount <= 0) {
            setError("purchase_amount", "Purchase Amount must be a positive number.");
        }

        if (isNaN(nav_units) || nav_units <= 0) {
            setError("nav_units", "NAV Units must be a positive number.");
        }

        if (hasErrors) {
            utils.showToast("Please correct the errors in the form.", "warning");
            return;
        }

        // Disable submit button during fetch
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-sm"></span> Creating Record...`;

        try {
            await api.createTransaction({
                investor_name,
                pan_number,
                mutual_fund_name,
                transaction_date,
                purchase_amount,
                nav_units,
                nav_price
            });

            utils.showToast("Transaction recorded successfully! Redirecting to Dashboard...", "success");
            form.reset();
            if (priceInput) priceInput.value = "";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
            
        } catch (err) {
            utils.showToast(err.message || "Failed to create transaction.", "error");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `Create Transaction`;
        }
    });
}


// ==========================================================================
// 2. INVESTOR DETAILS PROFILE RENDERING (investor-details.html)
// ==========================================================================

export async function initInvestorDetailsView() {
    const profileCard = document.getElementById("investor_profile_card");
    if (!profileCard) return;

    const params = utils.getQueryParams();
    const investorPan = params.investor_id;

    if (!investorPan) {
        utils.showToast("No Investor PAN specified in URL.", "error");
        profileCard.innerHTML = `<div class="error-panel">Missing URL query parameter ?investor_id=PAN</div>`;
        return;
    }

    // Set loading skeletons
    profileCard.innerHTML = utils.getCardSkeletonHTML();
    const tbody = document.getElementById("tbl_investor_txns");
    if (tbody) tbody.innerHTML = utils.getTableSkeletonHTML(5, 4);

    try {
        // Fetch all transactions for this specific investor (searching by their unique PAN)
        const response = await api.fetchTransactions({
            search: investorPan,
            size: 1000 // Get all history for stats
        });

        const txns = response.data.filter(t => t.pan_number === investorPan);

        if (txns.length === 0) {
            profileCard.innerHTML = `
                <div class="empty-state">
                    <h3>Investor Profile Not Found</h3>
                    <p>No transaction history recorded for PAN code <code>${investorPan}</code>.</p>
                    <a href="index.html" class="btn btn-primary">Go to Home</a>
                </div>
            `;
            if (tbody) tbody.innerHTML = utils.getEmptyStateHTML(5, "No history available.");
            return;
        }

        // Aggregate statistics dynamically
        const investorName = txns[0].investor_name;
        const totalInvested = txns.reduce((sum, t) => sum + t.purchase_amount, 0);
        const totalUnits = txns.reduce((sum, t) => sum + t.nav_units, 0);
        const fundNames = new Set(txns.map(t => t.mutual_fund_name));
        const avgNav = totalUnits > 0 ? (totalInvested / totalUnits) : 0;

        // Render Profile card
        profileCard.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <span>${investorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                </div>
                <div class="profile-identity">
                    <h2>${investorName}</h2>
                    <p class="profile-pan">PAN: <code>${investorPan}</code></p>
                </div>
            </div>
            <div class="profile-stats-grid">
                <div class="pstat-card">
                    <label>Total Wealth Portfolio</label>
                    <span class="pstat-val text-primary">${utils.formatCurrency(totalInvested)}</span>
                </div>
                <div class="pstat-card">
                    <label>Accumulated NAV Units</label>
                    <span class="pstat-val">${utils.formatUnits(totalUnits)}</span>
                </div>
                <div class="pstat-card">
                    <label>Weighted Avg NAV Price</label>
                    <span class="pstat-val">₹${avgNav.toFixed(4)}</span>
                </div>
                <div class="pstat-card">
                    <label>Active Fund Portfolios</label>
                    <span class="pstat-val text-emerald">${fundNames.size} Schemes</span>
                </div>
            </div>
        `;

        // Render Transaction list table
        renderInvestorHistoryTable(txns);

        // Render Fund Allocation Doughnut Chart for this investor
        renderInvestorFundAllocation(txns);

    } catch (err) {
        utils.showToast(err.message || "Failed to load investor details.", "error");
        profileCard.innerHTML = `<div class="error-panel">Error communicating with API backend.</div>`;
    }
}

/**
 * Render history rows for specific investor details profile.
 */
function renderInvestorHistoryTable(transactions) {
    const tbody = document.getElementById("tbl_investor_txns");
    if (!tbody) return;
    tbody.innerHTML = "";

    transactions.forEach(txn => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>#${txn.id}</code></td>
            <td><strong>${txn.mutual_fund_name}</strong></td>
            <td class="text-center">${utils.formatDate(txn.transaction_date)}</td>
            <td class="text-right font-semibold text-primary">${utils.formatCurrency(txn.purchase_amount)}</td>
            <td class="text-right">${utils.formatUnits(txn.nav_units)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Custom Chart.js allocation chart specifically for an individual investor's holdings
 */
function renderInvestorFundAllocation(transactions) {
    const canvas = document.getElementById("investor_alloc_chart");
    if (!canvas || !window.Chart) return;

    // Aggregate holdings by fund name
    const allocations = {};
    transactions.forEach(t => {
        if (!allocations[t.mutual_fund_name]) {
            allocations[t.mutual_fund_name] = 0;
        }
        allocations[t.mutual_fund_name] += t.purchase_amount;
    });

    const labels = Object.keys(allocations);
    const data = Object.values(allocations);

    const palette = [
        '#4a3aff', '#00e5ff', '#2979ff', '#00e676', '#d500f9', '#ff1744', '#fbc02d'
    ];

    new window.Chart(canvas.getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: palette,
                borderWidth: 1.5,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#64748b',
                        font: { family: 'Inter', size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => ` Investment: ₹${context.raw.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                    }
                }
            },
            cutout: '60%'
        }
    });
}
