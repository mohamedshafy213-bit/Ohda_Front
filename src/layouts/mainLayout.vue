<template>
    <div class="main-layout">
        <!-- Sidebar on the left -->
        <div class="sidebar-wrapper">
            <!-- <SideBar /> -->
        </div>
        
        <!-- Main content area with TopBar and router-view -->
        <div class="content-area">
            <TopBar />
            <div class="content-scroll">
                <div class="route-view-outlet">
                    <router-view />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import TopBar from "./topBar.vue";
//import SideBar from "./SideBar new.vue";
//import NavBar from "./navBar.vue";
</script>

<style scoped>
.main-layout {
    display: flex;
    flex-direction: row;
    height: 100vh;
    background-color: var(--p-surface-100);
}

.dark .main-layout {
    background-color: var(--p-surface-950);
}

.sidebar-wrapper {
    flex-shrink: 0;
    padding: 1rem;
    padding-inline-end: 0;
}

.content-area {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-width: 0;
}

.content-scroll {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.route-view-outlet {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
}
</style>
