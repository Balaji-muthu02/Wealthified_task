// WealthFeed Transaction Management Controller (transactions.html)

import * as api from './api.js';
import * as utils from './utils.js';
import { currentFilters } from './filters.js';

// Table pagination and sorting local state
const state = {
    page: 1,
    size: 20,
    search: "",
    sortBy: "transaction_date",
    sortOrder: "desc",
    totalRecords: 0,
    totalPages: 1
};

/**
 * Load and render transactions based on active page state and global filters.
 */
export async function loadTransactionsTable() {
    const tbody = document.getElementById("tbl_transactions");
    if (!tbody) return;

    tbody.innerHTML = utils.getTableSkeletonHTML(8, state.size);

    const fromDate = localStorage.getItem("wealthfeed_filter_from") || "";
    const toDate = localStorage.getItem("wealthfeed_filter_to") || "";

    try {
        const response = await api.fetchTransactions({
            page: state.page,
            size: state.size,
            search: state.search,
            sortBy: state.sortBy,
            sortOrder: state.sortOrder,
            from: fromDate,
            to: toDate
        });

        state.totalRecords = response.total_records;
        state.totalPages = response.total_pages;
        state.page = response.current_page;

        renderTableRows(response.data);
        renderPaginationControls();
        updateSortIcons();

        // Populate pagination info
        const infoEl = document.getElementById("pagination_info");
        if (infoEl) {
            const startIdx = state.totalRecords > 0 ? (state.page - 1) * state.size + 1 : 0;
            const endIdx = Math.min(state.page * state.size, state.totalRecords);
            infoEl.textContent = state.totalRecords > 0 
                ? `Showing ${startIdx} to ${endIdx} of ${state.totalRecords} entries`
                : "Showing 0 entries";
        }

    } catch (err) {
        utils.showToast(err.message || "Failed to load transactions.", "error");
        tbody.innerHTML = utils.getEmptyStateHTML(8, "Error loading transactions from server.");
    }
}

/**
 * Build and attach transaction table rows to DOM.
 */
