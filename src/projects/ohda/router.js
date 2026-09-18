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
    redirect: "/ohda/dashboard",
    children: [
      {
        path: "dashboard",
        name: "OhdaDashboard",
        component: () => import("./pages/DashboardPage.vue")
      },
      {
        path: "products",
        name: "OhdaProducts",
        component: () => import("./pages/ProductsPage.vue")
      },
      {
        path: "warehouse-bins",
        name: "OhdaWarehouseBins",
        component: () => import("./pages/WarehouseBinsPage.vue")
      },
      {
        path: "inventory",
        name: "OhdaInventory",
        component: () => import("./pages/InventoryPage.vue")
      },
      {
        path: "exit-requests",
        name: "OhdaExitRequests",
        component: () => import("./pages/ExitRequestsPage.vue")
      },
      {
        path: "entry-requests",
        name: "OhdaEntryRequests",
        component: () => import("./pages/EntryRequestsPage.vue")
      },
      {
        path: "scan",
        name: "OhdaBarcodeScan",
        component: () => import("./pages/BarcodeScanPage.vue")
      },
      {
        path: "categories",
        name: "OhdaCategories",
        component: () => import("./pages/CategoriesPage.vue")
      },
      {
        path: "suppliers",
        name: "OhdaSuppliers",
        component: () => import("./pages/SuppliersPage.vue")
      },
      {
        path: "users",
        name: "OhdaUserManagement",
        component: () => import("./pages/UserManagementPage.vue")
      },
      {
        path: "departments",
        name: "OhdaDepartments",
        component: () => import("./pages/DepartmentManagementPage.vue")
      },
      {
        path: "product-states",
        name: "OhdaProductStates",
        component: () => import("./pages/ProductStatePage.vue")
      },
      {
        path: "approval-config",
        name: "OhdaApprovalConfig",
        component: () => import("./pages/ApprovalConfigPage.vue")
      },
      {
        path: "approval-requests",
        name: "OhdaApprovalRequests",
        component: () => import("./pages/ApprovalRequestsPage.vue")
      },
      {
        path: "compass",
        name: "OhdaCompass",
        component: () => import("./pages/CompassPage.vue")
      }
    ]
  }
];
