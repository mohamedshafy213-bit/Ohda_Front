import OhdaLayout from "./layouts/OhdaLayout.vue";

export default [
  {
    path: "/ohda/login",
    name: "OhdaLogin",
    component: () => import("./pages/LoginPage.vue")
  },
  {
    path: "/ohda",
    component: OhdaLayout,
    redirect: () => {
      try {
        const u = JSON.parse(localStorage.getItem("ohdaUser") || "null");
        if (u && (u.role === 0 || u.role === "SuperAdmin" || u.role === "0")) {
          return "/ohda/branches";
        }
        const allowed = JSON.parse(localStorage.getItem("ohdaAllowedPages") || "[]");
        if (Array.isArray(allowed) && allowed.length > 0) {
          const hasDashboard = allowed.some(p => {
            const raw = typeof p === "string" ? p : (p?.path || p?.route || p?.Path);
            return raw && raw.toLowerCase().includes("dashboard");
          });
          if (!hasDashboard) {
            const first = allowed[0];
            const raw = typeof first === "string" ? first : (first?.path || first?.route || first?.Path);
            if (raw) {
              let norm = raw.toLowerCase().trim();
              if (!norm.startsWith("/ohda")) norm = `/ohda${norm.startsWith("/") ? "" : "/"}${norm}`;
              if (norm.length > 5 && norm.endsWith("/")) norm = norm.slice(0, -1);
              return norm;
            }
          }
        }
      } catch (e) { }
      return "/ohda/dashboard";
    },
    children: [
      {
        path: "dashboard",
        name: "OhdaDashboard",
        component: () => import("./pages/DashboardPage.vue")
      },
      // Point of Sale (POS) - Products Only
      {
        path: "pos",
        name: "OhdaPos",
        component: () => import("./pages/PosPage.vue")
      },
      // Sales & Jobs
      {
        path: "jobs",
        alias: ["job-cards"],
        name: "OhdaJobCards",
        component: () => import("./pages/JobCardsPage.vue")
      },
      {
        path: "job-cards",
        redirect: "/ohda/jobs"
      },
      {
        path: "clients",
        name: "OhdaClients",
        component: () => import("./pages/ClientsPage.vue")
      },
      {
        path: "estimates",
        name: "OhdaEstimates",
        component: () => import("./pages/EstimatesPage.vue")
      },
      {
        path: "reminders",
        name: "OhdaReminders",
        component: () => import("./pages/RemindersPage.vue")
      },
      // Reservations & Calendar
      {
        path: "bookings-calendar",
        name: "OhdaBookingsCalendar",
        component: () => import("./pages/BookingsCalendarPage.vue")
      },
      {
        path: "todays-board",
        redirect: "/ohda/bookings-calendar"
      },
      {
        path: "bays-settings",
        name: "OhdaBaysSettings",
        component: () => import("./pages/BaysSettingsPage.vue")
      },
      // Reports & Analytics Hub
      {
        path: "reports",
        name: "OhdaReports",
        component: () => import("./pages/ReportsPage.vue")
      },
      // Inventory & Services
      {
        path: "products",
        name: "OhdaProducts",
        component: () => import("./pages/ProductsPage.vue")
      },
      {
        path: "inventory",
        name: "OhdaInventory",
        component: () => import("./pages/InventoryPage.vue")
      },
      {
        path: "warehouse-bins",
        name: "OhdaWarehouseBins",
        component: () => import("./pages/WarehouseBinsPage.vue")
      },
      {
        path: "services",
        name: "OhdaServices",
        component: () => import("./pages/ServicesPage.vue")
      },
      {
        path: "purchases",
        name: "OhdaPurchases",
        component: () => import("./pages/PurchasesPage.vue")
      },
      {
        path: "returns",
        name: "OhdaReturns",
        component: () => import("./pages/ReturnsPage.vue")
      },
      {
        path: "damage",
        name: "OhdaDamage",
        component: () => import("./pages/DamagePage.vue")
      },
      {
        path: "system-health",
        name: "OhdaSystemHealth",
        component: () => import("./pages/SystemHealthPage.vue")
      },
      {
        path: "suppliers",
        name: "OhdaSuppliers",
        component: () => import("./pages/SuppliersPage.vue")
      },
      {
        path: "categories",
        name: "OhdaCategories",
        component: () => import("./pages/CategoriesPage.vue")
      },
      {
        path: "barcode-print",
        name: "OhdaBarcodePrint",
        component: () => import("./pages/BarcodePrintPage.vue")
      },
      {
        path: "scan",
        name: "OhdaBarcodeScan",
        component: () => import("./pages/BarcodeScanPage.vue")
      },
      // Finance & Expenses
      {
        path: "finance",
        name: "OhdaFinance",
        component: () => import("./pages/FinancePage.vue")
      },
      {
        path: "expenses",
        name: "OhdaExpenses",
        component: () => import("./pages/ExpensesPage.vue")
      },
      {
        path: "month-closing",
        name: "OhdaMonthClosing",
        component: () => import("./pages/MonthClosingPage.vue")
      },
      // HR & Users
      {
        path: "employees",
        name: "OhdaEmployees",
        component: () => import("./pages/EmployeesPage.vue")
      },
      {
        path: "users",
        name: "OhdaUserManagement",
        component: () => import("./pages/UserManagementPage.vue")
      },
      {
        path: "lookups",
        name: "OhdaLookups",
        component: () => import("./pages/LookupsPage.vue")
      },
      // Workshop Settings & Branding
      {
        path: "settings",
        name: "OhdaBranchSettings",
        component: () => import("./pages/BranchSettingsPage.vue")
      },
      // Platform / SuperAdmin Branches
      {
        path: "branches",
        name: "OhdaBranches",
        component: () => import("./pages/BranchesPage.vue")
      },
      {
        path: "branches-dashboard",
        name: "OhdaBranchesDashboard",
        component: () => import("./pages/BranchesDashboardPage.vue")
      },
      {
        path: "branches/:id/dashboard",
        name: "OhdaBranchInventoryDashboard",
        component: () => import("./pages/BranchInventoryDashboardPage.vue")
      }
    ]
  }
];
