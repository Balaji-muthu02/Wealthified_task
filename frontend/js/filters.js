// Wealthified Global Filtering & Interactions Controller

// Reactive state representing currently active dashboard filters
export const currentFilters = {
    from: "",
    to: "",
    focusedInvestor: null,  // Clicking an investor highlights their details
    focusedFund: null       // Clicking a fund highlights their distribution
};

/**
 * Validates date range bounds and returns error message if invalid.
 */
export function validateDateRange(fromVal, toVal) {
    if (fromVal && toVal) {
        const fromDate = new Date(fromVal);
        const toDate = new Date(toVal);
        
        if (fromDate > toDate) {
            return "Start date cannot be after the end date.";
        }
    }
    return null;
}

/**
 * Initialize global date filters (From, To, Apply, Reset).
 * Binds DOM event listeners and triggers refresh callbacks.
 */
export function initDateFilters(onApplyCallback, onResetCallback) {
    const fromInput = document.getElementById("from_date");
    const toInput = document.getElementById("to_date");
    const applyBtn = document.getElementById("apply_filter");
    const clearBtn = document.getElementById("clear_filter");
    const validationMessage = document.getElementById("filter_validation");

    if (!fromInput || !toInput || !applyBtn || !clearBtn) {
        console.warn("Date filter elements not found on this page.");
        return;
    }

    // Load filter values from localStorage to persist across navigation
    currentFilters.from = localStorage.getItem("wealthfeed_filter_from") || "";
    currentFilters.to = localStorage.getItem("wealthfeed_filter_to") || "";
    
    fromInput.value = currentFilters.from;
    toInput.value = currentFilters.to;

    // Apply Filter click handler
    applyBtn.addEventListener("click", () => {
        const fromVal = fromInput.value;
        const toVal = toInput.value;
        
        // Inline validation
        const error = validateDateRange(fromVal, toVal);
        if (error) {
            if (validationMessage) {
                validationMessage.textContent = error;
                validationMessage.classList.remove("hidden");
            }
            return;
        }

        // Hide validation message if successful
        if (validationMessage) {
            validationMessage.classList.add("hidden");
        }

        // Save filters to global state and storage
        currentFilters.from = fromVal;
        currentFilters.to = toVal;
        localStorage.setItem("wealthfeed_filter_from", fromVal);
        localStorage.setItem("wealthfeed_filter_to", toVal);

        // Execute refresh callback
        if (typeof onApplyCallback === "function") {
            onApplyCallback(currentFilters.from, currentFilters.to);
        }
    });

    // Clear Filter click handler
    clearBtn.addEventListener("click", () => {
        fromInput.value = "";
        toInput.value = "";
        
        if (validationMessage) {
            validationMessage.classList.add("hidden");
        }

        // Reset state and storage
        currentFilters.from = "";
        currentFilters.to = "";
        localStorage.removeItem("wealthfeed_filter_from");
        localStorage.removeItem("wealthfeed_filter_to");

        // Execute reset callback
        if (typeof onResetCallback === "function") {
            onResetCallback();
        }
    });
}

/**
 * Configure card clicks or chart interactions to trigger reactive refreshes
 */
export function setFocusedInvestor(panNumber) {
    currentFilters.focusedInvestor = panNumber;
    console.log(`State updated: focusedInvestor = ${panNumber}`);
}

export function setFocusedFund(fundName) {
    currentFilters.focusedFund = fundName;
    console.log(`State updated: focusedFund = ${fundName}`);
}

export function resetFocus() {
    currentFilters.focusedInvestor = null;
    currentFilters.focusedFund = null;
}
