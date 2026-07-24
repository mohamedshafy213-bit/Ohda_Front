import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { apiGet } from "@/utilities/fetchApi.js";
import {
    decodeJwtPayload,
    extractRealmRolesFromPayload,
} from "@/composables/useAllowedControls.js";

/**
 * Returns a copy of the menu tree containing only items whose nameEn is in `allowed`
 * (recursive: section/submenu nodes are kept only if they still have visible children).
 */
function filterMenuByAllowedPages(menuRoots, allowed) {
    const allowedSet = new Set(allowed ?? []);

    function filterItems(items) {
        if (!items?.length) return [];
        const out = [];
        for (const item of items) {
            if (item.items?.length) {
                const children = filterItems(item.items);
                if (children.length) {
                    out.push({ ...item, items: children });
                }
            } else if (item.to && allowedSet.has(item.key)) {
                out.push(item);
            }
        }
        return out;
    }

    return menuRoots
        .map((section) => {
            if (!section.items?.length) return null;
            const items = filterItems(section.items);
            return items.length ? { ...section, items } : null;
        })
        .filter(Boolean);
}

/**
 * Removes nodes with `isShownInSidebar === false`. Branch nodes stay when they still have visible children.
 */
function filterMenuBySidebarVisibility(menuRoots) {
    if (!menuRoots?.length) {
        return [];
    }

    function filterItems(items) {
        if (!items?.length) {
            return [];
        }
        const out = [];
        for (const item of items) {
            const hasNested =
                Array.isArray(item.items) && item.items.length > 0;
            if (hasNested) {
                const children = filterItems(item.items);
                if (children.length === 0) {
                    continue;
                }
                out.push({ ...item, items: children });
            } else if (
                item.isShownInSidebar === false ||
                item.isShownInSidebar === "false"
            ) {
                continue;
            } else {
                out.push(item);
            }
        }
        return out;
    }

    return menuRoots
        .map((section) => {
            if (!section.items?.length) {
                return null;
            }
            const items = filterItems(section.items);
            return items.length ? { ...section, items } : null;
        })
        .filter(Boolean);
}

function flattenMenuModelPaths(menuRoots) {
    const paths = [];
    function walk(items) {
        if (!items?.length) return;
        for (const item of items) {
            if (item.items?.length) {
                walk(item.items);
            } else if (item.to) {
                paths.push(item.to);
            }
        }
    }
    for (const section of menuRoots ?? []) {
        if (section.items?.length) walk(section.items);
    }
    return paths;
}

function pathMatchesAllowedMenuRoute(path, allowedPaths) {
    const normalized = (path || "/").replace(/\/$/, "") || "/";
    if (!allowedPaths.length) return false;
    const sorted = [...allowedPaths].sort((a, b) => b.length - a.length);
    for (const base of sorted) {
        const nb = (base || "/").replace(/\/$/, "") || "/";
        if (normalized === nb) return true;
        if (nb !== "/" && normalized.startsWith(`${nb}/`)) return true;
    }
    return false;
}

