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
      } catch (e) { }
      return "/ohda/dashboard";
    },
    children: [
      {
        path: "dashboard",
        name: "OhdaDashboard",
        component: () => import("./pages/DashboardPage.vue")
      },
      // Sales & Jobs
      {
        path: "jobs",
        name: "OhdaJobCards",
        component: () => import("./pages/JobCardsPage.vue")
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
      // Inventory & Services
      {
        path: "products",
        name: "OhdaProducts",
        component: () => import("./pages/ProductsPage.vue")
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
