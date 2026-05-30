/* ================================================================
   WealthFeed — Mutual Fund Dashboard
   ==================================================================
   This file contains ALL the JavaScript logic for our dashboard.
   
   WHAT YOU'LL LEARN HERE:
   ─────────────────────────────────────────────────────────────────
   1. How to store data in JavaScript arrays & objects
   2. How to use .map(), .filter(), .reduce() to process data
   3. How to create SVG charts (Pie, Bar, Line) without any library
   4. How to switch between pages/views using JavaScript
   5. How to search and filter data in real-time
   6. How to format numbers as Indian currency (₹)
   ================================================================ */


/* ──────────────────────────────────────────────────────────────────
   STEP 1: OUR DATA (The Transaction Database)
   ──────────────────────────────────────────────────────────────────
   This is an array of objects. Each object = one transaction.
   Think of it like rows in an Excel sheet.
   
   Fields:
   - investorName : Who invested the money
   - pan          : Their PAN card number (unique ID)
   - fundName     : Which mutual fund they invested in
   - purchaseAmount: How much money (in ₹)
   - navUnits     : How many units they got
   - date         : When the transaction happened
   - trxnType     : Type of transaction (Switch In / Switch Out / Purchase)
   ────────────────────────────────────────────────────────────────── */

const transactions = [
  // Transaction 1: Narayani invested ₹6,499 in DSP Nifty 50 fund
  {
    investorName: "Meethala Pullutummal Narayani",
    pan: "AAEPN3766A",
    fundName: "DSP Nifty 50 Equal Weight Index Fund - Reg - Growth",
    purchaseAmount: 6499.68,
    navUnits: 261.49,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 2: Shilpa invested ₹1,491 in Kotak Gold Fund
  {
    investorName: "Shilpa J Suresh",
    pan: "FRSPS3248J",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 1491.93,
    navUnits: 40.43,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 3: Priyavarshini invested ₹1,999 in Kotak Gold Fund
  {
    investorName: "Priyavarshini Damodaran",
    pan: "HECPD7014E",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 1999.90,
    navUnits: 54.20,
    date: "2025-05-27",
    trxnType: "Purchase"
  },

  // Transaction 4
  {
    investorName: "Nivedhitha Rajagopal",
    pan: "AVNPN8269J",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 999.95,
    navUnits: 27.10,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 5
  {
    investorName: "S Vinoth Kumar",
    pan: "AFYPV6441F",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 999.95,
    navUnits: 27.10,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 6: K Shyma's big investment in Kotak Gold ₹8,499
  {
    investorName: "K Shyma",
    pan: "ABCPS7064H",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 8499.58,
    navUnits: 230.33,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 7
  {
    investorName: "Srijesh",
    pan: "EFBPS7950P",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 979.95,
    navUnits: 26.56,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 8
  {
    investorName: "Manikandan N Nepolian",
    pan: "BHXPM3600B",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 999.95,
    navUnits: 27.10,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 9: Narayani again — invested ₹5,499 in Kotak Gold
  {
    investorName: "Meethala Pullutummal Narayani",
    pan: "AAEPN3766A",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 5499.73,
    navUnits: 149.04,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 10
  {
    investorName: "Avinash Wadhwani",
    pan: "ABAPW8282F",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 1949.90,
    navUnits: 52.84,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 11
  {
    investorName: "R Sethupathy",
    pan: "FPHPS1056H",
    fundName: "Kotak Gold Fund - Growth (Regular Plan)",
    purchaseAmount: 999.95,
    navUnits: 27.10,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 12: Padmapriya — ₹10,000 Switch Out from SBI Ultra Short
  {
    investorName: "M Padmapriya",
    pan: "ANIPP0516B",
    fundName: "SBI Magnum Ultra Short Duration Fund Regular Growth",
    purchaseAmount: 10000.00,
    navUnits: 1.68,
    date: "2025-05-27",
    trxnType: "Switch Out"
  },

  // Transaction 13: Padmapriya — ₹9,999 Switch In to SBI Small Cap
  {
    investorName: "M Padmapriya",
    pan: "ANIPP0516B",
    fundName: "SBI Small Cap Fund Regular Growth",
    purchaseAmount: 9999.50,
    navUnits: 59.62,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 14: Padmapriya — another Switch Out from SBI Ultra Short
  {
    investorName: "M Padmapriya",
    pan: "ANIPP0516B",
    fundName: "SBI Magnum Ultra Short Duration Fund Regular Growth",
    purchaseAmount: 10000.00,
    navUnits: 1.68,
    date: "2025-05-27",
    trxnType: "Switch Out"
  },

  // Transaction 15: Sethupathy → Mahindra Manulife Mid Cap
  {
    investorName: "R Sethupathy",
    pan: "FPHPS1056H",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2299.89,
    navUnits: 70.87,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 16: Avinash → Mahindra Manulife Mid Cap ₹5,199
  {
    investorName: "Avinash Wadhwani",
    pan: "ABAPW8282F",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 5199.74,
    navUnits: 160.24,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 17
  {
    investorName: "Srividhya D",
    pan: "BWHPS1316K",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2299.89,
    navUnits: 70.87,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 18: K Shyma's biggest — ₹16,499 in Mahindra Mid Cap
  {
    investorName: "K Shyma",
    pan: "ABCPS7064H",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 16499.18,
    navUnits: 508.44,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 19: Sheethal's SIP purchase
  {
    investorName: "Sheethal Balaji",
    pan: "DCSPS9502J",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2499.88,
    navUnits: 77.04,
    date: "2025-05-27",
    trxnType: "Purchase"
  },

  // Transaction 20
  {
    investorName: "Nivedhitha Rajagopal",
    pan: "AVNPN8269J",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2591.87,
    navUnits: 79.87,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 21
  {
    investorName: "Anirudh D",
    pan: "CEBPD0457D",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 999.95,
    navUnits: 30.81,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 22
  {
    investorName: "Manushia Jain",
    pan: "BCFPJ2150L",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2299.89,
    navUnits: 70.87,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 23: Srijesh also invested in Mahindra Mid Cap
  {
    investorName: "Srijesh",
    pan: "EFBPS7950P",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 1812.91,
    navUnits: 55.87,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 24
  {
    investorName: "S Vinoth Kumar",
    pan: "AFYPV6441F",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2999.85,
    navUnits: 92.44,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 25: Narayani's third transaction
  {
    investorName: "Meethala Pullutummal Narayani",
    pan: "AAEPN3766A",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 4399.78,
    navUnits: 135.58,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 26
  {
    investorName: "Manikandan N Nepolian",
    pan: "BHXPM3600B",
    fundName: "Mahindra Manulife Mid Cap Fund - Regular - Growth",
    purchaseAmount: 2999.85,
    navUnits: 92.44,
    date: "2025-05-27",
    trxnType: "Switch In"
  },

  // Transaction 27: Padmapriya → ICICI Ultra Short
  {
    investorName: "M Padmapriya",
    pan: "ANIPP0516B",
    fundName: "ICICI Prudential Ultra Short Term Fund - Growth",
    purchaseAmount: 1500.00,
    navUnits: 54.46,
    date: "2025-05-27",
    trxnType: "Switch Out"
  }
];


/* ──────────────────────────────────────────────────────────────────
   STEP 2: APP STATE (Keeping Track of Things)
   ──────────────────────────────────────────────────────────────────
   "state" is like a notebook where we write down:
   - What data are we currently showing?
   - What has the user typed in the search boxes?
   - Which page/view is active right now?
   ────────────────────────────────────────────────────────────────── */

const state = {
  // A copy of all transactions (never changes)
  allTransactions: [...transactions],

  // The currently visible transactions (changes when user filters by date)
  filtered: [...transactions],

  // Which sidebar tab is active
  currentView: "dashboard",

  // What the user has typed in each search box
  search: {
    invPurchase: "",
    fundDist: "",
    fundSummary: "",
    schemeDetail: "",
    investorList: ""
  }
};


/* ──────────────────────────────────────────────────────────────────
   STEP 3: HELPER FUNCTIONS (Small Reusable Tools)
   ──────────────────────────────────────────────────────────────────
   These are tiny functions that do ONE job each.
   We call them again and again throughout the code.
   ────────────────────────────────────────────────────────────────── */

/**
 * Format a number as Indian Rupees (₹)
 * Example: 16499 → "₹16,499"
 *
 * HOW IT WORKS:
 * - Intl.NumberFormat is a built-in JavaScript feature
 * - "en-IN" means Indian English (uses lakhs/crores formatting)
 * - currency: "INR" adds the ₹ symbol
 */
function formatINR(amount) {
  // If amount is null or undefined, treat it as 0
  if (!amount) amount = 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0  // No decimal places (₹16,499 not ₹16,499.18)
  }).format(amount);
}

/**
 * Format a number as Indian Rupees WITH decimal places
 * Example: 16499.18 → "₹16,499.18"
 */
function formatINRFull(amount) {
  if (!amount) amount = 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number with 2 decimal places
 * Example: 261.49 → "261.49"
 */
function formatUnits(units) {
  if (!units) units = 0;

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(units);
}

/**
 * Format a date string into a readable format
 * Example: "2025-05-27" → "27 May 2025"
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";

  var dateObject = new Date(dateString);

  // Check if the date is valid
  if (isNaN(dateObject.getTime())) return dateString;

  return dateObject.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Make text safe to put inside HTML
 * (Prevents XSS attacks — important security practice!)
 *
 * Example: "<script>alert('hack')</script>" → "&lt;script&gt;..."
 */
function escapeHtml(text) {
  if (!text) return "";
  return text.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Shorten a long fund name for display
 * Example: "Kotak Gold Fund - Growth (Regular Plan)" → "Kotak Gold Fund"
 */
function shortFundName(fullName) {
  if (!fullName) return "";

  // Split by " - " and take the first part
  var parts = fullName.split(" - ");
  var shortName = parts[0];

  // If still too long, trim it
  if (shortName.length > 32) {
    return shortName.substring(0, 30) + "…";
  }

  return shortName;
}


/* ──────────────────────────────────────────────────────────────────
   STEP 4: COLOUR PALETTE FOR CHARTS
   ──────────────────────────────────────────────────────────────────
   These are the colours we use in our pie chart, bar chart, etc.
   Each fund or investor gets a different colour.
   ────────────────────────────────────────────────────────────────── */

var CHART_COLORS = [
  "#4a3aff",   // Purple (primary)
  "#e74c3c",   // Red
  "#2ecc71",   // Green
  "#f39c12",   // Orange
  "#3498db",   // Blue
  "#9b59b6",   // Violet
  "#1abc9c",   // Teal
  "#e84393"    // Pink
];


/* ──────────────────────────────────────────────────────────────────
   STEP 5: GREETING MESSAGE
   ──────────────────────────────────────────────────────────────────
   Shows "Good morning" / "Good afternoon" / "Good evening"
   based on the current time.
   ────────────────────────────────────────────────────────────────── */

function setupGreeting() {
  var currentHour = new Date().getHours();
  // getHours() returns 0-23

  var greeting = "Good morning";     // Default: 0 to 11

  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";     // 12 PM to 5 PM
  } else if (currentHour >= 17) {
    greeting = "Good evening";       // 5 PM onwards
  }

  var subtitleElement = document.getElementById("greeting-sub");
  if (subtitleElement) {
    subtitleElement.textContent = greeting;
  }
}


/* ──────────────────────────────────────────────────────────────────
   STEP 6: SIDEBAR NAVIGATION (Switching Between Views)
   ──────────────────────────────────────────────────────────────────
   When user clicks a sidebar item, we:
   1. Remove "active" class from all nav items
   2. Add "active" class to the clicked item
   3. Hide all views
   4. Show the matching view
   ────────────────────────────────────────────────────────────────── */

function setupNavigation() {
  // Get all navigation items
  var navItems = document.querySelectorAll(".nav-item");

  // Add a click listener to each one
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      // Which view does this item link to?
      var viewName = item.getAttribute("data-view");
      if (!viewName) return;

      // Step 1: Remove "active" from ALL nav items
      navItems.forEach(function (nav) {
        nav.classList.remove("active");
      });

      // Step 2: Add "active" to the clicked item
      item.classList.add("active");

      // Step 3: Hide ALL views
      var allViews = document.querySelectorAll(".view");
      allViews.forEach(function (view) {
        view.classList.remove("active");
      });

      // Step 4: Show the matching view
      var targetView = document.getElementById("view-" + viewName);
      if (targetView) {
        targetView.classList.add("active");
      }

      // Save current view in state
      state.currentView = viewName;
    });
  });

  // "See All" link in transactions card → switch to Transactions tab
  var seeAllLink = document.getElementById("see-all-txn");
  if (seeAllLink) {
    seeAllLink.addEventListener("click", function () {
      // Simulate clicking the Transactions nav item
      document.getElementById("nav-transactions").click();
    });
  }
}


/* ──────────────────────────────────────────────────────────────────
   STEP 7: CALCULATE & DISPLAY SUMMARY METRICS
   ──────────────────────────────────────────────────────────────────
   Using .reduce() to add up values from ALL transactions.
   
   WHAT IS .reduce()?
   ─────────────────
   It goes through each item in an array and accumulates a result.
   
   Example: [10, 20, 30].reduce((total, num) => total + num, 0)
   Step 1: total=0,  num=10 → 0+10  = 10
   Step 2: total=10, num=20 → 10+20 = 30
   Step 3: total=30, num=30 → 30+30 = 60
   Result: 60
   ────────────────────────────────────────────────────────────────── */

function renderSummaryMetrics(data) {
  // ── Calculate Total Investment Amount ──
  // Go through each transaction, add up all purchaseAmount values
  var totalInvestment = data.reduce(function (runningTotal, transaction) {
    return runningTotal + (transaction.purchaseAmount || 0);
  }, 0);  // Start from 0

  // ── Calculate Total NAV Units ──
  var totalUnits = data.reduce(function (runningTotal, transaction) {
    return runningTotal + (transaction.navUnits || 0);
  }, 0);

  // ── Count Unique Investors ──
  // new Set() removes duplicates automatically
  // Example: Set(["A", "B", "A"]) → Set(["A", "B"]) → size = 2
  var investorNames = data.map(function (t) { return t.investorName; });
  var uniqueInvestors = new Set(investorNames).size;

  // ── Count Unique Funds ──
  var fundNames = data.map(function (t) { return t.fundName; });
  var uniqueFunds = new Set(fundNames).size;

  // ── Display the values on the page ──
  document.getElementById("metric-investment").textContent = formatINR(totalInvestment);
  document.getElementById("metric-units").textContent = formatUnits(totalUnits);
  document.getElementById("metric-investors").textContent = uniqueInvestors;
  document.getElementById("metric-funds").textContent = uniqueFunds;
  document.getElementById("allocation-total").textContent = formatINR(totalInvestment);

  // Update the note with the biggest fund
  var fundTotals = getFundTotals(data);
  if (fundTotals.length > 0) {
    var biggestFund = fundTotals[0]; // Already sorted biggest first
    var noteText = "Your largest allocation is " + shortFundName(biggestFund.fundName) +
      " at " + formatINR(biggestFund.totalAmount) + ". " +
      uniqueInvestors + " investors across " + uniqueFunds + " funds.";
    document.getElementById("summary-note-text").textContent = noteText;
  }
}


/* ──────────────────────────────────────────────────────────────────
   STEP 8: AGGREGATE DATA BY FUND
   ──────────────────────────────────────────────────────────────────
   Groups all transactions by fund name and calculates totals.
   This data is used by the Pie Chart and Fund tables.
   
   WHAT IS .reduce() WITH AN OBJECT?
   ──────────────────────────────────
   Instead of adding numbers, we build an object:
   
   { "Kotak Gold Fund": { totalAmount: 25420, totalUnits: 689 },
     "Mahindra Mid Cap": { totalAmount: 47901, totalUnits: 1468 } }
   ────────────────────────────────────────────────────────────────── */

function getFundTotals(data) {
  // Step 1: Group transactions by fund name
  var grouped = data.reduce(function (result, transaction) {
    var fundName = transaction.fundName || "Unknown Fund";

    // If we haven't seen this fund before, create a new entry
    if (!result[fundName]) {
      result[fundName] = {
        fundName: fundName,
        totalAmount: 0,
        totalUnits: 0,
        transactionCount: 0
      };
    }

    // Add this transaction's values to the fund's totals
    result[fundName].totalAmount += (transaction.purchaseAmount || 0);
    result[fundName].totalUnits += (transaction.navUnits || 0);
    result[fundName].transactionCount += 1;

    return result;
  }, {});  // Start with an empty object {}

  // Step 2: Convert the object to an array and sort by amount (biggest first)
  var fundList = Object.values(grouped);
  fundList.sort(function (a, b) {
    return b.totalAmount - a.totalAmount;
  });

  return fundList;
}


/* ──────────────────────────────────────────────────────────────────
   STEP 9: AGGREGATE DATA BY INVESTOR
   ──────────────────────────────────────────────────────────────────
   Groups all transactions by investor name and calculates totals.
   This data is used by the Bar Chart and Investor tables.
   ────────────────────────────────────────────────────────────────── */

function getInvestorTotals(data) {
  var grouped = data.reduce(function (result, transaction) {
    var name = transaction.investorName || "Unknown";

    if (!result[name]) {
      result[name] = {
        investorName: name,
        pan: transaction.pan || "N/A",
        totalAmount: 0,
        totalUnits: 0,
        transactionCount: 0
      };
    }

    result[name].totalAmount += (transaction.purchaseAmount || 0);
    result[name].totalUnits += (transaction.navUnits || 0);
    result[name].transactionCount += 1;

    return result;
  }, {});

  // Convert to array and sort by amount (biggest first)
  var investorList = Object.values(grouped);
  investorList.sort(function (a, b) {
    return b.totalAmount - a.totalAmount;
  });

  return investorList;
}


/* ──────────────────────────────────────────────────────────────────
   STEP 10: RECENT TRANSACTIONS LIST
   ──────────────────────────────────────────────────────────────────
   Shows the latest transactions as a scrollable list.
   Each item shows: investor name, fund, amount, and date.
   ────────────────────────────────────────────────────────────────── */

function renderTransactionsList(data) {
  var container = document.getElementById("transactions-list");
  if (!container) return;

  // Show all transactions (scrollable)
  var html = "";

  data.forEach(function (t) {
    // Determine if this is money going OUT or IN
    var isMoneyOut = (t.trxnType || "").toLowerCase().includes("out");
    var isPurchase = (t.trxnType || "").toLowerCase().includes("purchase");

    // Choose icon style based on transaction type
    var iconClass = "switch-in";  // Default: green (money coming in)
    if (isMoneyOut) iconClass = "switch-out";      // Red (money going out)
    if (isPurchase) iconClass = "purchase";          // Blue (new purchase)

    // Arrow icon: up for money in, down for money out
    var arrowIcon;
    if (isMoneyOut) {
      arrowIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';
    } else {
      arrowIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    }

    // Amount colour: green for in, red for out
    var amountClass = isMoneyOut ? "negative" : "positive";
    var sign = isMoneyOut ? "-" : "+";

    html += '<div class="txn-item">';
    html += '  <div class="txn-icon ' + iconClass + '">' + arrowIcon + '</div>';
    html += '  <div class="txn-info">';
    html += '    <div class="txn-name">' + escapeHtml(t.investorName) + '</div>';
    html += '    <div class="txn-fund">' + escapeHtml(shortFundName(t.fundName)) + '</div>';
    html += '  </div>';
    html += '  <div class="txn-amount-block">';
    html += '    <div class="txn-amount ' + amountClass + '">' + sign + formatINRFull(t.purchaseAmount) + '</div>';
    html += '    <div class="txn-date">' + formatDate(t.date) + '</div>';
    html += '  </div>';
    html += '</div>';
  });

  container.innerHTML = html;
}


/* ══════════════════════════════════════════════════════════════════
   STEP 11: PIE / DOUGHNUT CHART  (Fund Allocation)
   ══════════════════════════════════════════════════════════════════
   
   HOW A DOUGHNUT CHART WORKS WITH SVG:
   ─────────────────────────────────────
   We draw circles using the <circle> SVG element.
   Each circle has:
   - stroke-dasharray  : How much of the circle is "filled"
   - stroke-dashoffset : Where the fill starts (rotation)
   
   Think of it like drawing with a marker on a circular track:
   - dasharray = "how far you draw" + "how far you skip"
   - dashoffset = "where you start drawing"
   
   If the circumference is 326 pixels:
   - A fund with 40% allocation draws 0.40 × 326 = 130 pixels
   - Then skips the remaining 196 pixels
   
   ══════════════════════════════════════════════════════════════════ */

function renderDoughnutChart(data) {
  var container = document.getElementById("doughnut-chart-container");
  var legendContainer = document.getElementById("doughnut-legend");
  var percentText = document.getElementById("doughnut-percent");
  if (!container || !legendContainer) return;

  // ── Step 1: Get fund totals from ALL the data ──
  var fundTotals = getFundTotals(data);

  // Calculate grand total of all investments
  var grandTotal = fundTotals.reduce(function (sum, fund) {
    return sum + fund.totalAmount;
  }, 0);

  // Safety check: if no data, don't draw
  if (grandTotal === 0 || fundTotals.length === 0) return;

  // ── Step 2: Calculate the percentage of the biggest fund ──
  var biggestFundPercent = Math.round((fundTotals[0].totalAmount / grandTotal) * 100);
  if (percentText) percentText.textContent = biggestFundPercent + "%";

  // ── Step 3: Set up SVG dimensions ──
  var size = 140;              // Total SVG size (140×140 pixels)
  var centerX = size / 2;      // Center X = 70
  var centerY = size / 2;      // Center Y = 70
  var radius = 52;             // Circle radius
  var strokeWidth = 18;        // Thickness of each segment

  // The total distance around the circle (circumference = 2 × π × r)
  var circumference = 2 * Math.PI * radius;
  // circumference ≈ 326.73 pixels

  // ── Step 4: Remove any old chart ──
  var oldSvg = container.querySelector("svg");
  if (oldSvg) oldSvg.remove();

  // ── Step 5: Create new SVG element ──
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + size + " " + size);
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";

  // ── Step 6: Draw each fund as a circle segment ──
  var currentOffset = 0;  // Where the next segment starts

  fundTotals.forEach(function (fund, index) {
    // What percentage of the total does this fund represent?
    var percentage = fund.totalAmount / grandTotal;

    // How many pixels of the circle should this segment fill?
    var segmentLength = percentage * circumference;

    // How many pixels are left unfilled?
    var gapLength = circumference - segmentLength;

    // Pick a colour from our palette
    var color = CHART_COLORS[index % CHART_COLORS.length];

    // Create the circle element
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", centerX);
    circle.setAttribute("cy", centerY);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "none");                         // Hollow center
    circle.setAttribute("stroke", color);                        // Segment colour
    circle.setAttribute("stroke-width", strokeWidth);            // Thickness
    circle.setAttribute("stroke-dasharray", segmentLength + " " + gapLength);
    circle.setAttribute("stroke-dashoffset", -currentOffset);    // Starting position
    circle.setAttribute("stroke-linecap", "round");              // Rounded ends
    circle.style.transform = "rotate(-90deg)";                   // Start from top
    circle.style.transformOrigin = "50% 50%";                    // Rotate around center
    circle.style.transition = "all 0.8s ease";                   // Smooth animation

    svg.appendChild(circle);

    // Move the starting position for the next segment
    currentOffset += segmentLength;
  });

  // Insert the SVG into the container (before the center text)
  container.insertBefore(svg, container.firstChild);

  // ── Step 7: Build the legend (colour labels) ──
  var legendHtml = "";

  fundTotals.forEach(function (fund, index) {
    var percent = Math.round((fund.totalAmount / grandTotal) * 100);
    var color = CHART_COLORS[index % CHART_COLORS.length];
    var label = shortFundName(fund.fundName);

    legendHtml += '<div class="doughnut-legend-item">';
    legendHtml += '  <span class="doughnut-legend-dot" style="background:' + color + '"></span>';
    legendHtml += '  ' + escapeHtml(label) + ' (' + percent + '%)';
    legendHtml += '</div>';
  });

  legendContainer.innerHTML = legendHtml;
}


/* ══════════════════════════════════════════════════════════════════
   STEP 12: BAR CHART (Investor Analysis)
   ══════════════════════════════════════════════════════════════════
   
   HOW A BAR CHART WORKS WITH SVG:
   ────────────────────────────────
   Each bar is a <rect> (rectangle) element.
   
   - x      : Horizontal position (left edge of the bar)
   - y      : Vertical position (top edge of the bar)
   - width  : How wide the bar is
   - height : How tall the bar is (proportional to the value)
   
   IMPORTANT: In SVG, y=0 is at the TOP, not the bottom!
   So a taller bar needs a SMALLER y value.
   
   Example: If chart height is 200px and bar should be 150px tall:
   - y = 200 - 150 = 50  (bar starts at y=50)
   - height = 150         (bar extends down to y=200)
   
   ══════════════════════════════════════════════════════════════════ */

function renderBarChart(data) {
  var container = document.getElementById("bar-chart-container");
  if (!container) return;

  // Remove old chart
  var oldSvg = container.querySelector("svg");
  if (oldSvg) oldSvg.remove();

  // ── Step 1: Get investor totals from ALL the data ──
  var investorTotals = getInvestorTotals(data);

  if (investorTotals.length === 0) return;

  // ── Step 2: Set up chart dimensions ──
  var W = 440;        // Total SVG width
  var H = 230;        // Total SVG height
  var paddingLeft = 55;
  var paddingRight = 20;
  var paddingTop = 15;
  var paddingBottom = 50;

  var chartWidth = W - paddingLeft - paddingRight;    // Drawing area width
  var chartHeight = H - paddingTop - paddingBottom;   // Drawing area height

  // Find the biggest investment (to scale all bars proportionally)
  var maxValue = 0;
  investorTotals.forEach(function (inv) {
    if (inv.totalAmount > maxValue) maxValue = inv.totalAmount;
  });
  if (maxValue === 0) maxValue = 1;  // Avoid division by zero

  // Calculate bar width and spacing
  var numberOfBars = investorTotals.length;
  var barWidth = Math.min(30, (chartWidth / numberOfBars) * 0.55);
  var gap = (chartWidth - barWidth * numberOfBars) / (numberOfBars + 1);

  // ── Step 3: Create SVG ──
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.style.width = "100%";
  svg.style.height = "100%";

  // ── Step 4: Draw horizontal gridlines ──
  for (var i = 0; i <= 4; i++) {
    var lineY = paddingTop + (chartHeight / 4) * i;

    // Gridline
    var gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gridLine.setAttribute("x1", paddingLeft);
    gridLine.setAttribute("y1", lineY);
    gridLine.setAttribute("x2", W - paddingRight);
    gridLine.setAttribute("y2", lineY);
    gridLine.setAttribute("stroke", "#eef0f6");
    gridLine.setAttribute("stroke-width", "1");
    svg.appendChild(gridLine);

    // Y-axis label (show values like "25K", "10K")
    var yValue = maxValue - (maxValue / 4) * i;
    var yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", paddingLeft - 8);
    yLabel.setAttribute("y", lineY + 4);
    yLabel.setAttribute("text-anchor", "end");
    yLabel.setAttribute("fill", "#94a3b8");
    yLabel.setAttribute("font-size", "9");
    yLabel.setAttribute("font-family", "Inter, sans-serif");
    yLabel.textContent = yValue >= 1000 ? Math.round(yValue / 1000) + "K" : Math.round(yValue);
    svg.appendChild(yLabel);
  }

  // ── Step 5: Draw each bar ──
  investorTotals.forEach(function (investor, index) {
    // Calculate bar height proportional to value
    var barHeight = (investor.totalAmount / maxValue) * chartHeight;

    // Calculate position
    var barX = paddingLeft + gap + index * (barWidth + gap);
    var barY = paddingTop + chartHeight - barHeight;  // Remember: y=0 is top!

    // Pick a colour
    var color = CHART_COLORS[index % CHART_COLORS.length];

    // Draw the bar (rectangle)
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", barX);
    rect.setAttribute("y", barY);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("rx", "4");          // Rounded top corners
    rect.setAttribute("fill", color);
    rect.setAttribute("opacity", "0.85");
    svg.appendChild(rect);

    // Investor name label (below the bar)
    var nameLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    nameLabel.setAttribute("x", barX + barWidth / 2);
    nameLabel.setAttribute("y", H - paddingBottom + 14);
    nameLabel.setAttribute("text-anchor", "middle");
    nameLabel.setAttribute("fill", "#64748b");
    nameLabel.setAttribute("font-size", "7.5");
    nameLabel.setAttribute("font-family", "Inter, sans-serif");
    // Show only first name, truncated
    var firstName = investor.investorName.split(" ")[0];
    if (firstName.length > 8) firstName = firstName.substring(0, 7) + "…";
    nameLabel.textContent = firstName;
    svg.appendChild(nameLabel);

    // Value label on top of the bar
    var valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueLabel.setAttribute("x", barX + barWidth / 2);
    valueLabel.setAttribute("y", barY - 5);
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("fill", "#334155");
    valueLabel.setAttribute("font-size", "8");
    valueLabel.setAttribute("font-weight", "600");
    valueLabel.setAttribute("font-family", "Inter, sans-serif");
    // Show as "25K" format
    var displayValue = investor.totalAmount >= 1000
      ? (investor.totalAmount / 1000).toFixed(1) + "K"
      : Math.round(investor.totalAmount);
    valueLabel.textContent = displayValue;
    svg.appendChild(valueLabel);
  });

  // Add the SVG to the page
  container.insertBefore(svg, container.firstChild);
}


/* ══════════════════════════════════════════════════════════════════
   STEP 13: LINE CHART (Investment Trend)
   ══════════════════════════════════════════════════════════════════
   
   HOW A LINE CHART WORKS WITH SVG:
   ─────────────────────────────────
   We use the <path> element to draw curves.
   
   The "d" attribute describes the path:
   - M x y     = "Move to" (starting point)
   - L x y     = "Draw a Line to" (straight line)
   - C x1 y1 x2 y2 x y = "Draw a Curve to" (smooth Bézier curve)
   
   We also add a filled area below the curve using a gradient,
   which gives it a modern, polished look.
   
   ══════════════════════════════════════════════════════════════════ */

function renderLineChart(data) {
  var container = document.getElementById("line-chart-container");
  if (!container) return;

  // Remove old chart
  var oldSvg = container.querySelector("svg");
  if (oldSvg) oldSvg.remove();

  // ── Step 1: Get investor totals (one point per investor) ──
  var investorTotals = getInvestorTotals(data);

  if (investorTotals.length === 0) return;

  // ── Step 2: Chart dimensions ──
  var W = 420;
  var H = 180;
  var padL = 50;
  var padR = 20;
  var padT = 20;
  var padB = 30;
  var chartW = W - padL - padR;
  var chartH = H - padT - padB;

  // Find the max investment amount (for scaling)
  var maxAmount = 0;
  var maxUnitsVal = 0;
  investorTotals.forEach(function (inv) {
    if (inv.totalAmount > maxAmount) maxAmount = inv.totalAmount;
    if (inv.totalUnits > maxUnitsVal) maxUnitsVal = inv.totalUnits;
  });
  if (maxAmount === 0) maxAmount = 1;
  if (maxUnitsVal === 0) maxUnitsVal = 1;

  // ── Step 3: Calculate point positions ──
  // Each investor gets an equally-spaced X position
  var numberOfPoints = investorTotals.length;
  var xStep = numberOfPoints > 1 ? chartW / (numberOfPoints - 1) : chartW / 2;

  // Investment amount points (main line)
  var amountPoints = [];
  // NAV units points (secondary dashed line)
  var unitPoints = [];

  investorTotals.forEach(function (inv, index) {
    // X position: evenly spaced
    var x = padL + index * xStep;

    // Y position: scaled proportionally (higher value = higher on chart = lower Y!)
    var amountY = padT + chartH - (inv.totalAmount / maxAmount) * chartH;
    var unitY = padT + chartH - (inv.totalUnits / maxUnitsVal) * chartH;

    amountPoints.push({ x: x, y: amountY });
    unitPoints.push({ x: x, y: unitY });
  });

  // ── Step 4: Build smooth curve path ──
  // A "Bézier curve" makes the line smooth instead of jagged
  function buildSmoothPath(points) {
    if (points.length === 0) return "";
    if (points.length === 1) return "M" + points[0].x + "," + points[0].y;

    // Start at the first point
    var pathString = "M" + points[0].x + "," + points[0].y;

    // For each subsequent point, draw a smooth curve
    for (var i = 1; i < points.length; i++) {
      var prev = points[i - 1];
      var curr = points[i];

      // Control points create the "smoothness"
      // cp1 is 40% of the way horizontally from prev
      var cp1x = prev.x + (curr.x - prev.x) * 0.4;
      var cp1y = prev.y;

      // cp2 is 60% of the way horizontally from prev
      var cp2x = prev.x + (curr.x - prev.x) * 0.6;
      var cp2y = curr.y;

      pathString += " C" + cp1x + "," + cp1y + " " + cp2x + "," + cp2y + " " + curr.x + "," + curr.y;
    }

    return pathString;
  }

  // ── Step 5: Create SVG ──
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.style.width = "100%";
  svg.style.height = "100%";

  // Gradient definition for the area fill under the curve
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  var gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradient.setAttribute("id", "areaGradient");
  gradient.setAttribute("x1", "0"); gradient.setAttribute("y1", "0");
  gradient.setAttribute("x2", "0"); gradient.setAttribute("y2", "1");

  var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#4a3aff");
  stop1.setAttribute("stop-opacity", "0.25");

  var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#4a3aff");
  stop2.setAttribute("stop-opacity", "0.02");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // ── Step 6: Draw gridlines ──
  for (var i = 0; i <= 4; i++) {
    var y = padT + (chartH / 4) * i;

    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padL); line.setAttribute("y1", y);
    line.setAttribute("x2", W - padR); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#eef0f6");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);

    // Y-axis labels
    var val = maxAmount - (maxAmount / 4) * i;
    var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", padL - 8);
    txt.setAttribute("y", y + 4);
    txt.setAttribute("text-anchor", "end");
    txt.setAttribute("fill", "#94a3b8");
    txt.setAttribute("font-size", "9");
    txt.setAttribute("font-family", "Inter, sans-serif");
    txt.textContent = val >= 1000 ? Math.round(val / 1000) + "K" : Math.round(val);
    svg.appendChild(txt);
  }

  // ── Step 7: X-axis labels (investor first names) ──
  investorTotals.forEach(function (inv, index) {
    var x = padL + index * xStep;
    var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", H - 5);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "#94a3b8");
    label.setAttribute("font-size", "8");
    label.setAttribute("font-family", "Inter, sans-serif");
    var firstName = inv.investorName.split(" ")[0];
    if (firstName.length > 8) firstName = firstName.substring(0, 7) + "…";
    label.textContent = firstName;
    svg.appendChild(label);
  });

  // ── Step 8: Draw filled area under the investment curve ──
  var amountPathD = buildSmoothPath(amountPoints);
  var lastPoint = amountPoints[amountPoints.length - 1];
  var firstPoint = amountPoints[0];

  var areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // Close the path by going down to the bottom and back to the start
  areaPath.setAttribute("d", amountPathD +
    " L" + lastPoint.x + "," + (padT + chartH) +
    " L" + firstPoint.x + "," + (padT + chartH) + " Z");
  areaPath.setAttribute("fill", "url(#areaGradient)");
  svg.appendChild(areaPath);

  // ── Step 9: Draw the investment amount curve (solid purple line) ──
  var amountLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
  amountLine.setAttribute("d", amountPathD);
  amountLine.setAttribute("fill", "none");
  amountLine.setAttribute("stroke", "#4a3aff");
  amountLine.setAttribute("stroke-width", "2.5");
  amountLine.setAttribute("stroke-linecap", "round");
  svg.appendChild(amountLine);

  // ── Step 10: Draw the NAV units curve (dashed red line) ──
  var unitPathD = buildSmoothPath(unitPoints);
  var unitLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
  unitLine.setAttribute("d", unitPathD);
  unitLine.setAttribute("fill", "none");
  unitLine.setAttribute("stroke", "#e74c3c");
  unitLine.setAttribute("stroke-width", "2");
  unitLine.setAttribute("stroke-dasharray", "6 3");
  unitLine.setAttribute("stroke-linecap", "round");
  svg.appendChild(unitLine);

  // ── Step 11: Draw dots on each data point ──
  amountPoints.forEach(function (pt) {
    var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", pt.x);
    dot.setAttribute("cy", pt.y);
    dot.setAttribute("r", "3.5");
    dot.setAttribute("fill", "#4a3aff");
    dot.setAttribute("stroke", "#fff");
    dot.setAttribute("stroke-width", "2");
    svg.appendChild(dot);
  });

  // Add SVG to the page
  container.insertBefore(svg, container.firstChild);

  // ── Step 12: Add tooltip showing the highest investor ──
  var oldTooltip = container.querySelector(".chart-tooltip");
  if (oldTooltip) oldTooltip.remove();

  // Find the investor with the highest investment
  var maxIndex = 0;
  var maxVal = 0;
  investorTotals.forEach(function (inv, idx) {
    if (inv.totalAmount > maxVal) {
      maxVal = inv.totalAmount;
      maxIndex = idx;
    }
  });

  var tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.innerHTML = '<div class="tooltip-value">' + formatINR(maxVal) + '</div>' +
    '<div class="tooltip-label">' + escapeHtml(investorTotals[maxIndex].investorName.split(" ")[0]) + '</div>';
  tooltip.style.top = (amountPoints[maxIndex].y / H * 100 - 15) + "%";
  tooltip.style.left = (amountPoints[maxIndex].x / W * 100 - 5) + "%";
  container.appendChild(tooltip);
}


/* ══════════════════════════════════════════════════════════════════
   STEP 14: TABLE RENDERERS
   ══════════════════════════════════════════════════════════════════
   Each table has its own render function.
   They all follow the same pattern:
   
   1. Get the search query from state
   2. Filter the data using .filter()
   3. Build HTML rows using .map()
   4. Put the HTML into the <tbody>
   5. Show empty message if no results
   
   ══════════════════════════════════════════════════════════════════ */

/* ── Table 1: Investor Purchases (all individual transactions) ── */
function renderInvestorPurchaseTable(data) {
  var tbody = document.getElementById("tbody-inv-purchase");
  var countBadge = document.getElementById("count-inv-purchase");
  var emptyMessage = document.getElementById("empty-inv-purchase");
  if (!tbody) return;

  // Get search query
  var query = state.search.invPurchase.toLowerCase();

  // Filter: keep only rows where investor name OR fund name matches
  var filtered = data.filter(function (t) {
    var nameMatch = (t.investorName || "").toLowerCase().includes(query);
    var fundMatch = (t.fundName || "").toLowerCase().includes(query);
    return nameMatch || fundMatch;
  });

  // Update badge count
  countBadge.textContent = filtered.length;

  // If no results, show empty message
  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  // Build table rows
  var rows = "";
  filtered.forEach(function (t) {
    rows += "<tr>";
    rows += "  <td><strong>" + escapeHtml(t.investorName) + "</strong></td>";
    rows += "  <td>" + escapeHtml(shortFundName(t.fundName)) + "</td>";
    rows += '  <td class="text-right currency-val">' + formatINRFull(t.purchaseAmount) + "</td>";
    rows += '  <td class="text-right units-val">' + formatUnits(t.navUnits) + "</td>";
    rows += '  <td class="text-center text-muted-cell">' + formatDate(t.date) + "</td>";
    rows += "</tr>";
  });

  tbody.innerHTML = rows;
}


/* ── Table 2: Fund Distribution (transactions sorted by fund) ── */
function renderFundDistributionTable(data) {
  var tbody = document.getElementById("tbody-fund-dist");
  var countBadge = document.getElementById("count-fund-dist");
  var emptyMessage = document.getElementById("empty-fund-dist");
  if (!tbody) return;

  var query = state.search.fundDist.toLowerCase();

  var filtered = data.filter(function (t) {
    return (t.fundName || "").toLowerCase().includes(query) ||
      (t.investorName || "").toLowerCase().includes(query);
  });

  // Sort by fund name (alphabetical)
  filtered.sort(function (a, b) {
    return (a.fundName || "").localeCompare(b.fundName || "");
  });

  countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  var rows = "";
  filtered.forEach(function (t) {
    rows += "<tr>";
    rows += "  <td><strong>" + escapeHtml(shortFundName(t.fundName)) + "</strong></td>";
    rows += "  <td>" + escapeHtml(t.investorName) + "</td>";
    rows += '  <td class="text-right currency-val">' + formatINRFull(t.purchaseAmount) + "</td>";
    rows += '  <td class="text-right units-val">' + formatUnits(t.navUnits) + "</td>";
    rows += '  <td class="text-center text-muted-cell">' + formatDate(t.date) + "</td>";
    rows += "</tr>";
  });

  tbody.innerHTML = rows;
}


/* ── Table 3: Fund Performance Summary (aggregated by fund) ── */
function renderFundSummaryTable(data) {
  var tbody = document.getElementById("tbody-fund-summary");
  var countBadge = document.getElementById("count-fund-summary");
  var emptyMessage = document.getElementById("empty-fund-summary");
  if (!tbody) return;

  // Get aggregated fund data
  var fundList = getFundTotals(data);

  // Filter by search
  var query = state.search.fundSummary.toLowerCase();
  fundList = fundList.filter(function (f) {
    return f.fundName.toLowerCase().includes(query);
  });

  countBadge.textContent = fundList.length;

  if (fundList.length === 0) {
    tbody.innerHTML = "";
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  var rows = "";
  fundList.forEach(function (fund) {
    // Average NAV = Total Investment ÷ Total Units
    // Safety: if units is 0, show 0 (avoid dividing by zero!)
    var averageNAV = fund.totalUnits > 0 ? (fund.totalAmount / fund.totalUnits) : 0;

    rows += "<tr>";
    rows += "  <td><strong>" + escapeHtml(shortFundName(fund.fundName)) + "</strong></td>";
    rows += '  <td class="text-right currency-val">' + formatINRFull(fund.totalAmount) + "</td>";
    rows += '  <td class="text-right units-val">' + formatUnits(fund.totalUnits) + "</td>";
    rows += '  <td class="text-right text-muted-cell">' + averageNAV.toFixed(4) + "</td>";
    rows += "</tr>";
  });

  tbody.innerHTML = rows;
}


/* ── Table 4: Scheme Breakdown (per investor per fund) ── */
function renderSchemeDetailTable(data) {
  var tbody = document.getElementById("tbody-scheme-detail");
  var countBadge = document.getElementById("count-scheme-detail");
  var emptyMessage = document.getElementById("empty-scheme-detail");
  if (!tbody) return;

  // Group by investor + fund combination
  var grouped = {};
  data.forEach(function (t) {
    var key = (t.investorName || "") + " | " + (t.fundName || "");
    if (!grouped[key]) {
      grouped[key] = {
        investor: t.investorName,
        fund: t.fundName,
        totalAmount: 0,
        totalUnits: 0
      };
    }
    grouped[key].totalAmount += (t.purchaseAmount || 0);
    grouped[key].totalUnits += (t.navUnits || 0);
  });

  var list = Object.values(grouped);

  // Filter by search
  var query = state.search.schemeDetail.toLowerCase();
  list = list.filter(function (r) {
    return (r.investor || "").toLowerCase().includes(query) ||
      (r.fund || "").toLowerCase().includes(query);
  });

  // Sort by amount
  list.sort(function (a, b) { return b.totalAmount - a.totalAmount; });

  countBadge.textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = "";
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  var rows = "";
  list.forEach(function (r) {
    var avgNAV = r.totalUnits > 0 ? (r.totalAmount / r.totalUnits) : 0;

    rows += "<tr>";
    rows += "  <td><strong>" + escapeHtml(r.investor) + "</strong></td>";
    rows += "  <td>" + escapeHtml(shortFundName(r.fund)) + "</td>";
    rows += '  <td class="text-right currency-val">' + formatINRFull(r.totalAmount) + "</td>";
    rows += '  <td class="text-right text-muted-cell">' + avgNAV.toFixed(4) + "</td>";
    rows += "</tr>";
  });

  tbody.innerHTML = rows;
}


/* ── Table 5: Investor Ledger (aggregated by investor) ── */
function renderInvestorListTable(data) {
  var tbody = document.getElementById("tbody-investor-list");
  var countBadge = document.getElementById("count-investor-list");
  var emptyMessage = document.getElementById("empty-investor-list");
  if (!tbody) return;

  // Get aggregated investor data
  var investorList = getInvestorTotals(data);

  // Filter by search (name or PAN)
  var query = state.search.investorList.toLowerCase();
  investorList = investorList.filter(function (inv) {
    return inv.investorName.toLowerCase().includes(query) ||
      inv.pan.toLowerCase().includes(query);
  });

  countBadge.textContent = investorList.length;

  if (investorList.length === 0) {
    tbody.innerHTML = "";
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  var rows = "";
  investorList.forEach(function (inv) {
    rows += "<tr>";
    rows += "  <td><strong>" + escapeHtml(inv.investorName) + "</strong></td>";
    rows += '  <td><span class="pan-tag">' + escapeHtml(inv.pan) + "</span></td>";
    rows += '  <td class="text-right currency-val">' + formatINRFull(inv.totalAmount) + "</td>";
    rows += '  <td class="text-right units-val">' + formatUnits(inv.totalUnits) + "</td>";
    rows += '  <td class="text-center">' + inv.transactionCount + "</td>";
    rows += "</tr>";
  });

  tbody.innerHTML = rows;
}


/* ══════════════════════════════════════════════════════════════════
   STEP 15: RENDER EVERYTHING
   ══════════════════════════════════════════════════════════════════
   This one function calls ALL the render functions above.
   We call it whenever data changes (filter, search, etc.)
   ══════════════════════════════════════════════════════════════════ */

function renderEverything() {
  var data = state.filtered;

  // Dashboard view
  renderSummaryMetrics(data);
  renderTransactionsList(data);
  renderDoughnutChart(data);
  renderLineChart(data);
  renderBarChart(data);

  // Table views
  renderInvestorPurchaseTable(data);
  renderFundDistributionTable(data);
  renderFundSummaryTable(data);
  renderSchemeDetailTable(data);
  renderInvestorListTable(data);
}


/* ══════════════════════════════════════════════════════════════════
   STEP 16: DATE FILTER
   ══════════════════════════════════════════════════════════════════
   Lets the user filter transactions by a date range.
   
   HOW IT WORKS:
   1. User picks a "from" and "to" date
   2. We filter the transactions array to keep only those
      where the date is between "from" and "to"
   3. We re-render everything with the filtered data
   ══════════════════════════════════════════════════════════════════ */

function setupDateFilter() {
  var fromInput = document.getElementById("filter-from");
  var toInput = document.getElementById("filter-to");
  var applyButton = document.getElementById("btn-apply");
  var resetButton = document.getElementById("btn-reset");
  var errorMessage = document.getElementById("filter-error");

  // ── Apply Filter Button ──
  if (applyButton) {
    applyButton.addEventListener("click", function () {
      var fromDate = fromInput ? fromInput.value : "";
      var toDate = toInput ? toInput.value : "";

      // Validation: "from" date must not be after "to" date
      if (fromDate && toDate && fromDate > toDate) {
        errorMessage.textContent = "⚠ Start date must be before end date.";
        errorMessage.style.display = "inline";
        return;
      }

      // Hide error
      if (errorMessage) errorMessage.style.display = "none";

      // Filter the transactions
      state.filtered = state.allTransactions.filter(function (t) {
        if (!t.date) return false;

        // Check if transaction date is after "from" date
        var afterFrom = !fromDate || t.date >= fromDate;

        // Check if transaction date is before "to" date
        var beforeTo = !toDate || t.date <= toDate;

        // Keep only if BOTH conditions are true
        return afterFrom && beforeTo;
      });

      // Re-render everything with new filtered data
      renderEverything();
    });
  }

  // ── Reset Filter Button ──
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      // Clear the input fields
      if (fromInput) fromInput.value = "";
      if (toInput) toInput.value = "";
      if (errorMessage) errorMessage.style.display = "none";

      // Restore all transactions
      state.filtered = [...state.allTransactions];

      // Re-render
      renderEverything();
    });
  }
}


/* ══════════════════════════════════════════════════════════════════
   STEP 17: SEARCH HANDLERS
   ══════════════════════════════════════════════════════════════════
   Each search box filters its own table in real-time.
   We use the "input" event which fires on every keystroke.
   ══════════════════════════════════════════════════════════════════ */

function setupSearchHandlers() {
  // List of all search boxes and which table they control
  var searchBindings = [
    { inputId: "search-inv-purchase", stateKey: "invPurchase", renderFunction: renderInvestorPurchaseTable },
    { inputId: "search-fund-dist", stateKey: "fundDist", renderFunction: renderFundDistributionTable },
    { inputId: "search-fund-summary", stateKey: "fundSummary", renderFunction: renderFundSummaryTable },
    { inputId: "search-scheme-detail", stateKey: "schemeDetail", renderFunction: renderSchemeDetailTable },
    { inputId: "search-investor-list", stateKey: "investorList", renderFunction: renderInvestorListTable }
  ];

  // Attach "input" event listener to each search box
  searchBindings.forEach(function (binding) {
    var inputElement = document.getElementById(binding.inputId);

    if (inputElement) {
      inputElement.addEventListener("input", function (event) {
        // Save what the user typed
        state.search[binding.stateKey] = event.target.value;

        // Re-render ONLY the affected table (not everything)
        binding.renderFunction(state.filtered);
      });
    }
  });

  // ── Global Search (top bar) ──
  // Filters ALL data across investor name, fund name, and PAN
  var globalSearchInput = document.getElementById("global-search");

  if (globalSearchInput) {
    globalSearchInput.addEventListener("input", function (event) {
      var query = event.target.value.toLowerCase();

      if (!query) {
        // If search is empty, show all data
        state.filtered = [...state.allTransactions];
      } else {
        // Filter transactions where ANY field matches
        state.filtered = state.allTransactions.filter(function (t) {
          var nameMatch = (t.investorName || "").toLowerCase().includes(query);
          var fundMatch = (t.fundName || "").toLowerCase().includes(query);
          var panMatch = (t.pan || "").toLowerCase().includes(query);
          return nameMatch || fundMatch || panMatch;
        });
      }

      // Re-render everything with filtered data
      renderEverything();
    });
  }
}


/* ══════════════════════════════════════════════════════════════════
   STEP 18: START THE APP!
   ══════════════════════════════════════════════════════════════════
   This runs when the HTML page finishes loading.
   
   DOMContentLoaded fires when:
   - All HTML has been parsed
   - All <link> stylesheets have loaded
   - But images may still be loading
   
   This is the SAFEST time to run our JavaScript.
   ══════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Show the right greeting
  setupGreeting();

  // 2. Enable sidebar navigation
  setupNavigation();

  // 3. Enable date filter
  setupDateFilter();

  // 4. Enable search boxes
  setupSearchHandlers();

  // 5. Wait a tiny bit (600ms) to simulate loading, then render everything
  //    This gives the browser time to paint the skeleton animations first
  setTimeout(function () {
    renderEverything();
  }, 600);
});