export const useOldBaseStore = defineStore("oldBase", {
    state: () => ({
        pageTree: [
            {
                href: "/",
                title: "Dashboard",
                icon: "User",
            },
            {
                href: "/charts",
                title: "Charts",
                icon: "Building2",
                child: [
                    {
                        href: "/charts/sublink",
                        title: "Sub Link",
                        icon: "Building2",
                    },
                ],
            },
        ],
        dateRange: {
            fromDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            toDate: new Date(),
        },
        user: null,
        router: useRouter(),
        currentPathPermissions: [],
        entityConfiguration: null,
        /** Realm roles with prefix p_; must match menu item `key`; set from JWT */
        allowedMenuPageNames: [],
        /** Realm roles with prefix c_; UI controls / actions */
        allowedControls: [],
        // SIS Menu Model - Using actual routes and Lucide icons with bilingual support
        menuModelAll: [
            {
                nameEn: "stucture",
                nameAr: "الهيكل الإداري و الاكاديمي",
                icon: "Building2",
                items: [
                    {
                        key: "p_structure_hierarchy",
                        nameEn: "Hierarchy",
                        nameAr: "الهيكل الإداري",
                        icon: "Building",
                        to: "/structure/hierarchy",
                    },
                    {
                        key: "p_academic_years",
                        nameEn: "Academic Year",
                        nameAr: "العام التدريبي / السنة الدراسية",
                        icon: "CalendarCog",
                        to: "/sis/academic-years",
                    },
                    {
                        key: "p_academic_levels",
                        nameEn: "Academic Level",
                        nameAr: "المستوى الأكاديمي",
                        icon: "Layers",
                        to: "/sis/academic-levels",
                    },
                    {
                        key: "p_academic_levels_configuration",
                        nameEn: "Academic Level Configuration",
                        nameAr: "توزيع المستوى الأكاديمي",
                        icon: "LayersPlus",
                        to: "/sis/academic-levels-configuration",
                    },
                    {
                        key: "p_academic_regulations",
                        nameEn: "Academic Regulations",
                        nameAr: "اللوائح الأكاديمية",
                        icon: "ScrollText",
                        to: "/sis/academic-regulations",
                    },
                ],
            },
            {
                nameEn: "SIS",
                nameAr: "ادارة العملية التعليمية",
                icon: "GraduationCap",
                items: [
                    {
                        key: "p_periods",
                        nameEn: "Periods",
                        nameAr: "المحاضرات و الطوابير",
                        icon: "Clock",
                        to: "/sis/periods",
                    },
                    {
                        key: "p_rooms",
                        nameEn: "Rooms",
                        nameAr: "القاعات",
                        icon: "DoorOpen",
                        to: "/sis/rooms",
                    },
                    {
                        key: "p_academic_regulations2",
                        nameEn: "College/Institute Settings",
                        nameAr: "اعدادات الكلية/المعهد",
                        icon: "Settings",
                        to: "/sis/academic-regulations2",
                    },
                    {
                        key: "p_file_manager",
                        nameEn: "File Manager",
                        nameAr: "المصادر الدراسية",
                        icon: "BookOpen",
                        to: "/sis/file-manager",
                    },
                    {
                        key: "p_file_manager_trash",
                        nameEn: "Trash",
                        nameAr: "سلة المحذوفات",
                        icon: "Trash2",
                        to: "/sis/file-manager/trash",
                    },
                    {
                        key: "p_question_bank",
                        nameEn: "Question Bank",
                        nameAr: "بنك الاسئلة",
                        icon: "BookOpen",
                        to: "/sis/question-bank",
                    },
                    {
                        key: "p_quizzes",
                        nameEn: "Quizzes",
                        nameAr: "الاختبارات",
                        icon: "ClipboardList",
                        to: "/sis/quizzes",
                    },
                    {
                        key: "p_question_bank_import",
                        nameEn: "Import/Export Questions",
                        nameAr: "استيراد/تصدير الأسئلة",
                        icon: "FileUp",
                        to: "/sis/question-bank/import",
                    },
                    {
                        key: "p_assignments",
                        nameEn: "Assignments",
                        nameAr: "الواجبات",
                        icon: "ClipboardList",
                        to: "/sis/assignments",
                    },
                    {
                        key: "p_discussions",
                        nameEn: "Discussion Forums",
                        nameAr: "منتديات النقاش",
                        icon: "MessagesSquare",
                        to: "/sis/discussions",
                    },
                    {
                        key: "p_rubrics",
                        nameEn: "Rubric Manager",
                        nameAr: " معايير التقييم",
                        icon: "LayoutGrid",
                        to: "/sis/rubrics",
                    },
                    {
                        key: "p_tasks",
                        nameEn: "Student Tasks",
                        nameAr: "مهام الطالب",
                        icon: "ListTodo",
                        to: "/sis/tasks",
                    },
                    {
                        key: "p_tasks_calendar",
                        nameEn: "Weekly Calendar",
                        nameAr: "التقويم الأسبوعي",
                        icon: "CalendarDays",
                        to: "/sis/tasks/calendar",
                    },
                ],
            },
            {
                nameEn: "SIS",
                nameAr: "تخطيط التعليم",
                icon: "GraduationCap",
                items: [
                    {
                        key: "p_group_schedule",
                        nameEn: "Schedual",
                        nameAr: "الجدول الدراسي",
                        icon: "CalendarDays",
                        to: "/sis/group-schedule",
                    },
                    {
                        nameEn: "Courses Management",
                        nameAr: "ادارة المقررات",
                        icon: "BookOpen",
                        items: [
                            {
                                key: "p_courses",
                                nameEn: "Courses",
                                nameAr: "المقررات / المواد",
                                icon: "BookOpen",
                                to: "/sis/courses",
                            },
                            {
                                key: "p_current_courses",
                                nameEn: "Current Courses",
                                nameAr: "المقررات الحالية",
                                icon: "BookOpen",
                                to: "/sis/current-courses",
                            },
                            {
                                key: "p_course_categories",
                                nameEn: "Course Categories",
                                nameAr: "فئات المقررات",
                                icon: "BookUser",
                                to: "/sis/course-categories",
                            },
                            {
                                key: "p_course_types",
                                nameEn: "Course Types",
                                nameAr: "أنواع المقررات",
                                icon: "BookType",
                                to: "/sis/course-types",
                            },
                            {
                                key: "p_degree_divisions",
                                nameEn: "Academic Activities",
                                nameAr: "الانشطة الدراسية",
                                icon: "CirclePercent",
                                to: "/sis/degree-divisions",
                            },
                            {
                                key: "p_grade_scales",
                                nameEn: "Grade Scales",
                                nameAr: "مقاييس الدرجات",
                                icon: "Scale",
                                to: "/sis/grade-scales",
                            },
                            {
                                key: "p_fitness_exercises",
                                nameEn: "Fitness Exercises",
                                nameAr: "تمارين اللياقة",
                                icon: "Award",
                                to: "/sis/fitness-exercises",
                            },
                            {
                                key: "p_fitness_exercise_evaluations",
                                nameEn: "Fitness Exercise Evaluations",
                                nameAr: "تقييم تمارين اللياقة",
                                icon: "Activity",
                                to: "/sis/fitness-exercise-evaluations",
                            },
                            {
                                key: "p_fitness_age_stages",
                                nameEn: "Fitness Age Stages",
                                nameAr: "المراحل السنية لاختبارات اللياقة",
                                icon: "Activity",
                                to: "/sis/fitness-age-stages",
                            },
                        ],
                    },
                ],
            },
            {
                nameEn: "personnel",
                nameAr: "اعدادات المستخدمين",
                icon: "Users",
                items: [
                    {
                        nameEn: "Main Data",
                        nameAr: "البيانات الأساسية",
                        icon: "FileText",
                        items: [
                            {
                                key: "p_structure_blood_types",
                                nameEn: "Blood Types",
                                nameAr: "فصائل الدم",
                                icon: "Droplet",
                                to: "/structure/blood-types",
                            },
                            {
                                key: "p_structure_religions",
                                nameEn: "Religions",
                                nameAr: "الديانات",
                                icon: "Book",
                                to: "/structure/religions",
                            },
                            {
                                key: "p_structure_batches",
                                nameEn: "Batches",
                                nameAr: "الدفعات",
                                icon: "Layers",
                                to: "/structure/batches",
                            },
                            {
                                key: "p_structure_military_ranks",
                                nameEn: "Military Ranks",
                                nameAr: "الرتب العسكرية",
                                icon: "Shield",
                                to: "/structure/military-ranks",
                            },
                            {
                                key: "p_structure_weapons",
                                nameEn: "Weapons",
                                nameAr: "الأسلحة",
                                icon: "Sword",
                                to: "/structure/weapons",
                            },
                            {
                                key: "p_structure_nationalities",
                                nameEn: "Nationalities",
                                nameAr: "الجنسيات",
                                icon: "Globe",
                                to: "/structure/nationalities",
                            },
                            {
                                key: "p_structure_governates",
                                nameEn: "Governates",
                                nameAr: "المحافظات",
                                icon: "Map",
                                to: "/structure/governates",
                            },
                            {
                                key: "p_structure_lookup_colleges",
                                nameEn: "Colleges",
                                nameAr: "الكليات",
                                icon: "GraduationCap",
                                to: "/structure/lookup-colleges",
                            },
                            {
                                key: "p_structure_lookup_qualifications",
                                nameEn: "Qualifications",
                                nameAr: "المؤهلات",
                                icon: "Award",
                                to: "/structure/lookup-qualifications",
                            },
                            {
                                key: "p_structure_jobs",
                                nameEn: "Jobs",
                                nameAr: "الوظائف",
                                icon: "BriefcaseBusiness",
                                to: "/structure/jobs",
                            },
                            {
                                key: "p_structure_military_housing",
                                nameEn: "Military Housing",
                                nameAr: "التسكين العسكري",
                                icon: "Shield",
                                to: "/structure/militaryHousing",
                            },
                            {
                                key: "p_structure_housing",
                                nameEn: "Housing",
                                nameAr: "التسكين الاداري",
                                icon: "Building",
                                to: "/structure/housing",
                            },
                        ],
                    },
                    {
                        key: "p_structure_managers",
                        nameEn: "Managers",
                        nameAr: "مديري العملية التعليمية",
                        icon: "UserCheck",
                        to: "/structure/managers",
                    },
                    {
                        key: "p_structure_students",
                        nameEn: "Students",
                        nameAr: "الطلاب",
                        icon: "GraduationCap",
                        to: "/structure/students",
                    },
                    {
                        key: "p_structure_medics",
                        nameEn: "Doctors",
                        nameAr: "الاطباء",
                        icon: "Stethoscope",
                        to: "/structure/medics",
                    },
                    {
                        key: "p_structure_teaching_staff",
                        nameEn: "Teaching Staff",
                        nameAr: "أعضاء هيئة التدريس",
                        icon: "BookUser",
                        to: "/structure/teaching-staff",
                    },
                    {
                        key: "p_students_bulk_upload",
                        nameEn: "Student Bulk Upload",
                        nameAr: "إستيراد بيانات الطلاب",
                        icon: "Upload",
                        to: "/sis/students/bulk-upload",
                    },
                ],
            },
            {
                nameEn: "Lecture Schedule",
                nameAr: " المحاضرات اليومي",
                icon: "Clock",
                items: [
                    {
                        key: "p_lecture_schedule",
                        nameEn: "Lecture Schedule",
                        nameAr: " المحاضرات اليومية",
                        icon: "Clock",
                        to: "/sis/lecture-schedule",
                    },
                ],
            },
            {
                nameEn: "Academic Level Results",
                nameAr: "التقييم و النتائج",
                icon: "FileSpreadsheet",
                items: [
                    {
                        key: "p_student_grades_by_division",
                        nameEn: "Student Grades By Division",
                        nameAr: "درجات الطلاب في المواد",
                        icon: "ClipboardList",
                        to: "/sis/student-grades-by-division",
                    },
                    {
                        key: "p_academic_level_results",
                        nameEn: "Academic Level Results",
                        nameAr: "نتائج المستوى الأكاديمي",
                        icon: "FileSpreadsheet",
                        to: "/sis/academic-level-results",
                    },
                    {
                        key: "p_pass_fail_results",
                        nameEn: "Pass/Fail Results",
                        nameAr: "حساب النتيجة النهائية",
                        icon: "ClipboardCheck",
                        to: "/sis/pass-fail-results",
                    },
                    {
                        key: "p_course_grade_analysis",
                        nameEn: "Course Grade Analysis",
                        nameAr: "النتيجة النهائية (تحليل المواد)",
                        icon: "FileText",
                        to: "/sis/course-grade-analysis",
                    },
                    {
                        key: "p_grade_change_log",
                        nameEn: "Grade Change Log",
                        nameAr: "سجل تعديلات الدرجات",
                        icon: "FileText",
                        to: "/sis/grade-change-log",
                    },
                    // {
                    //     nameEn: "Exam Results Analysis",
                    //     nameAr: "إحصائية إجمالية للنتيجة",
                    //     icon: "BarChart3",
                    //     to: "/sis/exam-results-analysis",
                    // },
                ],
            },
            {
                nameEn: "Operational Dashboards",
                nameAr: "معدلات الاداء و الاحصائيات",
                icon: "LayoutGrid",
                items: [
                    {
                        key: "p_operational_dashboard",
                        nameEn: "Operational Dashboard",
                        nameAr: "لوحة الأداء التشغيلية",
                        icon: "BarChart3",
                        to: "/sis/operational-dashboard",
                    },
                ],
            },
            {
                nameEn: "Security",
                nameAr: "الأمان",
                icon: "Shield",
                items: [
                    {
                        key: "p_sec_users",
                        nameEn: "Users",
                        nameAr: "المستخدمون",
                        icon: "Users",
                        to: "/sec/users",
                    },
                    {
                        key: "p_sec_groups",
                        nameEn: "Groups",
                        nameAr: "المجموعات",
                        icon: "ShieldUser",
                        to: "/sec/groups",
                    },
                    {
                        key: "p_sec_groups_manage",
                        nameEn: "Groups Management",
                        nameAr: "إدارة المجموعات",
                        icon: "UserCog",
                        to: "/sec/groups-manage",
                    },
                    {
                        key: "p_sec_pages",
                        nameEn: "Pages",
                        nameAr: "الصفحات",
                        icon: "FileText",
                        to: "/sec/Pages",
                    },
                ],
            },
            {
                nameEn: "HR Cycles",
                nameAr: "الانضباط و المواظبة",
                icon: "BriefcaseBusiness",
                items: [
                    {
                        key: "p_hr_cycles_lookup_action_code",
                        nameEn: "Punishment Types",
                        nameAr: "أنواع العقوبات",
                        icon: "AlertOctagon",
                        to: "/hr-cycles/lookup-action-code",
                    },
                    {
                        key: "p_hr_cycles_lookup_cycle_category",
                        nameEn: "Completion Types And Medical Recommendations",
                        nameAr: "أنواع التمامات والتوصيات الطبية",
                        icon: "CheckCircle",
                        to: "/hr-cycles/lookup-cycle-category",
                    },
                    {
                        key: "p_warning_rules",
                        nameEn: "Warning Rules",
                        nameAr: "قواعد الإنذارات",
                        icon: "AlertOctagon",
                        to: "/sis/warning-rules",
                    },

                    {
                        key: "p_student_warnings",
                        nameEn: "Issued Warnings",
                        nameAr: "الإنذارات الصادرة",
                        icon: "FileText",
                        to: "/sis/student-warnings",
                    },
                    {
                        key: "p_hr_cycles_job_punish_authority",
                        nameEn: "Job Punishment Authority",
                        nameAr: "صلاحيات الجزاءات  ",
                        icon: "ShieldCheck",
                        to: "/hr-cycles/job-punish-authority",
                    },
                    {
                        key: "p_hr_cycles_student_office_summons",
                        nameEn: "Student Office Summons",
                        nameAr: "إنذار عرض مكتب",
                        icon: "UserRoundX",
                        to: "/hr-cycles/student-office-summons",
                    },
                    {
                        key: "p_hr_cycles_student_absence",
                        nameEn: "Student Absence",
                        nameAr: "غياب الطالب",
                        icon: "UserX",
                        to: "/hr-cycles/student-absence",
                    },

                    // Category 1: Leave Request Management
                    {
                        nameEn: "Leave Request Management",
                        nameAr: "إدارة طلبات الإجازة",
                        icon: "CalendarDays",
                        items: [
                            {
                                key: "p_hr_cycles_hr_agaza_group_leave",
                                nameEn: "Leave Request Group",
                                nameAr: "مجموعة طلبات الإجازة",
                                icon: "CalendarDays",
                                to: "/hr-cycles/hr-agaza-group/1",
                            },
                            {
                                key: "p_hr_cycles_hr_abs_employees_det_leave",
                                nameEn: "Leave Approval",
                                nameAr: "التصديق علي الطلبات",
                                icon: "ClipboardCheck",
                                to: "/hr-cycles/hr-abs-employees-det/1",
                            },
                            {
                                key: "p_hr_cycles_hr_abs_employees_leave",
                                nameEn: "Leave Requests",
                                nameAr: "الطلبات",
                                icon: "FileText",
                                to: "/hr-cycles/hr-abs-employees/1",
                            },
                        ],
                    },
                    // Category 2: Mission Request Management
                    {
                        nameEn: "Mission Request Management",
                        nameAr: "إدارة طلبات المأمورية",
                        icon: "BriefcaseBusiness",
                        items: [
                            {
                                key: "p_hr_cycles_hr_agaza_group_mission",
                                nameEn: "Mission Request Group",
                                nameAr: "مجموعة طلبات المأمورية",
                                icon: "CalendarDays",
                                to: "/hr-cycles/hr-agaza-group/2",
                            },
                            {
                                key: "p_hr_cycles_hr_abs_employees_det_mission",
                                nameEn: "Mission Approval",
                                nameAr: "التصديق علي الطلبات",
                                icon: "ClipboardCheck",
                                to: "/hr-cycles/hr-abs-employees-det/2",
                            },
                            {
                                key: "p_hr_cycles_hr_abs_employees_mission",
                                nameEn: "Mission Requests",
                                nameAr: "الطلبات",
                                icon: "FileText",
                                to: "/hr-cycles/hr-abs-employees/2",
                            },
                        ],
                    },
                    // Category 3: Clinic Request Management
                    {
                        nameEn: "Clinic Request Management",
                        nameAr: "إدارة طلبات العيادة",
                        icon: "Stethoscope",
                        items: [
                            {
                                key: "p_hr_cycles_hr_agaza_group_clinic",
                                nameEn: "Clinic Request Group",
                                nameAr: "مجموعة طلبات العيادة",
                                icon: "CalendarDays",
                                to: "/hr-cycles/hr-agaza-group/3",
                            },
                            {
                                key: "p_hr_cycles_hr_abs_employees_det_clinic",
                                nameEn: "Clinic Approval",
                                nameAr: "التصديق علي الطلبات",
                                icon: "ClipboardCheck",
                                to: "/hr-cycles/hr-abs-employees-det/3",
                            },
                            {
                                key: "p_hr_cycles_hr_abs_employees_clinic",
                                nameEn: "Clinic Requests",
                                nameAr: "الطلبات",
                                icon: "FileText",
                                to: "/hr-cycles/hr-abs-employees/3",
                            },
                            {
                                key: "p_hr_cycles_clinic_exam",
                                nameEn: "Clinic Examination",
                                nameAr: "كشف العيادة",
                                icon: "Stethoscope",
                                to: "/hr-cycles/clinic-exam",
                            },
                        ],
                    },
                    {
                        key: "p_hr_cycles_emp_leave_balance",
                        nameEn: "Employee Leave Balance",
                        nameAr: "أرصدة الإجازات",
                        icon: "Scale",
                        to: "/hr-cycles/emp-leave-balance",
                    },
                    // Discipline
                    {
                        key: "p_hr_cycles_punish_data",
                        nameEn: "Punish Data",
                        nameAr: "العقوبات",
                        icon: "AlertOctagon",
                        to: "/hr-cycles/punish-data",
                    },

                    {
                        key: "p_attendance_discipline_grades",
                        nameEn: "Attendance Discipline Grades",
                        nameAr: "درجات السلوك و الموظبة",
                        icon: "FileText",
                        to: "/sis/attendance-discipline-grades",
                    },

                    // Lookups
                ],
            },
            {
                nameEn: "Voting & Surveys",
                nameAr: "التصويت والإستبيانات",
                icon: "Vote",
                items: [
                    {
                        key: "p_voting",
                        nameEn: "Voting Dashboard",
                        nameAr: "لوحة التصويت",
                        icon: "LayoutDashboard",
                        to: "/sis/voting",
                    },
                    {
                        key: "p_voting_create",
                        nameEn: "Create Poll",
                        nameAr: "إنشاء تصويت",
                        icon: "PlusCircle",
                        to: "/sis/voting/create",
                    },
                    {
                        key: "p_voting_groups",
                        nameEn: "Voting Groups",
                        nameAr: "مجموعات التصويت",
                        icon: "Users",
                        to: "/sis/voting/groups",
                    },
                    {
                        key: "p_voting_classifications",
                        nameEn: "Classifications",
                        nameAr: "تصنيفات التصويت",
                        icon: "Tags",
                        to: "/sis/voting/classifications",
                    },
                    {
                        key: "p_voting_student",
                        nameEn: "Student Voting Portal",
                        nameAr: "بوابة تصويت الطلاب",
                        icon: "GraduationCap",
                        to: "/sis/voting/student",
                    },
                ],
            },
            // {
            //     nameEn: "Settings",
            //     nameAr: "الإعدادات",
            //     icon: "Settings",
            //     items: [
            //         {
            //             nameEn: "User Settings",
            //             nameAr: "إعدادات المستخدم",
            //             icon: "UserCog",
            //             to: "/user/settings",
            //         },
            //     ],
            // },
        ],
    }),
    actions: {
        applyPermissionsFromAccessToken(token) {
            const payload = decodeJwtPayload(token);
            if (!payload) {
                this.clearPermissionRoles();
                return;
            }
            const { allowedMenuPageNames, allowedControls } =
                extractRealmRolesFromPayload(payload);
            this.allowedMenuPageNames = allowedMenuPageNames;
            this.allowedControls = allowedControls;
        },

        clearPermissionRoles() {
            this.allowedMenuPageNames = [];
            this.allowedControls = [];
        },

        getAllowedMenuPathsFlat() {
            return flattenMenuModelPaths(this.menuModel);
        },

        isPathAllowedByMenuPermissions(path) {
            return pathMatchesAllowedMenuRoute(
                path,
                this.getAllowedMenuPathsFlat(),
            );
        },

        getFirstAllowedMenuPath() {
            const paths = this.getAllowedMenuPathsFlat();
            return paths[0] ?? null;
        },

        navigateToFirstAllowedPage() {
            const path = this.getFirstAllowedMenuPath();
            this.router.push(path || "/");
        },

        syncPermissionsFromStoredToken() {
            const token = localStorage.getItem("accessToken");
            if (token) this.applyPermissionsFromAccessToken(token);
            else this.clearPermissionRoles();
        },

        async getUser() {
            try {
                const response = await apiGet("/sis_api/Person/GetFullName");
                const sisUser = response.data?.singleObject;
                if (sisUser) {
                    if (this.user) {
                        // Merge imagePath into the already-loaded user (from sec_api /user/GET)
                        this.user = {
                            ...this.user,
                            imagePath: sisUser.imagePath,
                            fullName: sisUser.fullName,
                        };
                    } else {
                        this.user = sisUser;
                    }
                    localStorage.setItem("user", JSON.stringify(this.user));
                }
            } catch (e) {
                // non-critical – ignore
            }
        },
        // Generate breadcrumbs from menu model based on current route
        getBreadcrumbs(currentPath, locale = "en") {
            const breadcrumbs = [];

            // Normalize path (remove trailing slash, handle hash mode)
            const normalizedPath = currentPath
                .replace(/\/$/, "")
                .replace(/^#/, "");

            // ── Dynamic route overrides (parameterised paths) ───────────────────────
            if (/^\/sis\/assignments\/\d+\/submissions$/.test(normalizedPath)) {
                return [
                    {
                        name:
                            locale === "ar"
                                ? "ادارة العملية التعليمية"
                                : "Educational Management",
                        path: null,
                    },
                    {
                        name: locale === "ar" ? "الواجبات" : "Assignments",
                        path: "/sis/assignments",
                    },
                    {
                        name: locale === "ar" ? "التسليمات" : "Submissions",
                        path: null,
                    },
                ];
            }
            if (/^\/sis\/assignments\/\d+\/grade\/\d+$/.test(normalizedPath)) {
                return [
                    {
                        name:
                            locale === "ar"
                                ? "ادارة العملية التعليمية"
                                : "Educational Management",
                        path: null,
                    },
                    {
                        name: locale === "ar" ? "الواجبات" : "Assignments",
                        path: "/sis/assignments",
                    },
                    {
                        name: locale === "ar" ? "التصحيح" : "Grading",
                        path: null,
                    },
                ];
            }
            if (/^\/sis\/quizzes\/\d+\/grades-report$/.test(normalizedPath)) {
                return [
                    {
                        name:
                            locale === "ar"
                                ? "ادارة العملية التعليمية"
                                : "Educational Management",
                        path: null,
                    },
                    {
                        name: locale === "ar" ? "الاختبارات" : "Quizzes",
                        path: "/sis/quizzes",
                    },
                    {
                        name:
                            locale === "ar" ? "تقرير الدرجات" : "Grades Report",
                        path: null,
                    },
                ];
            }
            if (normalizedPath === "/sis/rubrics/create") {
                return [
                    {
                        name:
                            locale === "ar"
                                ? "ادارة العملية التعليمية"
                                : "Educational Management",
                        path: null,
                    },
                    {
                        name:
                            locale === "ar"
                                ? "مدير معايير التقييم"
                                : "Rubric Manager",
                        path: "/sis/rubrics",
                    },
                    {
                        name: locale === "ar" ? "إنشاء معيار" : "Create Rubric",
                        path: null,
                    },
                ];
            }
            if (/^\/sis\/rubrics\/edit\/[^/]+$/.test(normalizedPath)) {
                return [
                    {
                        name:
                            locale === "ar"
                                ? "ادارة العملية التعليمية"
                                : "Educational Management",
                        path: null,
                    },
                    {
                        name:
                            locale === "ar"
                                ? "مدير معايير التقييم"
                                : "Rubric Manager",
                        path: "/sis/rubrics",
                    },
                    {
                        name: locale === "ar" ? "تعديل معيار" : "Edit Rubric",
                        path: null,
                    },
                ];
            }
            if (normalizedPath === "/sis/tasks/calendar") {
                return [
                    {
                        name:
                            locale === "ar"
                                ? "ادارة العملية التعليمية"
                                : "Educational Management",
                        path: null,
                    },
                    {
                        name: locale === "ar" ? "مهام الطالب" : "Student Tasks",
                        path: "/sis/tasks",
                    },
                    {
                        name:
                            locale === "ar"
                                ? "التقويم الأسبوعي"
                                : "Weekly Calendar",
                        path: null,
                    },
                ];
            }
            // ───────────────────────────────────────────────────────────────────────────
            const aliasPath =
                normalizedPath === "/sis/student-assignments" ||
                normalizedPath.startsWith("/sis/student-assignments/")
                    ? "/sis/assignments"
                    : null;
            const pathsToTry = aliasPath
                ? [normalizedPath, aliasPath]
                : [normalizedPath];

            // Helper function to find item by path
            const findItemByPath = (items, path, parentPath = []) => {
                for (const item of items) {
                    const currentPathChain = [...parentPath, item];

                    // Normalize item path
                    const itemPath = item.to
                        ? item.to.replace(/\/$/, "")
                        : null;

                    // Exact match - highest priority
                    if (itemPath === path) {
                        return currentPathChain;
                    }

                    // Check children first (for nested routes)
                    if (item.items) {
                        const childResult = findItemByPath(
                            item.items,
                            path,
                            currentPathChain,
                        );
                        if (childResult) {
                            return childResult;
                        }
                    }

                    // Check if path starts with this item's path (for dynamic/nested routes)
                    // Only if this item has a path and the current path is longer
                    if (itemPath && path.startsWith(itemPath + "/")) {
                        // Try to find a more specific match in children
                        if (item.items) {
                            const childResult = findItemByPath(
                                item.items,
                                path,
                                currentPathChain,
                            );
                            if (
                                childResult &&
                                childResult.length > currentPathChain.length
                            ) {
                                return childResult;
                            }
                        }
                        // If no more specific child match, use this item
                        return currentPathChain;
                    }
                }
                return null;
            };

            // Search through menu model
            for (const pathToTry of pathsToTry) {
                for (const rootItem of this.menuModelAll) {
                    if (rootItem.items) {
                        const result = findItemByPath(
                            rootItem.items,
                            pathToTry,
                            [rootItem],
                        );
                        if (result) {
                            // Build breadcrumbs from the path
                            result.forEach((item) => {
                                const name =
                                    locale === "ar" && item.nameAr
                                        ? item.nameAr
                                        : item.nameEn || item.label || "";
                                breadcrumbs.push({
                                    name,
                                    path: item.to || null,
                                });
                            });
                            break;
                        }
                    }
                }
                if (breadcrumbs.length) break;
            }

            return breadcrumbs;
        },
    },
    getters: {
        menuModel(state) {
            const visibleInSidebar = filterMenuBySidebarVisibility(
                state.menuModelAll,
            );
            return filterMenuByAllowedPages(
                visibleInSidebar,
                state.allowedMenuPageNames,
            );
        },
        getMenuModel() {
            return this.menuModel;
        },
        hasAllowedControl: (state) => (controlKey) =>
            state.allowedControls.includes(controlKey),
    },
});
