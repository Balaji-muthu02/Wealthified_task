// WealthFeed Global Utilities Library

/**
 * Format a number as Indian Rupee (INR) currency.
 * E.g., 100000 -> ₹1,00,000.00
 */
export function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return "₹0.00";
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Format NAV or purchase units with 4-decimal precision.
 * E.g., 261.49 -> 261.4900
 */
export function formatUnits(value) {
    if (value === null || value === undefined || isNaN(value)) return "0.0000";
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    }).format(value);
}

/**
 * Format ISO dates into user-friendly localized format.
 * E.g., "2025-05-27" -> "May 27, 2025"
 */
export function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Display premium dynamic toast notifications in the application.
 * Styles are defined inside /css/forms.css
 */
export function showToast(message, type = "success") {
    // Find or create toast container
    let container = document.getElementById("toast_container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast_container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    // Choose icons based on toast alert type
    let icon = "info";
    if (type === "success") icon = "check-circle";
    if (type === "error") icon = "alert-triangle";
    if (type === "warning") icon = "alert-circle";

    toast.innerHTML = `
        <i data-lucide="${icon}" class="toast-icon"></i>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close-btn">&times;</button>
    `;

    container.appendChild(toast);
    
    // Render Lucide icons in toast
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Close button event handler
    const closeBtn = toast.querySelector(".toast-close-btn");
    closeBtn.addEventListener("click", () => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 300);
    });

    // Auto dismiss after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add("toast-fade-out");
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

/**
 * Extract active browser URL query search parameters as a simple object.
 */
export function getQueryParams() {
    const params = {};
    const parser = new URLSearchParams(window.location.search);
    for (const [key, value] of parser.entries()) {
        params[key] = value;
    }
    return params;
}

/**
 * Render shimmering card skeleton blocks during loading phases.
 */
export function getCardSkeletonHTML() {
    return `
        <div class="skeleton-card">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-value"></div>
            <div class="skeleton skeleton-subtitle"></div>
        </div>
    `;
}

/**
 * Render shimmering tabular row skeleton placeholders.
 */
export function getTableSkeletonHTML(colSpan, rowsCount = 5) {
    let rows = "";
    for (let i = 0; i < rowsCount; i++) {
        rows += `
            <tr class="skeleton-row">
                <td colspan="${colSpan}">
                    <div class="skeleton skeleton-row-bar"></div>
                </td>
            </tr>
        `;
    }
    return rows;
}

/**
 * Render standard empty state illustration placeholder inside tables/sections.
 */
export function getEmptyStateHTML(colSpan, message = "No records found matching filters.") {
    return `
        <tr>
            <td colspan="${colSpan}">
                <div class="empty-state">
                    <i data-lucide="inbox" class="empty-state-icon"></i>
                    <h3>No Data Available</h3>
                    <p class="empty-state-text">${message}</p>
                </div>
            </td>
        </tr>
    `;
}
