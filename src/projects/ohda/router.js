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
      }
    ]
  }
];