function renderTableRows(transactions) {
    const tbody = document.getElementById("tbl_transactions");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (transactions.length === 0) {
        tbody.innerHTML = utils.getEmptyStateHTML(8, "No transactions found matching your criteria.");
        return;
    }

    transactions.forEach(txn => {
        const tr = document.createElement("tr");
        tr.className = "clickable-row";
        tr.dataset.id = txn.id;

        tr.innerHTML = `
            <td><code>#${txn.id}</code></td>
            <td>
                <a href="investor-details.html?investor_id=${txn.pan_number}" class="investor-link" title="View Profile">
                    <strong>${txn.investor_name}</strong>
                </a>
            </td>
            <td><code>${txn.pan_number}</code></td>
            <td>${txn.mutual_fund_name}</td>
            <td class="text-center">${utils.formatDate(txn.transaction_date)}</td>
            <td class="text-right font-semibold text-primary">${utils.formatCurrency(txn.purchase_amount)}</td>
            <td class="text-right">${utils.formatUnits(txn.nav_units)}</td>
            <td class="text-center action-cell">
                <button class="action-btn btn-view" title="View Details"><i data-lucide="eye"></i></button>
                <button class="action-btn btn-delete" title="Delete Record"><i data-lucide="trash-2"></i></button>
            </td>
        `;

        // Row clicks open details modal except when clicking action buttons or links
        tr.addEventListener("click", (e) => {
            const link = e.target.closest("a");
            const btn = e.target.closest(".action-btn");
            if (!link && !btn) {
                openDetailsModal(txn);
            }
        });

        // Specific button bindings
        tr.querySelector(".btn-view").addEventListener("click", () => openDetailsModal(txn));
        tr.querySelector(".btn-delete").addEventListener("click", () => confirmDeleteTransaction(txn.id));

        tbody.appendChild(tr);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Handle deleting a transaction with prompt validation
 */
async function confirmDeleteTransaction(id) {
    const confirmed = window.confirm(`Are you sure you want to permanently delete transaction #${id}?`);
    if (!confirmed) return;

    try {
        await api.deleteTransaction(id);
        utils.showToast(`Transaction #${id} deleted successfully.`, "success");
        loadTransactionsTable(); // Reload active view
    } catch (err) {
        utils.showToast(err.message || "Failed to delete transaction.", "error");
    }
}

/**
 * Open full transaction details summary in modal overlay.
 */
function openDetailsModal(txn) {
    const modal = document.getElementById("details_modal");
    if (!modal) return;

    const content = document.getElementById("modal_body");
    if (!content) return;

    content.innerHTML = `
        <div class="modal-detail-grid">
            <div class="modal-detail-item">
                <label>Transaction ID</label>
                <span>#${txn.id}</span>
            </div>
            <div class="modal-detail-item">
                <label>Transaction Date</label>
                <span>${utils.formatDate(txn.transaction_date)}</span>
            </div>
            <div class="modal-detail-item">
                <label>Investor Name</label>
                <span>${txn.investor_name}</span>
            </div>
            <div class="modal-detail-item">
                <label>PAN Number</label>
                <span><code>${txn.pan_number}</code></span>
            </div>
            <div class="modal-detail-item col-span-2">
                <label>Mutual Fund Scheme</label>
                <span>${txn.mutual_fund_name}</span>
            </div>
            <div class="modal-detail-item">
                <label>Purchase Amount</label>
                <span class="highlight-val text-emerald">${utils.formatCurrency(txn.purchase_amount)}</span>
            </div>
            <div class="modal-detail-item">
                <label>NAV Units Purchased</label>
                <span class="highlight-val text-primary">${utils.formatUnits(txn.nav_units)}</span>
            </div>
            <div class="modal-detail-item">
                <label>Calculated NAV Price</label>
                <span>₹${(txn.purchase_amount / txn.nav_units).toFixed(4)}</span>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");
}

/**
 * Generate pagination control items.
 */
function renderPaginationControls() {
    const paginationEl = document.getElementById("pagination_controls");
    if (!paginationEl) return;
    paginationEl.innerHTML = "";

    if (state.totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = state.page === 1;
    prevBtn.innerHTML = `&laquo; Prev`;
    prevBtn.addEventListener("click", () => {
        state.page--;
        loadTransactionsTable();
    });
    paginationEl.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= state.totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `pagination-btn ${state.page === i ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
            state.page = i;
            loadTransactionsTable();
        });
        paginationEl.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = state.page === state.totalPages;
    nextBtn.innerHTML = `Next &raquo;`;
    nextBtn.addEventListener("click", () => {
        state.page++;
        loadTransactionsTable();
    });
    paginationEl.appendChild(nextBtn);
}

/**
 * Handle column heading clicks for toggling search orders.
 */
function handleSort(columnName) {
    if (state.sortBy === columnName) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
    } else {
        state.sortBy = columnName;
        state.sortOrder = "desc";
    }
    state.page = 1; // Go to first page on sort change
    loadTransactionsTable();
}

/**
 * Sync active sort direction icons in Table headers.
 */
function updateSortIcons() {
    document.querySelectorAll("[data-sort]").forEach(header => {
        const col = header.dataset.sort;
        const icon = header.querySelector("i");
        if (!icon) return;

        if (state.sortBy === col) {
            icon.className = state.sortOrder === "asc" ? "sort-asc-icon" : "sort-desc-icon";
            icon.innerHTML = state.sortOrder === "asc" ? "&#9650;" : "&#9660;";
        } else {
            icon.className = "sort-inactive-icon";
            icon.innerHTML = "&#8597;";
        }
    });
}

/**
 * Bootstraps and binds all DOM controllers for transactions.html
 */
export function initTransactionsView() {
    // Column header sorting links
    document.querySelectorAll("[data-sort]").forEach(header => {
        header.style.cursor = "pointer";
        header.addEventListener("click", () => handleSort(header.dataset.sort));
    });

    // Search bar binding (with debounce)
    const searchInput = document.getElementById("search_txns");
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                state.search = e.target.value.trim();
                state.page = 1;
                loadTransactionsTable();
            }, 300);
        });
    }

    // Modal Close actions
    const modal = document.getElementById("details_modal");
    const closeBtn = document.querySelector(".modal-close");
    if (modal && closeBtn) {
        closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
        // Click outside modal content to close
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
        });
    }

    // Load initial table list
    loadTransactionsTable();
}
