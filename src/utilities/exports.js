import MainLayout from "../layouts/mainLayout.vue";
import LoginPage from "../projects/security/pages/login/loginPage.vue";
import loginLayout from "../layouts/loginLayout.vue";
import Dialog from "../volt/Dialog.vue";
import DeleteDialog from "../components/DeleteDialog.vue";
import paginator from "../components/paginator.vue";

const generateRoutes = (ChildRoutes) => {
  return [
    {
      path: "/",
      component: MainLayout,
      children:[
        ...ChildRoutes,
      
    ],
    },
    {
      path: "/login",
      component: loginLayout,
      children: [
        {
          path: "/login",
          component: LoginPage,
        },
      ],
    },
  ];
};

const importComponents = (VueApp) => {
  VueApp.component("Paginator", paginator);
  VueApp.component("DeleteDialog", DeleteDialog);
  VueApp.component("Dialog",Dialog);
  return VueApp;
};

export { generateRoutes,importComponents};