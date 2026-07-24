/**
 * One-shot generator: writes src/projects/sis/config/page-control-registry.json
 * Run: node scripts/build-sis-page-control-registry.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(
    root,
    "src/projects/sis/config/page-control-registry.json",
);
const samplePath = path.join(
    root,
    "src/projects/sis/config/page-control-registry.sample-academic-years.json",
);

const sample = JSON.parse(fs.readFileSync(samplePath, "utf8"));
const academicYearsPage = sample.pages[0];

function seg(p) {
    const m = String(p).match(/\/(?:sis_api|sec_api)\/([^/?]+)/);
    return m ? m[1] : path.basename(p) || "unknown";
}

function api(http, apiPath, note) {
    const o = {
        http,
        apiPath,
        controllerSegment: seg(apiPath),
    };
    if (note) o.note = note;
    return o;
}

/** GET list for page data */
function g(apiPath, note) {
    const p = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
    return api("GET", p, note);
}

const pages = [
    academicYearsPage,

    {
        pageId: "sis_admin_dashboards",
        nameEn: "SIS / Admin Dashboard (variants)",
        nameAr: null,
        routePath: "/sis/dashboard",
        routeAliases: ["/sis/admin-dashboard"],
        pageRole: "p_sis_dashboard",
        source: "router_only",
        notes: "No menu leaf; same AdminDashboard.vue for dashboard and admin-dashboard routes.",
        primaryStore: "useAdminDashboardStore",
        pageDataApis: [
            g("sis_api/AdminDashboard/KPIs", "KPIs"),
            g("sis_api/AdminDashboard/EnrollmentTrend", "Enrollment trend"),
            g("sis_api/AdminDashboard/GPADistribution", "GPA distribution"),
            g("sis_api/AdminDashboard/Demographics", "Demographics"),
            g(
                "sis_api/AdminDashboard/LevelPerformance?semesterId={semesterId}",
                "Level performance",
            ),
        ],
        controls: [],
    },

    {
        pageId: "institute_dashboard",
        nameEn: "Institute Dashboard",
        routePath: "/sis/institute-dashboard",
        pageRole: "p_sis_institute_dashboard",
        source: "router_only",
        primaryStore: "useInstituteDashboardStore",
        pageDataApis: [
            g(
                "/InstituteDashboard/AttendanceRate",
                "Relative paths in store — fetchApi base applies",
            ),
            g("/InstituteDashboard/IncidentFunnel", ""),
            g("/InstituteDashboard/AtRiskStudents", ""),
            g("/InstituteDashboard/TopCourses?semesterId={id}", ""),
            g("/InstituteDashboard/RecentIncidents", ""),
        ],
        controls: [],
    },

    {
        pageId: "audit_dashboard",
        nameEn: "Audit Dashboard",
        routePath: "/sis/audit-dashboard",
        pageRole: "p_sis_audit_dashboard",
        source: "router_only",
        primaryStore: "useAuditDashboardStore",
        pageDataApis: [
            g("/AuditDashboard/ActivityHeatmap", ""),
            g("/AuditDashboard/IntegrityAlerts", ""),
            g("/AuditDashboard/AuditActivity", ""),
            g("/AuditDashboard/UserActivity", ""),
        ],
        controls: [],
    },

    {
        pageId: "operational_dashboard",
        nameEn: "Operational Dashboard",
        nameAr: "لوحة الأداء التشغيلية",
        routePath: "/sis/operational-dashboard",
        pageRole: "p_operational_dashboard",
        source: "menu",
        primaryStore: "useOperationalDashboardStore",
        pageDataApis: [
            g("/sis_api/OperationalDashboard/GradeDistribution", ""),
            g("/sis_api/OperationalDashboard/PassFailOverview", ""),
            g("/sis_api/OperationalDashboard/AttendanceOverview", ""),
            g("/sis_api/OperationalDashboard/WarningStats", ""),
            g("/sis_api/OperationalDashboard/PersonnelKpis", ""),
            g("/sis_api/OperationalDashboard/EnrollmentByBatch", ""),
            g("/sis_api/OperationalDashboard/DemographicBreakdown", ""),
            g("/sis_api/OperationalDashboard/ScheduleUtilization", ""),
            g("/sis_api/OperationalDashboard/CourseStats", ""),
            g("/sis_api/OperationalDashboard/StructureKpis", ""),
            g("/sis_api/OperationalDashboard/AcademicKpis", ""),
            g("/sis_api/OperationalDashboard/VotingStats", ""),
            g(
                "AcademicLevelIteration/ByUniversityAndYear",
                "First segment without sis_api prefix in store — verify fetchApi base",
            ),
            g("/sis_api/AcademicLevelIteration", ""),
            g(
                "hrcycles_api/hrcycles_api/HrDashboard/DisciplineKpis",
                "Cross-module HR reads for combined dashboard",
            ),
        ],
        controls: [],
    },

    {
        pageId: "teacher_dashboard",
        nameEn: "Teacher Dashboard",
        routePath: "/sis/teacher-dashboard",
        pageRole: "p_sis_teacher_dashboard",
        source: "router_only",
        primaryStore: null,
        pageDataApis: [],
        controls: [],
        notes: "Wire APIs when store is introduced; router-only page role for Keycloak alignment.",
    },

    {
        pageId: "teacher_dashboard2",
        nameEn: "Teacher Dashboard 2",
        routePath: "/sis/teacher-dashboard2",
        pageRole: "p_sis_teacher_dashboard2",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "student_dashboard",
        nameEn: "Student Dashboard",
        routePath: "/sis/student-dashboard",
        pageRole: "p_sis_student_dashboard",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "student_landing_page",
        nameEn: "Student Landing Page",
        routePath: "/sis/student-landing-page",
        pageRole: "p_sis_student_landing",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "professor_landing_page",
        nameEn: "Professor Landing Page",
        routePath: "/sis/professor-landing-page",
        pageRole: "p_sis_professor_landing",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "admin_landing_page",
        nameEn: "Admin Landing Page",
        routePath: "/sis/admin-landing-page",
        pageRole: "p_sis_admin_landing",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "sis_admin_master_dashboard",
        nameEn: "SIS Admin Master Dashboard",
        routePath: "/sis/admin-master-dashboard",
        pageRole: "p_sis_admin_master_dashboard",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "coursework_evaluation",
        nameEn: "Coursework Evaluation",
        routePath: "/sis/coursework-evaluation/{courseSemesterId}",
        pageRole: "p_coursework_evaluation",
        source: "router_only",
        primaryStore: "courseworkEvaluationStore",
        pageDataApis: [
            g(
                "/sis_api/api/CourseworkEvaluation/Rules/{courseSemesterId}",
                "Rules list",
            ),
            g(
                "/sis_api/api/CourseworkEvaluation/CalculationStatus/{courseSemesterId}",
                "Polling status",
            ),
            g(
                "/sis_api/api/CourseworkEvaluation/Preview/{courseSemesterId}",
                "Preview",
            ),
        ],
        controls: [
            {
                key: "c_coursework_evaluation_rules_add",
                description: "Create coursework rule",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api(
                        "POST",
                        "/sis_api/api/CourseworkEvaluation/Rules",
                        "courseworkEvaluationStore",
                    ),
                ],
            },
            {
                key: "c_coursework_evaluation_rules_edit",
                description: "Update rule",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api(
                        "PUT",
                        "/sis_api/api/CourseworkEvaluation/Rules/{ruleId}",
                        "",
                    ),
                ],
            },
            {
                key: "c_coursework_evaluation_rules_delete",
                description: "Delete rule",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/api/CourseworkEvaluation/Rules/{ruleId}",
                        "",
                    ),
                ],
            },
            {
                key: "c_coursework_evaluation_calculate",
                description: "Start coursework calculation job",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api(
                        "POST",
                        "/sis_api/api/CourseworkEvaluation/Calculate/{courseSemesterId}",
                        "",
                    ),
                ],
            },
        ],
    },
    {
        pageId: "lms_virtual_classroom",
        nameEn: "Virtual Classroom",
        routePath: "/lms/virtual-classroom/{meetingId}",
        pageRole: "p_lms_virtual_classroom",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },
    {
        pageId: "academic_levels",
        nameEn: "Academic Level",
        nameAr: "المستوى الأكاديمي",
        routePath: "/sis/academic-levels",
        pageRole: "p_academic_levels",
        source: "menu",
        primaryStore: "academicLevelStore",
        pageDataApis: [
            g(
                "/sis_api/AcademicLevel/FindAcademicLevelsAsTreeMode",
                "POST used for tree load — still data for page render, not a c_* command row",
            ),
        ],
        controls: [
            {
                key: "c_academic_levels_add",
                description: "Add academic level",
                status: "implemented",
                ui: [
                    "academicLevelsPage.vue",
                    "addAcademicLevel.vue — create branch",
                ],
                apis: [
                    api(
                        "POST",
                        "/sis_api/AcademicLevel",
                        "createAcademicLevel",
                    ),
                ],
            },
            {
                key: "c_academic_levels_edit",
                description: "Edit level; configure level dialog",
                status: "implemented",
                ui: [
                    "academicLevelsPage.vue",
                    "addAcademicLevel.vue — edit",
                    "configureLevelDialog.vue",
                ],
                apis: [
                    api("PUT", "/sis_api/AcademicLevel", "updateAcademicLevel"),
                    api(
                        "PUT",
                        "/sis_api/AcademicLevel/UpdatePreviousNextLevel",
                        "updatePreviousNextLevel",
                    ),
                ],
            },
            {
                key: "c_academic_levels_delete",
                description: "Delete level",
                status: "implemented",
                ui: ["academicLevelsPage.vue — DeleteButtonPrompt"],
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/AcademicLevel/{id}?softDelete={flag}",
                        "soft delete query per store",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "academic_levels_configuration",
        nameEn: "Academic Level Configuration",
        nameAr: "توزيع المستوى الأكاديمي",
        routePath: "/sis/academic-levels-configuration",
        pageRole: "p_academic_levels_configuration",
        source: "menu",
        primaryStore: "academicLevelStore",
        pageDataApis: [
            g("/sis_api/AcademicLevelIteration/{id}/Sections", "Sections tab"),
            g(
                "/sis_api/AcademicLevelIteration/{id}/Semesters",
                "Semesters tab",
            ),
            g(
                "/sis_api/Semester/GetCourseAssignmentStatus/{id}",
                "Course assignment status",
            ),
            g(
                "/sis_api/AcademicLevelDistribution/{academicLevelId}/Flag",
                "studentDistributionStore — read flags for section distribution UI",
            ),
        ],
        controls: [
            {
                key: "c_academic_levels_iteration",
                description: "Add/manage iterations; iteration card actions",
                status: "implemented",
                ui: [
                    "AcademicLevelConfigurationPage.vue",
                    "AddIteration.vue",
                    "IterationCard.vue",
                    "AcademicLevelHeader.vue",
                ],
                apis: [
                    api(
                        "POST",
                        "/sis_api/AcademicLevelIteration",
                        "createIteration",
                    ),
                    api(
                        "PUT",
                        "/sis_api/AcademicLevelIteration",
                        "updateIteration",
                    ),
                    api(
                        "DELETE",
                        "/sis_api/AcademicLevelIteration/{id}",
                        "deleteIteration",
                    ),
                ],
            },
            {
                key: "c_academic_levels_iteration_enrollment",
                description: "Start enrollment for iteration",
                status: "implemented",
                ui: ["IterationCard.vue"],
                apis: [
                    api(
                        "POST",
                        "/sis_api/AcademicLevelIteration/StartAcademicLevelIterationEnrollmentForStudents",
                        "",
                    ),
                ],
            },
            {
                key: "c_academic_levels_iteration_semesters",
                description:
                    "Semesters/sections/course-semester and bulk student section operations",
                status: "implemented",
                ui: [
                    "Semesters.vue",
                    "Sections.vue",
                    "courseSemesterSelection.vue",
                    "studentSectionSelection.vue",
                ],
                apis: [
                    api("POST", "/sis_api/Semester", "createSemester"),
                    api("PUT", "/sis_api/Semester", "updateSemester"),
                    api("DELETE", "/sis_api/Semester/{id}", "deleteSemester"),
                    api("POST", "/sis_api/Section", "createSection"),
                    api("PUT", "/sis_api/Section", "updateSection"),
                    api(
                        "DELETE",
                        "/sis_api/Section/{id}?softDelete=true",
                        "deleteSection",
                    ),
                    api(
                        "POST",
                        "/sis_api/Semester/BulkAddCourses",
                        "bulk add courses",
                    ),
                    api(
                        "POST",
                        "/sis_api/StudentEnrollment/GetStudentsByAcademicLevelIterationId",
                        "list students for bulk",
                    ),
                    api(
                        "POST",
                        "/sis_api/StudentEnrollment/BulkUpdateSection",
                        "bulk assign section",
                    ),
                ],
            },
            {
                key: "c_academic_levels_distribution_flag",
                description:
                    "Update academic level distribution flags (studentDistributionStore)",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api("PUT", "/sis_api/AcademicLevelDistribution/Flag", ""),
                ],
            },
        ],
    },

    {
        pageId: "academic_regulations_pass_fail",
        nameEn: "Academic Regulations (Pass/Fail)",
        nameAr: "اللوائح الأكاديمية",
        routePath: "/sis/academic-regulations",
        routeAliases: ["/sis/college-regulation-management/{regulationId}"],
        pageRole: "p_academic_regulations",
        source: "menu",
        notes: "Menu entry /sis/academic-regulations. Dynamic college-regulation-management/:regulationId shares pass/fail regulation stores. Menu still lists /sis/academic-regulations2 (p_academic_regulations2) but that route is commented out in sis/router.js — use academic-regulations + college-regulation-management instead.",
        primaryStore: "passFailRegulationStore",
        pageDataApis: [
            g(
                "/sis_api/api/PassFail/GetRegulationBasedOnUniversityId",
                "Regulations list",
            ),
            g(
                "/sis_api/api/PassFail/{id}/WithRules",
                "Regulation detail with rules",
            ),
            g("/sis_api/api/PassFail/RuleTypes", "Lookups"),
            g("/sis_api/api/PassFail/FailureActions", ""),
            g(
                "/sis_api/api/PassFail/RuleDefinitions/{id}",
                "Rule definition metadata",
            ),
            g("/sis_api/Course", "Course pickers"),
            g("/sis_api/CourseCategory", ""),
            g("/sis_api/LookupCourseDegreeDevision", ""),
            g("/sis_api/GradeScale", ""),
        ],
        controls: [
            {
                key: "c_academic_regulations_add",
                description: "Add regulation / rules (toolbar and dialogs)",
                status: "implemented",
                ui: [
                    "PassFailRegulationsPage.vue",
                    "AddPassFailRegulationDialog.vue",
                    "AddRuleDialog.vue",
                    "RuleCard.vue",
                    "CollegeRegulationManagementPage.vue",
                ],
                apis: [
                    api("POST", "/sis_api/api/PassFail", "create regulation"),
                    api("POST", "/sis_api/api/PassFail/Rules", "create rule"),
                    api(
                        "POST",
                        "/sis_api/api/PassFail/Parameters",
                        "create parameter",
                    ),
                ],
            },
            {
                key: "c_academic_regulations_edit",
                description: "Edit regulation, rules, parameters; simulation",
                status: "implemented",
                ui: [
                    "PassFailToolbar.vue",
                    "RuleCard.vue",
                    "AddPassFailRegulationDialog.vue",
                    "CollegeRegulationManagementPage.vue",
                ],
                apis: [
                    api("PUT", "/sis_api/api/PassFail", "update regulation"),
                    api("PUT", "/sis_api/api/PassFail/Rules", "update rule"),
                    api(
                        "PUT",
                        "/sis_api/api/PassFail/Parameters",
                        "update param",
                    ),
                    api(
                        "POST",
                        "/sis_api/api/PassFail/Simulate",
                        "simulate (POST command)",
                    ),
                ],
            },
            {
                key: "c_academic_regulations_delete",
                description: "Delete regulation, rule parameters",
                status: "implemented",
                ui: ["RuleCard.vue", "CollegeRegulationManagementPage.vue"],
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/api/PassFail/{id}",
                        "delete regulation",
                    ),
                    api(
                        "DELETE",
                        "/sis_api/api/PassFail/Parameters/{id}",
                        "delete parameter",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "menu_only_academic_regulations2",
        nameEn: "College/Institute Settings (menu only — route commented)",
        routePath: "/sis/academic-regulations2",
        pageRole: "p_academic_regulations2",
        source: "menu",
        notes: "baseStore menu links here but sis/router.js route is commented out; registry documents intended p_* for Keycloak alignment.",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "grade_scales",
        nameEn: "Grade Scales",
        nameAr: "مقاييس الدرجات",
        routePath: "/sis/grade-scales",
        pageRole: "p_grade_scales",
        source: "menu",
        primaryStore: "gradeScaleStore",
        pageDataApis: [
            g("/sis_api/GradeScale", "List"),
            g("/sis_api/GradeScale/{id}", "Detail"),
            g("/sis_api/GradeScaleItem/ByGradeScale/{id}", "Items"),
            g("/sis_api/AcademicYear", "Year lookup"),
        ],
        controls: [
            {
                key: "c_grade_scales_add",
                description: "Create grade scale / items",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api("POST", "/sis_api/GradeScale", ""),
                    api("POST", "/sis_api/GradeScaleItem", ""),
                ],
            },
            {
                key: "c_grade_scales_edit",
                description: "Update grade scale / items",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api("PUT", "/sis_api/GradeScale", ""),
                    api("PUT", "/sis_api/GradeScaleItem", ""),
                ],
            },
            {
                key: "c_grade_scales_delete",
                description: "Delete scale / item",
                status: "missing_in_ui",
                ui: [],
                apis: [
                    api("DELETE", "/sis_api/GradeScale/{id}", ""),
                    api("DELETE", "/sis_api/GradeScaleItem/{id}", ""),
                ],
            },
        ],
    },

    {
        pageId: "rooms",
        nameEn: "Rooms",
        nameAr: "القاعات",
        routePath: "/sis/rooms",
        pageRole: "p_rooms",
        source: "menu",
        primaryStore: "roomStore",
        pageDataApis: [g("/sis_api/Hall", "List"), g("/sis_api/Hall/{id}", "")],
        controls: [
            {
                key: "c_rooms_add",
                status: "missing_in_ui",
                description: "Create hall",
                ui: [],
                apis: [api("POST", "/sis_api/Hall", "")],
            },
            {
                key: "c_rooms_edit",
                status: "missing_in_ui",
                description: "Update hall",
                ui: [],
                apis: [api("PUT", "/sis_api/Hall", "")],
            },
            {
                key: "c_rooms_delete",
                status: "missing_in_ui",
                description: "Delete hall",
                ui: [],
                apis: [api("DELETE", "/sis_api/Hall/{id}", "")],
            },
        ],
    },

    {
        pageId: "enrollment_types",
        nameEn: "Enrollment Types",
        routePath: "/sis/enrollment-types",
        pageRole: "p_enrollment_types",
        source: "router_only",
        primaryStore: "enrollmentTypeStore",
        pageDataApis: [g("/sis_api/LookupEnrollmentCode", "List")],
        controls: [
            {
                key: "c_enrollment_types_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/LookupEnrollmentCode", "")],
            },
            {
                key: "c_enrollment_types_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/LookupEnrollmentCode", "")],
            },
            {
                key: "c_enrollment_types_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/LookupEnrollmentCode/{id}", "")],
            },
        ],
    },

    {
        pageId: "sections",
        nameEn: "Sections",
        routePath: "/sis/sections",
        pageRole: "p_sections",
        source: "router_only",
        primaryStore: "sectionStore",
        pageDataApis: [
            g(
                "sis_api/Section",
                "List — store uses path without leading slash in some calls",
            ),
            g("/sis_api/University", ""),
            g("/sis_api/AcademicYear", ""),
            g("/sis_api/AcademicLevel", ""),
            g("/Section/{id}", "Detail — verify base URL in store"),
        ],
        controls: [
            {
                key: "c_sections_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Section", "")],
            },
            {
                key: "c_sections_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Section", "")],
            },
            {
                key: "c_sections_delete",
                status: "missing_in_ui",
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/Section/{id}?softDelete={flag}",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "periods",
        nameEn: "Periods",
        nameAr: "المحاضرات و الطوابير",
        routePath: "/sis/periods",
        pageRole: "p_periods",
        source: "menu",
        primaryStore: "periodStore",
        pageDataApis: [g("/sis_api/Period", "List")],
        controls: [
            {
                key: "c_periods_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Period", "")],
            },
            {
                key: "c_periods_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Period", "")],
            },
            {
                key: "c_periods_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Period/{id}", "")],
            },
        ],
    },

    {
        pageId: "course_categories",
        nameEn: "Course Categories",
        nameAr: "فئات المقررات",
        routePath: "/sis/course-categories",
        pageRole: "p_course_categories",
        source: "menu",
        primaryStore: "courseCategoryStore",
        pageDataApis: [g("/sis_api/CourseCategory", "")],
        controls: [
            {
                key: "c_course_categories_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/CourseCategory", "")],
            },
            {
                key: "c_course_categories_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/CourseCategory", "")],
            },
            {
                key: "c_course_categories_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/CourseCategory/{id}", "")],
            },
        ],
    },

    {
        pageId: "course_types",
        nameEn: "Course Types",
        nameAr: "أنواع المقررات",
        routePath: "/sis/course-types",
        pageRole: "p_course_types",
        source: "menu",
        primaryStore: "courseTypeStore",
        pageDataApis: [g("/sis_api/CourseType", "")],
        controls: [
            {
                key: "c_course_types_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/CourseType", "")],
            },
            {
                key: "c_course_types_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/CourseType", "")],
            },
            {
                key: "c_course_types_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/CourseType/{id}", "")],
            },
        ],
    },

    {
        pageId: "warning_rules",
        nameEn: "Warning Rules",
        nameAr: "قواعد الإنذارات",
        routePath: "/sis/warning-rules",
        pageRole: "p_warning_rules",
        source: "menu",
        primaryStore: "warningsStore",
        pageDataApis: [
            g("/sis_api/Course/AttendanceAndDiscipline", "Courses for filter"),
            g("/sis_api/AcademicYear", ""),
            g("/sis_api/Semester", ""),
            g("/sis_api/StudentWarning/Students{query}", "Student lookup"),
            g(
                "/sis_api/WarningRule/ByFilter",
                "POST body filter — used as read for grid",
            ),
        ],
        controls: [
            {
                key: "c_warning_rules_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/WarningRule", "")],
            },
            {
                key: "c_warning_rules_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/WarningRule", "")],
            },
            {
                key: "c_warning_rules_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/WarningRule/{id}", "")],
            },
        ],
    },

    {
        pageId: "student_warnings",
        nameEn: "Issued Warnings",
        nameAr: "الإنذارات الصادرة",
        routePath: "/sis/student-warnings",
        pageRole: "p_student_warnings",
        source: "menu",
        primaryStore: "warningsStore",
        pageDataApis: [
            g("/sis_api/StudentWarning/ByFilter", "POST filter for grid"),
        ],
        controls: [
            {
                key: "c_student_warnings_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/StudentWarning", "")],
            },
            {
                key: "c_student_warnings_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/StudentWarning", "")],
            },
            {
                key: "c_student_warnings_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/StudentWarning/{id}", "")],
            },
            {
                key: "c_student_warnings_issue_from_points",
                status: "missing_in_ui",
                description: "Issue warning from points",
                apis: [
                    api("POST", "/sis_api/StudentWarning/IssueFromPoints", ""),
                ],
            },
            {
                key: "c_student_warnings_status",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/StudentWarning/{id}/Status", "")],
            },
            {
                key: "c_student_warnings_acknowledge",
                status: "missing_in_ui",
                apis: [
                    api("PUT", "/sis_api/StudentWarning/{id}/Acknowledge", ""),
                ],
            },
        ],
    },

    {
        pageId: "degree_divisions",
        nameEn: "Academic Activities",
        nameAr: "الانشطة الدراسية",
        routePath: "/sis/degree-divisions",
        pageRole: "p_degree_divisions",
        source: "menu",
        primaryStore: "degreeDivisionStore",
        pageDataApis: [g("/sis_api/LookupCourseDegreeDevision", "")],
        controls: [
            {
                key: "c_degree_divisions_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/LookupCourseDegreeDevision", "")],
            },
            {
                key: "c_degree_divisions_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/LookupCourseDegreeDevision", "")],
            },
            {
                key: "c_degree_divisions_delete",
                status: "missing_in_ui",
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/LookupCourseDegreeDevision/{id}",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "courses_list",
        nameEn: "Courses",
        nameAr: "المقررات / المواد",
        routePath: "/sis/courses",
        routeAliases: ["/sis/current-courses"],
        alternatePageRoles: ["p_current_courses"],
        pageRole: "p_courses",
        notes: "Also accessible as Current Courses; same component coursesPage.vue. Either p_courses or p_current_courses grants access depending on menu assignment.",
        source: "menu",
        primaryStore: "courseStore",
        pageDataApis: [
            g("/sis_api/Course/ByFilter", "POST filter list"),
            g("/sis_api/Course/{id}/details", ""),
        ],
        controls: [
            {
                key: "c_courses_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Course", "")],
            },
            {
                key: "c_courses_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Course", "")],
            },
            {
                key: "c_courses_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Course/{id}", "")],
            },
            {
                key: "c_course_instructors_mutations",
                description: "Instructor attach/detach",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/CourseInstructor", ""),
                    api("DELETE", "/sis_api/CourseInstructor/{id}", ""),
                ],
            },
            {
                key: "c_academic_level_course_mutations",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/AcademicLevelCourse", ""),
                    api("DELETE", "/sis_api/AcademicLevelCourse/{id}", ""),
                ],
            },
            {
                key: "c_course_degree_division_mutations",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/CourseDegreeDevisionCourse", ""),
                    api(
                        "DELETE",
                        "/sis_api/CourseDegreeDevisionCourse/{id}",
                        "",
                    ),
                ],
            },
            {
                key: "c_student_course_enrollment_mutations",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/StudentCourseEnrollment", ""),
                    api("DELETE", "/sis_api/StudentCourseEnrollment/{id}", ""),
                ],
            },
        ],
    },

    {
        pageId: "current_course_details",
        nameEn: "Current Course Details",
        routePath: "/sis/current-courses/{courseId}",
        pageRole: "p_current_courses",
        source: "menu",
        primaryStore: "courseStore",
        pageDataApis: [
            g("/sis_api/Course/{id}/details", ""),
            g("/sis_api/Course/GetCourseSemesterSections/{id}", ""),
        ],
        controls: [],
        notes: "Inherits p_current_courses (longest prefix). courseDetails.vue",
    },

    {
        pageId: "course_details_general",
        nameEn: "Course Details (general)",
        routePath: "/sis/courses/{courseId}",
        pageRole: "p_courses",
        source: "menu",
        primaryStore: "courseStore",
        pageDataApis: [g("/sis_api/Course/{id}/details", "")],
        controls: [],
        notes: "generalDetails.vue",
    },

    {
        pageId: "course_attendance",
        nameEn: "Course Attendance",
        routePath: "/sis/course-attendance/{courseId}",
        pageRole: "p_course_attendance",
        source: "router_only",
        primaryStore: "courseAttendanceStore",
        pageDataApis: [
            g(
                "/sis_api/AttendancePeriod/GetCourseDataByCourseSectionMeetingId/{id}",
                "",
            ),
            g("/sis_api/AttendancePeriod/GetAllAttendanceCodes", ""),
            g("/sis_api/AttendancePeriod/GetAttendanceByMeetingId/{id}", ""),
        ],
        controls: [],
        notes: "Writes may live in components — extend when mutations are catalogued.",
    },

    {
        pageId: "academic_level_results",
        nameEn: "Academic Level Results",
        nameAr: "نتائج المستوى الأكاديمي",
        routePath: "/sis/academic-level-results",
        pageRole: "p_academic_level_results",
        source: "menu",
        primaryStore: "academicLevelResultsStore",
        pageDataApis: [
            api(
                "POST",
                "/sis_api/FinalGrade/ByFilter",
                "POST filter — grid/report body",
            ),
        ],
        controls: [
            {
                key: "c_academic_level_results_run",
                description:
                    "Filters toolbar: Search runs POST FinalGrade/ByFilter with selected criteria.",
                status: "implemented",
                ui: ["AcademicLevelResultsPage.vue — Search button"],
                apis: [api("POST", "/sis_api/FinalGrade/ByFilter", "")],
            },
        ],
    },

    {
        pageId: "student_grades_by_division",
        nameEn: "Student Grades By Division",
        nameAr: "درجات الطلاب في المواد",
        routePath: "/sis/student-grades-by-division",
        pageRole: "p_student_grades_by_division",
        source: "menu",
        primaryStore: "studentGradesByDivisionStore",
        pageDataApis: [
            api(
                "POST",
                "/sis_api/StudentGradesByDivision/ByFilter",
                "POST filter — division grades grid",
            ),
            api(
                "POST",
                "/sis_api/AcademicLevelIteration/ByAcademicLevel",
                "Iteration dropdown after university + level",
            ),
            g(
                "/sis_api/Semester/GetCourseAssignmentStatus/{id}",
                "Course dropdown after iteration",
            ),
        ],
        controls: [
            {
                key: "c_student_grades_by_division_run",
                description:
                    "Filters toolbar: Search runs POST StudentGradesByDivision/ByFilter with selected criteria.",
                status: "implemented",
                ui: ["StudentGradesByDivisionPage.vue — Search button"],
                apis: [
                    api(
                        "POST",
                        "/sis_api/StudentGradesByDivision/ByFilter",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "course_grade_analysis",
        nameEn: "Course Grade Analysis",
        nameAr: "النتيجة النهائية (تحليل المواد)",
        routePath: "/sis/course-grade-analysis",
        pageRole: "p_course_grade_analysis",
        source: "menu",
        primaryStore: "courseGradeAnalysisStore",
        notes: "All store calls (analysis POST, iteration/courses filter helpers) use page access only (p_course_grade_analysis); no c_* controls.",
        pageDataApis: [
            api(
                "POST",
                "/sis_api/FinalGrade/CourseGradeAnalysis",
                "Search/analysis — covered by p_course_grade_analysis",
            ),
            api(
                "POST",
                "/sis_api/AcademicLevelIteration/ByAcademicLevel",
                "Iteration dropdown — covered by p_course_grade_analysis",
            ),
            g(
                "/sis_api/Semester/GetCourseAssignmentStatus/{id}",
                "Courses multi-select — covered by p_course_grade_analysis",
            ),
        ],
        controls: [],
    },

    {
        pageId: "exam_results_analysis",
        nameEn: "Exam Results Analysis",
        routePath: "/sis/exam-results-analysis",
        pageRole: "p_exam_results_analysis",
        source: "router_only",
        primaryStore: "examResultsAnalysisStore",
        pageDataApis: [g("/sis_api/FinalGrade/ExamResultsAnalysis", "POST")],
        controls: [],
        notes: "Menu entry for exam-results-analysis is commented in baseStore.",
    },

    {
        pageId: "attendance_discipline_grades",
        nameEn: "Attendance Discipline Grades",
        nameAr: "درجات السلوك و الموظبة",
        routePath: "/sis/attendance-discipline-grades",
        pageRole: "p_attendance_discipline_grades",
        source: "menu",
        primaryStore: "attendanceDisciplineGradesStore",
        pageDataApis: [
            g("/sis_api/AttendanceDisciplineGrade/ByFilter", "POST"),
            g("/sis_api/AttendanceDisciplineGrade/Details/{id}", ""),
            g("/sis_api/Course/AttendanceAndDiscipline", ""),
        ],
        controls: [],
    },

    {
        pageId: "sis_calendar",
        nameEn: "Calendar",
        routePath: "/sis/calendar",
        pageRole: "p_sis_calendar",
        source: "router_only",
        pageDataApis: [],
        controls: [],
    },

    {
        pageId: "lecture_schedule",
        nameEn: "Lecture Schedule",
        nameAr: " المحاضرات اليومية",
        routePath: "/sis/lecture-schedule",
        pageRole: "p_lecture_schedule",
        source: "menu",
        primaryStore: "gradebookStore",
        pageDataApis: [
            g(
                "/sis_api/api/Gradebook/Teacher/{courseSemesterId}",
                "Teacher gradebook",
            ),
            g(
                "/sis_api/api/Gradebook/Student/{courseSemesterId}",
                "Student gradebook",
            ),
        ],
        controls: [],
    },

    {
        pageId: "group_schedule",
        nameEn: "Schedual / Group Schedule",
        nameAr: "الجدول الدراسي",
        routePath: "/sis/group-schedule",
        pageRole: "p_group_schedule",
        source: "menu",
        primaryStore: "groupScheduleStore",
        pageDataApis: [
            g("/sis_api/University", ""),
            g("/sis_api/AcademicYear", ""),
            g("/sis_api/AcademicLevel", ""),
            g("/sis_api/Semester", ""),
            g("/sis_api/AcademicLevelIteration/{id}/Sections", ""),
            g("/sis_api/Period", ""),
        ],
        controls: [
            {
                key: "c_group_schedule_meeting_create",
                status: "missing_in_ui",
                apis: [
                    api(
                        "POST",
                        "/sis_api/CourseSectionMeeting/CreateWithCourseId",
                        "",
                    ),
                ],
            },
            {
                key: "c_group_schedule_meeting_update",
                status: "missing_in_ui",
                apis: [
                    api(
                        "PUT",
                        "/sis_api/CourseSectionMeeting/UpdateWithCourseId",
                        "",
                    ),
                ],
            },
            {
                key: "c_group_schedule_meeting_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/CourseSectionMeeting/{id}", "")],
            },
        ],
    },

    {
        pageId: "fitness_age_stages",
        nameEn: "Fitness Age Stages",
        nameAr: "المراحل السنية لاختبارات اللياقة",
        routePath: "/sis/fitness-age-stages",
        pageRole: "p_fitness_age_stages",
        source: "menu",
        primaryStore: "fitnessStore",
        pageDataApis: [g("/sis_api/api/fitness/age-stages", "")],
        controls: [
            {
                key: "c_fitness_age_stages_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/api/fitness/age-stages", "")],
            },
            {
                key: "c_fitness_age_stages_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/api/fitness/age-stages", "")],
            },
            {
                key: "c_fitness_age_stages_delete",
                status: "missing_in_ui",
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/api/fitness/age-stages/{id}?softDelete={flag}",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "fitness_exercises",
        nameEn: "Fitness Exercises",
        nameAr: "تمارين اللياقة",
        routePath: "/sis/fitness-exercises",
        pageRole: "p_fitness_exercises",
        source: "menu",
        primaryStore: "fitnessStore",
        pageDataApis: [g("/sis_api/api/fitness/exercises", "")],
        controls: [
            {
                key: "c_fitness_exercises_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/api/fitness/exercises", "")],
            },
            {
                key: "c_fitness_exercises_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/api/fitness/exercises", "")],
            },
            {
                key: "c_fitness_exercises_delete",
                status: "missing_in_ui",
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/api/fitness/exercises/{id}?softDelete={flag}",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "fitness_exercise_evaluations",
        nameEn: "Fitness Exercise Evaluations",
        nameAr: "تقييم تمارين اللياقة",
        routePath: "/sis/fitness-exercise-evaluations",
        pageRole: "p_fitness_exercise_evaluations",
        source: "menu",
        primaryStore: "fitnessStore",
        pageDataApis: [g("/sis_api/api/fitness/exercise-evaluations", "")],
        controls: [
            {
                key: "c_fitness_exercise_evaluations_add",
                status: "missing_in_ui",
                apis: [
                    api(
                        "POST",
                        "/sis_api/api/fitness/exercise-evaluations",
                        "",
                    ),
                ],
            },
            {
                key: "c_fitness_exercise_evaluations_edit",
                status: "missing_in_ui",
                apis: [
                    api("PUT", "/sis_api/api/fitness/exercise-evaluations", ""),
                ],
            },
            {
                key: "c_fitness_exercise_evaluations_delete",
                status: "missing_in_ui",
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/api/fitness/exercise-evaluations/{id}?softDelete={flag}",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "student_bulk_upload",
        nameEn: "Student Bulk Upload",
        nameAr: "إستيراد بيانات الطلاب",
        routePath: "/sis/students/bulk-upload",
        pageRole: "p_students_bulk_upload",
        source: "menu",
        pageDataApis: [
            g(
                "/sis_api/api/bulkupload/person/template",
                "Blob template download",
            ),
            g("/sis_api/api/bulkupload/person/metadata", ""),
        ],
        controls: [
            {
                key: "c_students_bulk_upload_upload",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/api/bulkupload/person/upload", ""),
                ],
            },
            {
                key: "c_students_bulk_upload_validate",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/api/bulkupload/person/validate", ""),
                ],
            },
            {
                key: "c_students_bulk_upload_confirm",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/api/bulkupload/person/confirm", ""),
                ],
            },
        ],
        notes: "PersonBulkUploadPage.vue inline API calls.",
    },

    {
        pageId: "pass_fail_results",
        nameEn: "Pass/Fail Results",
        nameAr: "حساب النتيجة النهائية",
        routePath: "/sis/pass-fail-results",
        pageRole: "p_pass_fail_results",
        source: "menu",
        primaryStore: "passFailResultsStore",
        pageDataApis: [
            g("/sis_api/StudentEnrollment/GetStudentPassFailStatus", "POST"),
            g("/sis_api/StudentEnrollment/GetStudentSemesterDetail", "POST"),
        ],
        controls: [
            {
                key: "c_pass_fail_results_run_engine",
                status: "missing_in_ui",
                apis: [
                    api(
                        "POST",
                        "/sis_api/api/PassFail/StartPassFailureEngine",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "grade_change_log",
        nameEn: "Grade Change Log",
        nameAr: "سجل تعديلات الدرجات",
        routePath: "/sis/grade-change-log",
        pageRole: "p_grade_change_log",
        source: "menu",
        notes: "Read-only audit. All pageDataApis below are scoped to authorization via p_grade_change_log only — no companion c_* realm roles and no controls[] entries.",
        primaryStore: "gradeChangeLogStore",
        pageDataApis: [
            api(
                "POST",
                "/sis_api/FinalGrade/StudentGradeChangeLog",
                "Filter/query body → timeline; authorize with p_grade_change_log only (no c_*).",
            ),
            g(
                "/sis_api/StudentEnrollment/GetStudentsByAcademicLevelId/{id}",
                "Authorize with p_grade_change_log only (no c_*).",
            ),
            g(
                "/sis_api/Course",
                "Authorize with p_grade_change_log only (no c_*).",
            ),
            g(
                "/sis_api/LookupCourseDegreeDevision",
                "Authorize with p_grade_change_log only (no c_*).",
            ),
        ],
        controls: [],
    },

    {
        pageId: "voting_hub",
        nameEn: "Voting module (dashboard, create, edit, analytics)",
        routePath: "/sis/voting",
        routeAliases: [
            "/sis/voting/create",
            "/sis/voting/edit/{id}",
            "/sis/voting/{id}",
        ],
        pageRole: "p_voting",
        notes: "More specific menu keys override: /sis/voting/create → p_voting_create; other subpaths inherit longest prefix (voting/edit, voting/:id → p_voting unless matched by p_voting_student etc.).",
        source: "menu",
        primaryStore: "useVotingStore",
        pageDataApis: [
            g("/sis_api/Poll", "List"),
            g("/sis_api/Poll/GetPollWithQuestions/{id}", ""),
            g("/sis_api/Poll/GetPollAnalytics/{id}", ""),
            g("/sis_api/Poll/GetPollsSummary", ""),
            g("/sis_api/VotingClassification", ""),
            g("/sis_api/Person", ""),
        ],
        controls: [
            {
                key: "c_voting_poll_create",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Poll", "")],
            },
            {
                key: "c_voting_poll_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Poll", "")],
            },
            {
                key: "c_voting_poll_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Poll/{id}", "")],
            },
            {
                key: "c_voting_poll_publish",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Poll/PublishPoll/{id}", "")],
            },
            {
                key: "c_voting_poll_clone",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Poll/ClonePoll/{id}", "")],
            },
            {
                key: "c_voting_classification_mutations",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/VotingClassification", ""),
                    api("PUT", "/sis_api/VotingClassification", ""),
                    api("DELETE", "/sis_api/VotingClassification/{id}", ""),
                ],
            },
        ],
    },

    {
        pageId: "voting_create",
        nameEn: "Create Poll",
        nameAr: "إنشاء تصويت",
        routePath: "/sis/voting/create",
        pageRole: "p_voting_create",
        source: "menu",
        primaryStore: "useVotingStore",
        pageDataApis: [],
        controls: [],
        notes: "PollCreatePage.vue — same component as edit.",
    },

    {
        pageId: "voting_groups",
        nameEn: "Voting Groups",
        nameAr: "مجموعات التصويت",
        routePath: "/sis/voting/groups",
        pageRole: "p_voting_groups",
        source: "menu",
        primaryStore: "useVotingStore",
        pageDataApis: [
            g("/sis_api/VotingGroup", ""),
            g("/sis_api/VotingGroupMember?votingGroupId={id}", ""),
        ],
        controls: [
            {
                key: "c_voting_groups_mutations",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/VotingGroup", ""),
                    api("PUT", "/sis_api/VotingGroup", ""),
                    api("DELETE", "/sis_api/VotingGroup/{id}", ""),
                    api("POST", "/sis_api/VotingGroupMember", ""),
                    api("DELETE", "/sis_api/VotingGroupMember/{id}", ""),
                ],
            },
        ],
    },

    {
        pageId: "voting_classifications",
        nameEn: "Classifications",
        nameAr: "تصنيفات التصويت",
        routePath: "/sis/voting/classifications",
        pageRole: "p_voting_classifications",
        source: "menu",
        primaryStore: "useVotingStore",
        pageDataApis: [g("/sis_api/VotingClassification", "")],
        controls: [],
    },

    {
        pageId: "voting_student_portal",
        nameEn: "Student Voting Portal",
        nameAr: "بوابة تصويت الطلاب",
        routePath: "/sis/voting/student",
        pageRole: "p_voting_student",
        source: "menu",
        primaryStore: "useVotingStore",
        pageDataApis: [
            g("/sis_api/Poll/GetPollsForStudent/{personId}", ""),
            g(
                "/sis_api/Poll/GetPollWithQuestions/{pollId}?personId={personId}",
                "",
            ),
        ],
        controls: [
            {
                key: "c_voting_student_submit_responses",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/PollResponse", ""),
                    api(
                        "POST",
                        "/sis_api/PollResponse/SubmitPollResponses",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "question_bank",
        nameEn: "Question Bank",
        nameAr: "بنك الاسئلة",
        routePath: "/sis/question-bank",
        pageRole: "p_question_bank",
        source: "menu",
        primaryStore: "questionBankStore",
        pageDataApis: [
            g("/sis_api/QuestionBank", ""),
            g("/sis_api/Question/GetQuestionsBasedOnQuestionBank", ""),
        ],
        controls: [
            {
                key: "c_question_bank_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/QuestionBank", "")],
            },
            {
                key: "c_question_bank_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/QuestionBank", "")],
            },
            {
                key: "c_question_bank_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/QuestionBank/{id}", "")],
            },
            {
                key: "c_question_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Question/CreateQuestion", "")],
            },
            {
                key: "c_question_edit",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Question/UpdateQuestion", "")],
            },
            {
                key: "c_question_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Question/{id}", "")],
            },
        ],
    },

    {
        pageId: "question_import_export",
        nameEn: "Import/Export Questions",
        nameAr: "استيراد/تصدير الأسئلة",
        routePath: "/sis/question-bank/import",
        pageRole: "p_question_bank_import",
        source: "menu",
        primaryStore: "questionBankStore",
        pageDataApis: [g("/sis_api/QuestionBank", "Bank dropdown")],
        controls: [
            {
                key: "c_question_bank_import",
                description:
                    "Bulk question import wizard: download template, upload file, validate rows, confirm import.",
                status: "implemented",
                ui: [
                    "QuestionImportExportPage.vue — Download template button (card heading/hint stay visible without c_question_bank_import)",
                    "QuestionImportExportPage.vue — Upload drop zone and file input",
                    "QuestionImportExportPage.vue — Validate (step 2 → 3)",
                    "QuestionImportExportPage.vue — Confirm import (step 4)",
                ],
                apis: [
                    api("GET", "/sis_api/api/bulkupload/question/template", ""),
                    api("POST", "/sis_api/api/bulkupload/question/upload", ""),
                    api(
                        "POST",
                        "/sis_api/api/bulkupload/question/validate",
                        "",
                    ),
                    api("POST", "/sis_api/api/bulkupload/question/confirm", ""),
                ],
            },
        ],
        notes: "QuestionImportExportPage.vue — bank list uses pageDataApis; mutations use c_question_bank_import.",
    },

    {
        pageId: "quizzes_hub",
        nameEn: "Quizzes (list, start, edit, reports, regrade, stats, analysis, preview)",
        routePath: "/sis/quizzes",
        routeAliases: [
            "/sis/quizzes/{quizId}/start",
            "/sis/quizzes/{quizId}/edit",
            "/sis/quizzes/{quizId}/grades-report",
            "/sis/quizzes/{quizId}/regrade",
            "/sis/quizzes/{quizId}/statistics",
            "/sis/quizzes/{quizId}/response-analysis",
            "/sis/quizzes/{quizId}/result-preview",
        ],
        pageRole: "p_quizzes",
        source: "menu",
        primaryStore: "quizStore",
        pageDataApis: [
            g("/sis_api/Quiz/Available", ""),
            g("/sis_api/Quiz/Assigned", ""),
            g("/sis_api/Quiz/{id}", ""),
            g("/sis_api/QuizAttempt/GetDataForStartAttempt/{id}", ""),
            g("/sis_api/Course", ""),
            g("/sis_api/Quiz/GradesReport/{id}", "grades report page"),
            g("/sis_api/Quiz/Statistics/{id}", ""),
            g("/sis_api/Quiz/ResponseAnalysis/{id}", ""),
        ],
        controls: [
            {
                key: "c_quizzes_bulk_create",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Quiz/Bulk", "")],
            },
            {
                key: "c_quizzes_update",
                status: "missing_in_ui",
                apis: [
                    api("PUT", "/sis_api/Quiz/{id}", ""),
                    api("PUT", "/sis_api/Quiz/Bulk/{id}", ""),
                ],
            },
            {
                key: "c_quizzes_publish",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Quiz/Publish/{id}", "")],
            },
            {
                key: "c_quizzes_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Quiz/{id}", "")],
            },
            {
                key: "c_quizzes_result_preview",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/Quiz/WithAttemptData/{quizId}", ""),
                ],
            },
        ],
    },

    {
        pageId: "quiz_regrade",
        nameEn: "Quiz Regrade",
        routePath: "/sis/quizzes/{quizId}/regrade",
        pageRole: "p_quizzes",
        source: "menu",
        primaryStore: "quizRegradeStore",
        pageDataApis: [
            g("/sis_api/Quiz/{id}", ""),
            g("/sis_api/Quiz/StudentsStatus/{id}", ""),
            g("/sis_api/Quiz/{id}/GradingOverride/{attemptId}", ""),
        ],
        controls: [
            {
                key: "c_quiz_regrade_override_write",
                status: "missing_in_ui",
                apis: [
                    api(
                        "PUT",
                        "/sis_api/Quiz/{id}/GradingOverride/{attemptId}",
                        "",
                    ),
                    api(
                        "DELETE",
                        "/sis_api/Quiz/{id}/GradingOverride/{attemptId}",
                        "",
                    ),
                    api(
                        "POST",
                        "/sis_api/Quiz/{id}/RegradeByQuestion/{questionId}",
                        "",
                    ),
                    api("POST", "/sis_api/Quiz/{id}/RegradeAllAttempts", ""),
                ],
            },
        ],
    },

    {
        pageId: "assignments_teacher",
        nameEn: "Assignments (teacher flows)",
        routePath: "/sis/assignments",
        routeAliases: [
            "/sis/assignments/create",
            "/sis/assignments/edit/{id}",
            "/sis/assignments/{id}/submissions",
            "/sis/assignments/{id}/overrides",
            "/sis/assignments/{id}/grade/{submissionId}",
        ],
        pageRole: "p_assignments",
        source: "menu",
        primaryStore: "assignmentStore",
        pageDataApis: [
            g("/sis_api/Assignment", "Teacher list"),
            g("/sis_api/Assignment/GetByTeacher?personId={id}", ""),
            g(
                "/sis_api/Assignment/GetByCourseSemester?courseSemesterId={id}",
                "",
            ),
            g("/sis_api/Assignment/GetRubrics", ""),
            g("/sis_api/Assignment/{id}/submissions", ""),
        ],
        controls: [
            {
                key: "c_assignments_create",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Assignment", "")],
            },
            {
                key: "c_assignments_update",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Assignment", "")],
            },
            {
                key: "c_assignments_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Assignment/{id}", "")],
            },
            {
                key: "c_assignments_attachments",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Assignment/{id}/attachments", "")],
            },
            {
                key: "c_assignments_grade_submission",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/Assignment/submissions/grade", ""),
                    api(
                        "POST",
                        "/sis_api/Assignment/submissions/{id}/feedback-files",
                        "",
                    ),
                ],
            },
            {
                key: "c_assignments_release_grades",
                status: "missing_in_ui",
                apis: [
                    api(
                        "POST",
                        "/sis_api/Assignment/{id}/release-all-grades",
                        "",
                    ),
                ],
            },
            {
                key: "c_assignments_overrides",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/Assignment/{id}/overrides", ""),
                    api("PUT", "/sis_api/Assignment/overrides/{id}", ""),
                    api("DELETE", "/sis_api/Assignment/overrides/{id}", ""),
                ],
            },
        ],
    },

    {
        pageId: "assignments_student",
        nameEn: "Student Assignments",
        routePath: "/sis/student-assignments",
        routeAliases: ["/sis/student-assignments/{id}"],
        pageRole: "p_assignments",
        source: "menu",
        notes: "baseStore getBreadcrumbs aliases student-assignments paths to assignments parent for breadcrumbs.",
        primaryStore: "assignmentStore",
        pageDataApis: [
            g("/sis_api/Assignment/GetByStudent", ""),
            g("/sis_api/Assignment/GetStudentCourseSemesters", ""),
            g("/sis_api/Assignment/GetMySubmission?assignmentId={id}", ""),
        ],
        controls: [
            {
                key: "c_student_assignments_submit",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Assignment/SubmitAssignment", "")],
            },
            {
                key: "c_student_assignments_delete_submission_file",
                status: "missing_in_ui",
                apis: [
                    api(
                        "DELETE",
                        "/sis_api/Assignment/SubmissionFiles/{id}",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "discussions",
        nameEn: "Discussion Forums",
        nameAr: "منتديات النقاش",
        routePath: "/sis/discussions",
        routeAliases: ["/sis/discussions/{id}"],
        pageRole: "p_discussions",
        source: "menu",
        primaryStore: "discussionStore",
        pageDataApis: [
            g("/sis_api/Discussion?query", "List filter"),
            g("/sis_api/Discussion/{id}", "Thread"),
            g("/sis_api/Discussion/participants?query", ""),
            api(
                "POST",
                "/sis_api/Discussion/replies",
                "Replies — page role p_discussions (not a separate c_* control)",
            ),
            api(
                "PUT",
                "/sis_api/Discussion/replies/{id}",
                "Replies — page role p_discussions",
            ),
            api(
                "DELETE",
                "/sis_api/Discussion/replies/{id}",
                "Replies — page role p_discussions",
            ),
            api(
                "POST",
                "/sis_api/Discussion/replies/{id}/like",
                "Replies — page role p_discussions",
            ),
        ],
        controls: [
            {
                key: "c_discussions_add",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Discussion", "")],
            },
            {
                key: "c_discussions_edit",
                status: "missing_in_ui",
                apis: [
                    api("PUT", "/sis_api/Discussion/{id}", ""),
                    api("POST", "/sis_api/Discussion/{id}/lock", ""),
                    api("POST", "/sis_api/Discussion/{id}/grades", ""),
                ],
            },
            {
                key: "c_discussions_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Discussion/{id}", "")],
            },
        ],
    },

    {
        pageId: "rubrics",
        nameEn: "Rubric Manager",
        nameAr: " معايير التقييم",
        routePath: "/sis/rubrics",
        routeAliases: ["/sis/rubrics/create", "/sis/rubrics/edit/{id}"],
        pageRole: "p_rubrics",
        source: "menu",
        primaryStore: "rubricStore",
        pageDataApis: [
            g("/sis_api/Rubric/GetByTeacher?personId={id}", ""),
            g("/sis_api/Rubric/GetTemplates", ""),
            g("/sis_api/Rubric/{id}", ""),
        ],
        controls: [
            {
                key: "c_rubrics_create",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Rubric/Create?personId={id}", "")],
            },
            {
                key: "c_rubrics_update",
                status: "missing_in_ui",
                apis: [api("PUT", "/sis_api/Rubric/Update", "")],
            },
            {
                key: "c_rubrics_delete",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Rubric/{id}", "")],
            },
            {
                key: "c_rubrics_toggle_template",
                status: "missing_in_ui",
                apis: [api("PATCH", "/sis_api/Rubric/ToggleTemplate/{id}", "")],
            },
        ],
    },

    {
        pageId: "file_manager",
        nameEn: "File Manager",
        nameAr: "المصادر الدراسية",
        routePath: "/sis/file-manager",
        pageRole: "p_file_manager",
        source: "menu",
        primaryStore: "documentStorageStore",
        pageDataApis: [
            g("/sis_api/DocumentStoragePath", ""),
            g("/sis_api/DocumentType", ""),
        ],
        controls: [
            {
                key: "c_file_manager_bulk_upload",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Document/BulkUpload", "")],
            },
            {
                key: "c_file_manager_copy_cut",
                status: "missing_in_ui",
                apis: [api("POST", "/sis_api/Document/CopyOrCut", "")],
            },
            {
                key: "c_file_manager_delete_document",
                status: "missing_in_ui",
                apis: [api("DELETE", "/sis_api/Document/{id}", "")],
            },
            {
                key: "c_file_manager_storage_path",
                status: "missing_in_ui",
                apis: [
                    api("POST", "/sis_api/DocumentStoragePath", ""),
                    api("POST", "/sis_api/DocumentStoragePath/CopyOrCut", ""),
                    api(
                        "DELETE",
                        "/sis_api/DocumentStoragePath/{id}/Recursive",
                        "",
                    ),
                ],
            },
        ],
    },

    {
        pageId: "file_manager_trash",
        nameEn: "Trash",
        nameAr: "سلة المحذوفات",
        routePath: "/sis/file-manager/trash",
        pageRole: "p_file_manager_trash",
        source: "menu",
        primaryStore: "documentTrashStore",
        pageDataApis: [],
        controls: [
            {
                key: "c_file_manager_trash_restore_or_purge",
                status: "missing_in_ui",
                description:
                    "Trash actions use documentTrashStore multi-step POSTs",
                apis: [],
            },
        ],
        notes: "documentTrashStore uses dynamic endpoints — fill apis from store when stabilised.",
    },

    {
        pageId: "student_tasks",
        nameEn: "Student Tasks",
        nameAr: "مهام الطالب",
        routePath: "/sis/tasks",
        pageRole: "p_tasks",
        source: "menu",
        primaryStore: "useStudentTasksStore",
        pageDataApis: [g("/sis_api/StudentTasks/list", "")],
        controls: [],
        notes: "POST/PUT/DELETE personal tasks use page access only (p_tasks), no fine-grained c_* controls. Weekly calendar GET schedule uses p_tasks_calendar.",
    },

    {
        pageId: "student_tasks_calendar",
        nameEn: "Weekly Calendar",
        nameAr: "التقويم الأسبوعي",
        routePath: "/sis/tasks/calendar",
        pageRole: "p_tasks_calendar",
        source: "menu",
        primaryStore: "useStudentTasksStore",
        pageDataApis: [
            g("/sis_api/StudentTasks/schedule", "GET with date params"),
        ],
        controls: [],
    },
];

const registry = {
    $schemaDescription:
        "Full SIS module registry: page reads under pageRole (p_*); controls (c_*) list write/command APIs only. controllerSegment inferred from path after /sis_api/ or /sec_api/. Sub-routes inherit longest-prefix menu pageRole. Implemented c_* keys are wired in Vue; missing_in_ui marks proposed command roles not yet guarded.",
    registryNotes: {
        menuRouterMismatch: [
            "baseStore menu links to /sis/academic-regulations2 (p_academic_regulations2) but sis/router.js route is commented out; live Pass/Fail uses /sis/academic-regulations and /sis/college-regulation-management/:regulationId.",
            "baseStore exam-results-analysis menu entry is commented; router still exposes /sis/exam-results-analysis.",
        ],
        breadcrumbAliases: [
            "Student assignment paths under /sis/student-assignments alias to /sis/assignments for breadcrumbs (baseStore getBreadcrumbs).",
            "Assignment submissions and grading workspaces have custom breadcrumb chains.",
            "Quiz grades-report, rubrics create/edit, tasks calendar have custom breadcrumb handling.",
        ],
    },
    implementedControlKeysInCodebase: [
        "c_academic_years_add",
        "c_academic_years_edit",
        "c_academic_years_delete",
        "c_academic_levels_add",
        "c_academic_levels_edit",
        "c_academic_levels_delete",
        "c_academic_levels_iteration",
        "c_academic_levels_iteration_enrollment",
        "c_academic_levels_iteration_semesters",
        "c_academic_regulations_add",
        "c_academic_regulations_edit",
        "c_academic_regulations_delete",
    ],
    pages,
};

fs.writeFileSync(outPath, JSON.stringify(registry, null, 4) + "\n", "utf8");
console.log("Wrote", outPath, "pages:", pages.length);
