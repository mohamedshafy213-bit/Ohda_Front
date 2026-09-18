/**
 * Comprehensive Interactive Page Guides for Ohda & Inventory System
 * Provides overview, action dictionaries, step-by-step workflows, and rules for every page.
 */

export const pageGuides = {
  "/ohda/dashboard": {
    path: "/ohda/dashboard",
    titleAr: "لوحة التحكم والمؤشرات العامة",
    titleEn: "Main Dashboard & KPI Overview",
    icon: "LayoutDashboard",
    summaryAr: "مركز المتابعة اللحظية للعمليات. يعرض مؤشرات الأداء الحيوية لرصيد المخزون، طلبات العهد المعلقة، وحالة الأصول.",
    summaryEn: "Real-time operations center displaying vital KPIs for inventory balances, pending requests, and asset custody statuses.",
    whoUsesAr: "مدير النظام، مسؤولو المستودع، مدراء الإدارات والمشرفون.",
    whoUsesEn: "System Admins, Inventory Managers, Department Heads, and Supervisors.",
    actions: [
      {
        nameAr: "بطاقات الإحصائيات العلوية",
        nameEn: "Top Metric Cards",
        icon: "BarChart3",
        descriptionAr: "عرض إجمالي المنتجات، إجمالي الأجهزة المتوفرة، العهد المصروفة، والمنتجات التي وصلت للحد الحرج.",
        descriptionEn: "Displays total products, available items, active issued custody, and items below safety threshold."
      },
      {
        nameAr: "تنبيهات المخزون الحرج",
        nameEn: "Critical Stock Alerts",
        icon: "AlertTriangle",
        descriptionAr: "بطاقات تنبيهية للأصناف التي اقتربت من النفاد لتوليد أوامر الشراء بسرعة.",
        descriptionEn: "Alert cards for items near depletion to prompt immediate purchase orders."
      },
      {
        nameAr: "الطلبات المعلقة السريعة",
        nameEn: "Pending Requests Shortcuts",
        icon: "Clock",
        descriptionAr: "الوصول المباشر لطلبات الصرف والتوريد التي تنتظر الموافقة والمراجعة.",
        descriptionEn: "Direct quick links to review and approve pending exit and entry requests."
      },
      {
        nameAr: "الرسم البياني لحركة المخزون",
        nameEn: "Stock Flow Chart",
        icon: "TrendingUp",
        descriptionAr: "مقارنة تدفق التوريد مقابل الصرف خلال الأشهر الأخيرة.",
        descriptionEn: "Visual comparison of inbound entry vs outbound exit over recent months."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "مراجعة المؤشرات اليومية",
        titleEn: "Review Daily Metrics",
        detailAr: "ابدأ يومك بفحص عدد الطلبات المعلقة في أعلى لوحة التحكم وأي تنبيه بنقص المخزون.",
        detailEn: "Check pending request badges and low-stock indicators at the start of your shift."
      },
      {
        stepNumber: 2,
        titleAr: "متابعة النواقص الحرجة",
        titleEn: "Inspect Low Stock",
        detailAr: "اضغط على بطاقة النواقص الحرجة للذهاب مباشرة لقائمة المخزون واتخاذ قرار إعادة الطلب.",
        detailEn: "Click on low-stock cards to jump directly to inventory and initiate reordering."
      }
    ],
    rules: [
      {
        titleAr: "تحديث تلقائي",
        titleEn: "Auto-refreshing",
        tipAr: "البيانات والإشعارات تتحدث في اللوحة تلقائياً عند اعتماد أي طلب جديد في النظام.",
        tipEn: "Dashboard metrics auto-update when any entry or exit request is approved."
      }
    ]
  },

  "/ohda/products": {
    path: "/ohda/products",
    titleAr: "إدارة المنتجات والأصناف والكتالوج",
    titleEn: "Product Catalog Management",
    icon: "Package",
    summaryAr: "الكتالوج المركزي لكل الأصناف والمعدات. يتيح تعريف بطاقة الصنف، تحديد نوع المخزون (شراء أو أصل ثابت)، أسعار التكلفة والبيع، وحد الأمان.",
    summaryEn: "Central product catalog. Define item cards, choose inventory type (Purchase vs Asset), set purchase/sale prices, and safety thresholds.",
    whoUsesAr: "مدير المخازن، مسؤولو المشتريات، ومديرو النظام.",
    whoUsesEn: "Inventory Managers, Procurement Officers, and System Administrators.",
    actions: [
      {
        nameAr: "إضافة منتج جديد (+)",
        nameEn: "Add New Product (+)",
        icon: "Plus",
        descriptionAr: "فتح نافذة تعريف صنف جديد مع توليد تلقائي للباركود ورمز الـ SKU وتحديد الفئة والمورد.",
        descriptionEn: "Opens modal to define a new item with auto-generated barcode, SKU, category, and supplier."
      },
      {
        nameAr: "استيراد ملف إكسل",
        nameEn: "Import Excel",
        icon: "FileSpreadsheet",
        descriptionAr: "رفع ملف إكسل أو CSV يحتوي على مئات المنتجات دفعة واحدة لتوفير وقت الإدخال اليدوي.",
        descriptionEn: "Bulk upload products using an Excel/CSV template to save manual data entry time."
      },
      {
        nameAr: "تصدير إلى إكسل",
        nameEn: "Export to Excel",
        icon: "Download",
        descriptionAr: "تحميل تقرير شامل لجميع المنتجات بأسعارها وكمياتها المتاحة في ملف إكسل منسق.",
        descriptionEn: "Download complete product catalog with prices, SKUs, and stock levels as formatted Excel."
      },
      {
        nameAr: "عرض الأرقام التسلسلية (أيقونة العين)",
        nameEn: "View Serials (Eye Icon)",
        icon: "Eye",
        descriptionAr: "عرض كل الأجهزة الفردية المسجلة تحت هذا الصنف، وأرقامها التسلسلية، ومن المستلم الحالي لها.",
        descriptionEn: "Inspect every physical serialized item under this product, its serial, QR, and current holder."
      },
      {
        nameAr: "تعديل الصنف (أيقونة القلم)",
        nameEn: "Edit Product (Pencil Icon)",
        icon: "Pencil",
        descriptionAr: "تعديل بيانات المنتج مثل الأسعار، اسم الصنف، الفئة، أو حد الأمان.",
        descriptionEn: "Update item details including purchase/unit price, name, category, or reorder threshold."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "إنشاء بطاقة صنف جديدة",
        titleEn: "Create New Product Card",
        detailAr: "اضغط على زر '+ إضافة منتج جديد'، أدخل الاسم، اختر الفئة والمورد ونوع المخزون (شراء أو أصل).",
        detailEn: "Click '+ Add New Product', enter name, select category, supplier, and inventory type (Purchase/Asset)."
      },
      {
        stepNumber: 2,
        titleAr: "ضبط حد الأمان (Min Stock)",
        titleEn: "Set Safety Threshold",
        detailAr: "حدد رقماً في 'حد الأمان' ليقوم النظام بتنبيهك تلقائياً إذا انخفضت الكمية في المستودع عنه.",
        detailEn: "Define 'Min Threshold' so the system triggers an alert whenever available stock drops below it."
      },
      {
        stepNumber: 3,
        titleAr: "حفظ ومسح الباركود",
        titleEn: "Save & Generate Barcode",
        detailAr: "احفظ المنتج. يمكنك استخدام الباركود المولد مباشرة لطباعة الملصقات أو مسحه بجهاز القارئ.",
        detailEn: "Save the product. The generated barcode can be printed as a label or scanned with barcode guns."
      }
    ],
    rules: [
      {
        titleAr: "الفرق بين الشراء والأصل الثابت",
        titleEn: "Purchase vs Fixed Asset",
        tipAr: "أصناف 'شراء' مخصصة للمستهلكات وقطع الغيار، بينما 'أصل ثابت' للأجهزة المعمرة كاللابتوبات والسيرفرات لتتبع إهلاكها.",
        tipEn: "'Purchase' is for consumables and parts, while 'Asset' is for durable equipment requiring custody and depreciation."
      }
    ]
  },

  "/ohda/warehouse-bins": {
    path: "/ohda/warehouse-bins",
    titleAr: "أماكن وأرفف التخزين (Warehouse Bins)",
    titleEn: "Warehouse Bins & Storage Locations",
    icon: "Layers",
    summaryAr: "إدارة الخريطة المكانية للمستودع. تقسيم المستودع إلى ممرات وأرفف وخانات مكودة (مثل A-01-R02) لمعرفة مكان كل جهاز عهدة بدقة وسهولة الوصول إليه.",
    summaryEn: "Manage physical warehouse layout. Divide spaces into coded zones, aisles, and bins (e.g. A-01-R02) for accurate put-away and picking.",
    whoUsesAr: "أمين المستودع، مدراء المستودعات، وفنيو الجرد.",
    whoUsesEn: "Warehouse Keepers, Inventory Supervisors, and Audit Clerks.",
    actions: [
      {
        nameAr: "إضافة رف / خانة (+)",
        nameEn: "Add New Bin (+)",
        icon: "Plus",
        descriptionAr: "تعريف رف تخزين جديد مع تحديد كوده (A-01-B03)، اسمه، المستودع التابع له، وسعته الاستيعابية.",
        descriptionEn: "Define a new storage bin with unique code, name, department/warehouse, and capacity."
      },
      {
        nameAr: "معاينة محتويات الرف (أيقونة الصندوق)",
        nameEn: "Inspect Bin Items (Box Icon)",
        icon: "Box",
        descriptionAr: "فتح نافذة منبثقة تعرض جميع الأجهزة المحفوظة داخل هذا الرف بأرقامها التسلسلية وحالتها.",
        descriptionEn: "Opens detailed modal displaying all items currently stored inside this bin with serials and statuses."
      },
      {
        nameAr: "فلترة حسب المستودع / القسم",
        nameEn: "Filter by Department/Warehouse",
        icon: "Filter",
        descriptionAr: "حصر الأرفف المعروضة لمستودع أو مبنى محدد لتسهيل الجرد والمتابعة.",
        descriptionEn: "Filter bins by specific warehouse/department for focused stocktaking."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تكويد الرفوف",
        titleEn: "Code Your Bins",
        detailAr: "قم بإنشاء الأرفف بتنسيق موحد، مثل (الممر-العمود-الرف: A-01-R01) لتسهيل القراءة.",
        detailEn: "Create bins with standard syntax like Aisle-Column-Shelf (e.g. A-01-R01) for clear physical labeling."
      },
      {
        stepNumber: 2,
        titleAr: "التوجيه عند التوريد (Put-away)",
        titleEn: "Put-away during Entry",
        detailAr: "عند إنشاء طلب توريد، حدد الرف المخصص لكل صنف ليتم توجيه أمين المستودع بوضعه هناك.",
        detailEn: "When creating an entry request, select the target bin so staff place it in the correct location."
      },
      {
        stepNumber: 3,
        titleAr: "السحب عند الصرف (Picking)",
        titleEn: "Picking during Exit",
        detailAr: "عند استلام أمر صرف، سيظهر كود الرف فوراً في تفاصيل الصنف لتتوجه للرف وتسحب الجهاز مباشرة.",
        detailEn: "When executing an exit request, the bin code is displayed so pickers retrieve the item immediately."
      }
    ],
    rules: [
      {
        titleAr: "منع تكدس الأرفف",
        titleEn: "Capacity Control",
        tipAr: "يراعي النظام سعة الرف المحددة (`Capacity`) حتى لا يتم تخزين أجهزة تفوق طاقة الرف الاستيعابية.",
        tipEn: "Bin capacity limits prevent overfilling shelves beyond physical limits."
      }
    ]
  },

  "/ohda/inventory": {
    path: "/ohda/inventory",
    titleAr: "رصيد المخزون ومستويات الأمان",
    titleEn: "Inventory Levels & Safety Stock",
    icon: "Boxes",
    summaryAr: "جدول الرصيد الحقيقي للمستودع. يعرض الكمية الفعلية المتاحة لكل صنف، الكميات المحجوزة، ومقارنتها بحد الأمان ومستويات إعادة الطلب.",
    summaryEn: "Real-time stock balance sheet. View available quantities, reserved quantities, and threshold comparisons.",
    whoUsesAr: "أمناء المستودعات، مسؤولو الجرد، ومدراء العمليات.",
    whoUsesEn: "Warehouse Staff, Audit Officers, and Operations Managers.",
    actions: [
      {
        nameAr: "البحث والفلترة السريعة",
        nameEn: "Search & Filter",
        icon: "Search",
        descriptionAr: "البحث بالاسم أو الباركود أو الـ SKU وفلترة الأصناف حسب الفئة أو حالة الرصيد (منخفض / متوفر).",
        descriptionEn: "Filter by barcode, SKU, category, or stock condition (low vs healthy)."
      },
      {
        nameAr: "تسوية الرصيد (الجرد الفعلي)",
        nameEn: "Stock Adjustment",
        icon: "Sliders",
        descriptionAr: "تعديل الكمية المسجلة بعد الجرد الميداني مع إلزامية تسجيل سبب التسوية (عجز، زيادة، تالف).",
        descriptionEn: "Adjust recorded quantity after physical count with mandatory reason documentation."
      },
      {
        nameAr: "تصدير كشف الجرد",
        nameEn: "Export Inventory Sheet",
        icon: "FileSpreadsheet",
        descriptionAr: "استخراج تقرير إكسل مطبوع لجرد المخازن الفعلي.",
        descriptionEn: "Export formatted Excel stock count sheet for warehouse physical audit."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "مراجعة شارات الرصيد",
        titleEn: "Check Status Badges",
        detailAr: "الأصناف ذات الرصيد المنخفض تظهر بشارة حمراء تحذيرية تستوجب طلب التوريد.",
        detailEn: "Items below reorder thresholds display red warning badges indicating urgency."
      },
      {
        stepNumber: 2,
        titleAr: "التسوية بعد الجرد",
        titleEn: "Reconciliation",
        detailAr: "في حال وجود فرق بين الجرد الفعلي والمسجل، استخدم زر التسوية لتحديث الرصيد وتوثيق الملاحظات.",
        detailEn: "If physical count differs from system balance, use adjustment action with audit note."
      }
    ],
    rules: [
      {
        titleAr: "قاعدة سلامة المخزون",
        titleEn: "Stock Integrity",
        tipAr: "جميع التغييرات الطبيعية في الرصيد يجب أن تتم عبر طلبات التوريد أو الصرف الرسمية لضمان التسجيل في البوصلة.",
        tipEn: "Standard balance modifications must go through formal entry/exit requests for audit tracking."
      }
    ]
  },

  "/ohda/entry-requests": {
    path: "/ohda/entry-requests",
    titleAr: "طلبات إدخال وتوريد المخزون",
    titleEn: "Stock Inbound & Receiving Requests",
    icon: "ArrowDownLeft",
    summaryAr: "دورة استلام وتوريد الأصناف والأجهزة للمستودع. تشمل التوريد الجديد بفواتير، إرجاع الأجهزة من الأقسام، فحص حالة الصنف (سليم/تالف/صيانة)، وتوليد السيريالات.",
    summaryEn: "Receiving and inbound workflow. Handles PO invoice receipts, returns from departments, item condition tags, and serial number generation.",
    whoUsesAr: "أمين المستودع (مُنشئ الطلب)، مدير المستودع (المراجع)، والمشرف العام (المعتمد).",
    whoUsesEn: "Receiving Clerks (Creators), Warehouse Managers (Reviewers), and Supervisors (Approvers).",
    actions: [
      {
        nameAr: "طلب إدخال جديد (+)",
        nameEn: "New Entry Request (+)",
        icon: "Plus",
        descriptionAr: "فتح شاشة التوريد لإدخال الأصناف، الفاتورة، تحديد جهة التوريد أو اختيار أجهزة العهدة المرجعة.",
        descriptionEn: "Opens receiving form to record invoice, vendor/department source, and return serials."
      },
      {
        nameAr: "القارئ اليدوي والكاميرا",
        nameEn: "Barcode Reader & Camera",
        icon: "QrCode",
        descriptionAr: "مسح باركود الأصناف لإضافتها تلقائياً لجدول التوريد وزيادة الكمية بضغطة واحدة.",
        descriptionEn: "Scan barcodes via hardware reader or camera to add items instantly to the receiving table."
      },
      {
        nameAr: "تحديد حالة الصنف (اختياري)",
        nameEn: "Set Product State (Optional)",
        icon: "Activity",
        descriptionAr: "تحديد ما إذا كان الجهاز المورد به مشكلة (تالف، صيانة، رجيع) لتسجيله بحالته المناسبة في المخزون.",
        descriptionEn: "Tag item condition (Damaged, Maintenance, Return) so the item is properly flagged upon receipt."
      },
      {
        nameAr: "تحديد رف التخزين (Bin)",
        nameEn: "Assign Storage Bin",
        icon: "Layers",
        descriptionAr: "اختيار الرف الذي سيتم وضع الأجهزة فيه بالمستودع مباشرة.",
        descriptionEn: "Select target warehouse bin/shelf for direct put-away guidance."
      },
      {
        nameAr: "اعتماد المشرف والمدير",
        nameEn: "Review & Approval",
        icon: "CheckCircle",
        descriptionAr: "دورة اعتماد الطلب (الموافقة المبدئية ثم الاعتماد النهائي وتوليد السيريالات وإدخال الرصيد).",
        descriptionEn: "Sequential approval workflow (Manager review -> Supervisor final approve & serial generation)."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "إنشاء طلب التوريد",
        titleEn: "Create Entry Voucher",
        detailAr: "اختر جهة التوريد، رقم الفاتورة، ثم أضف الأصناف إما بالمسح الضوئي أو الاختيار اليدوي من الكتالوج.",
        detailEn: "Specify source/department, invoice number, and add products manually or via barcode scanning."
      },
      {
        stepNumber: 2,
        titleAr: "تحديد الأرفف والحالات",
        titleEn: "Designate Bins & States",
        detailAr: "حدد الرف المراد تخزين كل صنف فيه، وحدد حالته إذا كان مسترجعاً وبه عطل.",
        detailEn: "Assign bins for storage and mark defective states if items are returned with problems."
      },
      {
        stepNumber: 3,
        titleAr: "الاعتماد النهائي",
        titleEn: "Supervisor Sign-off",
        detailAr: "يقوم المشرف باعتماد الطلب؛ عندئذ يقوم النظام تلقائياً بتوليد الأرقام التسلسلية، زيادة الرصيد، وتسجيل حركة بوصلة رسمية.",
        detailEn: "Upon supervisor approval, serial numbers are generated, stock increments, and compass logs are recorded."
      }
    ],
    rules: [
      {
        titleAr: "عدم زيادة الرصيد قبل الاعتماد",
        titleEn: "Approval Gate",
        tipAr: "لا يتم زيادة أي كمية في رصيد المستودع الفعلي إلا بعد الاعتماد النهائي للمشرف لحماية البيانات من التلاعب.",
        tipEn: "Inventory balances remain unchanged until the supervisor gives final approval."
      }
    ]
  },

  "/ohda/exit-requests": {
    path: "/ohda/exit-requests",
    titleAr: "طلبات صرف العهد والمخزون",
    titleEn: "Custody Issuance & Exit Requests",
    icon: "ArrowUpRight",
    summaryAr: "دورة صرف الأجهزة والمواد من المستودع وتحويلها إلى عهدة موظف أو قسم. تشمل التحقق من توفر الرصيد، حجز السيريالات، واعتماد المسؤولين.",
    summaryEn: "Stock issue and employee custody assignment workflow. Verifies available stock, reserves serials, and enforces approval chains.",
    whoUsesAr: "الموظفون (طلب عهدة)، مدير القسم (الموافقة)، ومشرف المستودع (الصرف النهائي).",
    whoUsesEn: "Employees (Custody Requesters), Department Heads (Endorsers), and Warehouse Supervisors (Dispatchers).",
    actions: [
      {
        nameAr: "طلب صرف عهدة (+)",
        nameEn: "New Exit Request (+)",
        icon: "Plus",
        descriptionAr: "تقديم طلب لصرف أجهزة أو مستهلكات مع تحديد اسم المستلم، القسم، والغرض من الصرف.",
        descriptionEn: "Submit issuance request specifying recipient person, destination department, and business purpose."
      },
      {
        nameAr: "فحص موقع الرف (Bin)",
        nameEn: "View Bin Location",
        icon: "MapPin",
        descriptionAr: "إظهار كود الرف الذي يحتوي على الجهاز لتسهيل سحب الجهاز من المستودع دون إضاعة وقت.",
        descriptionEn: "Displays the bin code where items reside so warehouse staff pick items without delay."
      },
      {
        nameAr: "اعتماد الصرف وتعيين السيريالات",
        nameEn: "Approve & Assign Serials",
        icon: "CheckCheck",
        descriptionAr: "عند موافقة المشرف، يتم ربط الأرقام التسلسلية الدقيقة بالموظف المستلم وخصمها من المستودع.",
        descriptionEn: "Supervisor approval assigns specific physical serials to the recipient and decrements stock."
      },
      {
        nameAr: "رفض الطلب مع ذكر السبب",
        nameEn: "Reject Request with Reason",
        icon: "XCircle",
        descriptionAr: "رفض الطلب في حال عدم توفر الرصيد أو عدم مطابقة الغرض مع إرسال إشعار فوري لمقدم الطلب.",
        descriptionEn: "Reject invalid requests with mandatory explanation; sends instant notification to requester."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تقديم طلب الصرف",
        titleEn: "Submit Exit Requisition",
        detailAr: "يقوم الموظف باختيار الأصناف المطلوبة والكميات وتحديد الغرض واسم المستلم.",
        detailEn: "Requester picks products, requested quantities, recipient name, and organizational purpose."
      },
      {
        stepNumber: 2,
        titleAr: "التحقق من الرصيد والرفوف",
        titleEn: "Stock & Location Verification",
        detailAr: "يفحص النظام توفر الرصيد، ويظهر شارة الرف (مثل A-01-R01) لمسؤول المستودع.",
        detailEn: "The system validates stock availability and highlights the source bin to the warehouse picker."
      },
      {
        stepNumber: 3,
        titleAr: "تسليم العهدة",
        titleEn: "Handover & Dispatch",
        detailAr: "بعد الاعتماد النهائي، يتحول الجهاز في البوصلة إلى حالة 'منصرف كعهدة' ويُسجل باسم المستلم.",
        detailEn: "Upon approval, the item state becomes 'Exited (In Custody)' linked to the recipient in the Compass."
      }
    ],
    rules: [
      {
        titleAr: "منع الرصيد السالب",
        titleEn: "Strict Negative Stock Block",
        tipAr: "يمنع النظام تماماً صرف أي كمية تفوق الرصيد الفعلي المتوفر بالمستودع.",
        tipEn: "The system strictly prevents approvals if requested quantities exceed available in-stock balances."
      }
    ]
  },

  "/ohda/compass": {
    path: "/ohda/compass",
    titleAr: "بوصلة الحركة وتتبع العهد (Compass Audit Log)",
    titleEn: "Compass Movement & Custody Tracking",
    icon: "Compass",
    summaryAr: "السجل الرقمي الدقيق لجميع حركات المنظومة. يمثل الشفافية والمساءلة؛ حيث يسجل كل حركة دخول أو خروج أو صيانة لأي جهاز بسيرياله، مستلمه، ومكانه.",
    summaryEn: "Master digital audit trail. Records every entry, exit, transfer, and maintenance event per serial number.",
    whoUsesAr: "المراجعون الداخليون، إدارة الأصول، مدراء المستودعات، والمدققون.",
    whoUsesEn: "Internal Auditors, Asset Managers, Warehouse Chiefs, and Compliance Teams.",
    actions: [
      {
        nameAr: "البحث برقم السيريال أو الباركود",
        nameEn: "Search by Serial / Barcode",
        icon: "Search",
        descriptionAr: "الوصول لتاريخ حياة أي جهاز من أول يوم دخل فيه للمستودع حتى موقعه الحالي.",
        descriptionEn: "Trace full lifecycle history of any device from initial receiving to its current holder."
      },
      {
        nameAr: "الفلترة حسب نوع الحركة والقسم",
        nameEn: "Filter by Movement Type",
        icon: "Filter",
        descriptionAr: "تصفية الحركات (إدخال توريد، صرف عهدة، إرجاع، صيانة) حسب القسم أو الفترة الزمنية.",
        descriptionEn: "Filter movements by type (Entry, Exit, Return, Maintenance) and department."
      },
      {
        nameAr: "تصدير سجل الحركات",
        nameEn: "Export Audit Log",
        icon: "Download",
        descriptionAr: "تحميل تقرير الحركات الرسمية في ملف إكسل لتقديمه للجان التفتيش والجرد.",
        descriptionEn: "Download official movement reports as Excel for audits and committee reviews."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "تتبع جهاز معين",
        titleEn: "Locate Specific Asset",
        detailAr: "أدخل الرقم التسلسلي في حقل البحث لتعرف فوراً: مع من هذا الجهاز الآن؟ وفي أي قسم أو رف؟",
        detailEn: "Enter the serial number in the search bar to see instantly who holds the device and its current place."
      },
      {
        stepNumber: 2,
        titleAr: "استعراض مسار التدقيق",
        titleEn: "Audit Verification",
        detailAr: "اضغط على الحركة لمشاهدة رقم السند المرتبط بها وتاريخ الحركة واسم المستخدم الذي نفذها.",
        detailEn: "Click on any log record to view linked request ID, execution timestamp, and operator identity."
      }
    ],
    rules: [
      {
        titleAr: "سجل غير قابل للتعديل",
        titleEn: "Immutable Ledger",
        tipAr: "سجلات البوصلة تُنشأ تلقائياً ولا يمكن تعديلها أو حذفها يدويّاً لضمان النزاهة والرقابة المؤسسية.",
        tipEn: "Compass logs are system-generated and immutable to ensure legal compliance and audit integrity."
      }
    ]
  },

  "/ohda/scan": {
    path: "/ohda/scan",
    titleAr: "ماسح الباركود والقارئ السريع",
    titleEn: "Quick Barcode & QR Scanner",
    icon: "QrCode",
    summaryAr: "أداة الاستعلام السريع الميداني. تتيح مسح أي باركود أو QR عبر كاميرا الجهاز أو القارئ الليزري للاستعلام اللحظي عن الجهاز وموقعه وحالته.",
    summaryEn: "Field query tool. Scan physical barcode/QR labels using mobile camera or laser gun for instant asset lookup.",
    whoUsesAr: "أمناء المخازن، لجان الجرد الميداني، وفنيو الصيانة.",
    whoUsesEn: "Warehouse Clerks, Field Audit Teams, and IT Technicians.",
    actions: [
      {
        nameAr: "المسح عبر الكاميرا",
        nameEn: "Camera Scanner",
        icon: "Camera",
        descriptionAr: "تشغيل كاميرا الهاتف أو الكمبيوتر لقراءة كود الـ QR أو الباركود تلقائياً.",
        descriptionEn: "Activates camera to scan device barcodes and QR codes automatically."
      },
      {
        nameAr: "القارئ اليدوي (Barcode Gun)",
        nameEn: "Hardware Barcode Reader",
        icon: "Barcode",
        descriptionAr: "إدخال مباشر عبر أجهزة المسح الليزرية بمجرد توجيه القارئ على ملصق الجهاز.",
        descriptionEn: "Direct fast input from USB/Bluetooth handheld barcode guns."
      },
      {
        nameAr: "بطاقة تفاصيل الجهاز الممسوح",
        nameEn: "Scanned Asset Summary Card",
        icon: "FileText",
        descriptionAr: "عرض فوري لاسم الصنف، السيريال، المستلم، مكان الجهاز، والرف المخزن به.",
        descriptionEn: "Instant display of product name, serial, holder, location, and assigned warehouse bin."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "توجيه القارئ",
        titleEn: "Point Scanner",
        detailAr: "شغل الكاميرا أو وجّه جهاز المسح اليدوي نحو ملصق الباركود على الجهاز.",
        detailEn: "Turn on camera or point handheld scanner at the asset label."
      },
      {
        stepNumber: 2,
        titleAr: "معاينة النتيجة",
        titleEn: "View Details",
        detailAr: "ستظهر بطاقة منبثقة تحمل كافة تفاصيل الجهاز وحالته وموقعه في المستودع.",
        detailEn: "A pop-up card appears immediately with asset information, status, and bin location."
      }
    ],
    rules: [
      {
        titleAr: "يدعم الباركود والسيريال",
        titleEn: "Dual Mode Lookup",
        tipAr: "يمكنك مسح باركود الصنف العام، أو مسح الرقم التسلسلي الخاص بكل جهاز على حدة.",
        tipEn: "Supports scanning both catalog master barcodes and individual serial numbers."
      }
    ]
  },

  "/ohda/departments": {
    path: "/ohda/departments",
    titleAr: "إدارة الأقسام والمستودعات والمواقع",
    titleEn: "Departments & Warehouse Locations",
    icon: "Building",
    summaryAr: "الهيكل التنظيمي للمؤسسة. تعريف الفروع، الأقسام، والمستودعات التي يتم صرف العهد إليها أو تخزين الأصناف بها.",
    summaryEn: "Organizational layout. Define branches, operational departments, and warehouse buildings.",
    whoUsesAr: "مدير النظام ومدراء الإدارات.",
    whoUsesEn: "System Administrators and Department Heads.",
    actions: [
      {
        nameAr: "إضافة قسم / مستودع (+)",
        nameEn: "Add Department (+)",
        icon: "Plus",
        descriptionAr: "تسجيل قسم أو موقع جديد مع إضافة وصف تفصيلي وتعيين المدير المسؤول.",
        descriptionEn: "Register new department or site with description and assigned head."
      },
      {
        nameAr: "تعديل وحذف الأقسام",
        nameEn: "Edit & Delete",
        icon: "Pencil",
        descriptionAr: "تحديث مسميات الأقسام وإدارتها.",
        descriptionEn: "Update department names and maintain organizational structure."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "إنشاء المستودعات والأقسام",
        titleEn: "Setup Locations",
        detailAr: "عرّف المستودعات الرئيسية (مثل المستودع المركزي) والأقسام المستفيدة (مثل العمليات، المالية).",
        detailEn: "Define warehouse sites (e.g. Central Warehouse) and consuming departments (e.g. Operations, Finance)."
      }
    ],
    rules: [
      {
        titleAr: "ربط الأرفف بالقسم",
        titleEn: "Bin Association",
        tipAr: "جميع أرفف التخزين (`Warehouse Bins`) ترتبط بقسم أو مستودع معين لتحديد مكانها بدقة.",
        tipEn: "All warehouse bins belong to a specific department/warehouse facility."
      }
    ]
  },

  "/ohda/users": {
    path: "/ohda/users",
    titleAr: "إدارة المستخدمين والأدوار والصلاحيات",
    titleEn: "User Accounts & Permission Groups",
    icon: "Users",
    summaryAr: "إدارة حسابات منسوبي النظام، تحديد الرتب والأدوار (مدير، مشرف، موظف)، وتعيين مجموعات الصلاحيات والصفحات المسموح بزيارتها.",
    summaryEn: "Staff identity management. Configure roles (Admin, Manager, Supervisor, Employee) and page-level security permissions.",
    whoUsesAr: "مدير النظام (System Administrator).",
    whoUsesEn: "System Administrator.",
    actions: [
      {
        nameAr: "إضافة مستخدم جديد (+)",
        nameEn: "Add New User (+)",
        icon: "UserPlus",
        descriptionAr: "تسجيل موظف جديد بالرقم العسكري/الوظيفي، اسم المستخدم، البريد، والدور الوظيفي.",
        descriptionEn: "Create new user account with employee ID, username, email, and security role."
      },
      {
        nameAr: "تعيين مجموعة الصلاحيات",
        nameEn: "Assign Security Group",
        icon: "Shield",
        descriptionAr: "ربط المستخدم بمجموعة إدارية تحدد الصفحات والعمليات المتاحة له في الواجهة.",
        descriptionEn: "Attach user to permission groups to control visible routes and permitted actions."
      },
      {
        nameAr: "تعديل كلمة المرور أو تعطيل الحساب",
        nameEn: "Reset Password & Deactivate",
        icon: "Key",
        descriptionAr: "إعادة تعيين كلمة المرور أو إيقاف وصول المستخدم للنظام في حال نقل الموظف.",
        descriptionEn: "Reset credentials or toggle active status upon employee reassignment."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "اختيار الدور الصحيح",
        titleEn: "Select Appropriate Role",
        detailAr: "اختر 'Employee' لمقدمي الطلبات، 'Supervisor' لأمناء المخازن، 'Manager' لمدراء الأقسام، و 'Admin' لمسؤول النظام.",
        detailEn: "Assign 'Employee' for requesters, 'Supervisor' for warehouse staff, 'Manager' for dept heads, and 'Admin' for administrators."
      }
    ],
    rules: [
      {
        titleAr: "حماية المسارات",
        titleEn: "Route Protection",
        tipAr: "المستخدم لا يستطيع مشاهدة أو فتح الصفحات التي لم يتم منح مجموعته صلاحية الوصول إليها.",
        tipEn: "Users cannot see or access pages not explicitly granted in their permission group."
      }
    ]
  },

  "/ohda/product-states": {
    path: "/ohda/product-states",
    titleAr: "حالات المنتجات والأجهزة (Product States)",
    titleEn: "Product Conditions & States",
    icon: "Activity",
    summaryAr: "تعريف الحالات الفنية للأجهزة (مثل: سليم، تالف، تحت الصيانة، رجيع). تستخدم هذه الحالات عند توريد الأصناف أو إرجاعها من الأقسام وتؤثر في حركة البوصلة.",
    summaryEn: "Manage asset operational conditions (Intact, Damaged, In Maintenance, Returned) for lifecycle tracking.",
    whoUsesAr: "مدراء المستودعات وفنيو الصيانة.",
    whoUsesEn: "Warehouse Managers and Maintenance Supervisors.",
    actions: [
      {
        nameAr: "إضافة حالة جديدة (+)",
        nameEn: "Add State (+)",
        icon: "Plus",
        descriptionAr: "إضافة مسمى حالة جديدة (مثل: مسترجع منتهي الصلاحية) وتعيين كود خاص بها.",
        descriptionEn: "Add new condition status with custom label and uppercase code."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "استخدام الحالات في التوريد",
        titleEn: "Usage in Receiving",
        detailAr: "الحالات المعرفة هنا تظهر كخيارات منسدلة في شاشة إدخال المخزون لتحديد حالة الجهاز بدقة.",
        detailEn: "Conditions defined here appear as options when receiving returned or new stock."
      }
    ],
    rules: [
      {
        titleAr: "الأثر المالي والتشغيلي",
        titleEn: "Operational Impact",
        tipAr: "الأجهزة المسجلة كـ 'تالف' أو 'صيانة' تُعزل تلقائياً في المخزون ولا تظهر ضمن الأجهزة القابلة للصرف.",
        tipEn: "Items tagged as Damaged or In Maintenance are quarantined and excluded from available picking stock."
      }
    ]
  },

  "/ohda/approval-config": {
    path: "/ohda/approval-config",
    titleAr: "إعدادات سلاسل الموافقات (Approval Matrix)",
    titleEn: "Approval Workflow Matrix",
    icon: "Settings",
    summaryAr: "لوحة التحكم في مسارات الاعتماد الإداري. تحديد أي المجموعات تراجع (Reviewer) وأي المجموعات تعتمد نهائياً (Approver) لطلبات التوريد والصرف.",
    summaryEn: "Configure multi-level approval hierarchies for inbound entry and outbound exit requests.",
    whoUsesAr: "مدير النظام (Admin).",
    whoUsesEn: "System Administrator.",
    actions: [
      {
        nameAr: "تفعيل / تعطيل خطوة الموافقة",
        nameEn: "Toggle Approval Step",
        icon: "Sliders",
        descriptionAr: "تحديد هل يتطلب طلب الصرف أو الإدخال موافقة مدير القسم فقط أم موافقة مشرف المستودع أيضاً.",
        descriptionEn: "Configure whether requests require single or dual-tier manager/supervisor approvals."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "ضبط مصفوفة الصلاحيات",
        titleEn: "Configure Matrix",
        detailAr: "اختر نوع الطلب (صرف أو توريد) وحدد دور كل مجموعة إدارية لضمان سير الموافقات بسلاسة.",
        detailEn: "Select request type (Exit or Entry) and assign Reviewer/Approver roles per group."
      }
    ],
    rules: [
      {
        titleAr: "تسلسل الموافقات",
        titleEn: "Approval Sequence",
        tipAr: "لا يمكن اعتماد الطلب من المشرف النهائي إلا بعد حصوله على مراجعة المدير المبدئية عند تفعيل المرحلتين.",
        tipEn: "Dual-tier configurations enforce manager review before final supervisor sign-off is permitted."
      }
    ]
  },

  "/ohda/suppliers": {
    path: "/ohda/suppliers",
    titleAr: "إدارة الموردين وشركات التوريد",
    titleEn: "Supplier & Vendor Registry",
    icon: "Truck",
    summaryAr: "سجل بيانات الشركات والجهات الموردة. يتيح ربط المنتجات بالموردين لحساب التكاليف وتوليد أوامر الشراء ومتابعة مواعيد التوريد.",
    summaryEn: "Vendor directory. Link products to suppliers for costing, purchase order management, and lead-time tracking.",
    whoUsesAr: "مسؤولو المشتريات ومدراء المخازن.",
    whoUsesEn: "Procurement Officers and Inventory Managers.",
    actions: [
      {
        nameAr: "إضافة مورد جديد (+)",
        nameEn: "Add Supplier (+)",
        icon: "Plus",
        descriptionAr: "تسجيل اسم الشركة، مسؤول الاتصال، رقم الهاتف، والبريد الإلكتروني للمورد.",
        descriptionEn: "Register vendor company name, contact person, phone number, and email."
      },
      {
        nameAr: "تعديل وحذف الموردين",
        nameEn: "Edit & Delete",
        icon: "Pencil",
        descriptionAr: "تحديث بيانات التواصل الخاصة بالمورد.",
        descriptionEn: "Maintain accurate contact and commercial details for suppliers."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "ربط المورد بالمنتج",
        titleEn: "Link to Products",
        detailAr: "بعد تسجيل المورد، يمكنك اختياره عند تعريف الصنف ليتم احتسابه كمورد معتمد للصنف.",
        detailEn: "After adding a supplier, select them in product cards as the authorized vendor."
      }
    ],
    rules: [
      {
        titleAr: "الاستفادة في أوامر الشراء",
        titleEn: "PO Integration",
        tipAr: "بيانات الموردين المسجلة هنا تُستخدم تلقائياً عند إنشاء مسودات أوامر الشراء للنواقص.",
        tipEn: "Supplier records are auto-linked to generate replenishment purchase orders when stock runs low."
      }
    ]
  },

  "/ohda/categories": {
    path: "/ohda/categories",
    titleAr: "تصنيفات وفئات الأصناف (Categories)",
    titleEn: "Product Category Tree",
    icon: "Tags",
    summaryAr: "الهيكل التصنيفي للكتالوج. تصنيف الأصناف (حواسب آلية، أجهزة شبكات، أجهزة لاسلكية، طابعات، إلخ) لتسهيل الفلترة وإعداد التقارير المالية والإحصائية.",
    summaryEn: "Catalog classification tree. Organize items into logical categories for reporting and search filtering.",
    whoUsesAr: "مدراء المخازن ومسؤولو الكتالوج.",
    whoUsesEn: "Inventory Managers and Catalog Administrators.",
    actions: [
      {
        nameAr: "إضافة تصنيف جديد (+)",
        nameEn: "Add Category (+)",
        icon: "Plus",
        descriptionAr: "إضافة فئة جديدة مع وصف لمجال استخدامها.",
        descriptionEn: "Create a new category name and descriptive notes."
      }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: "بناء شجرة التصنيفات",
        titleEn: "Build Taxonomy",
        detailAr: "أنشئ تصنيفات واضحة تتماشى مع طبيعة معدات وأجهزة مؤسستك.",
        detailEn: "Establish clear taxonomy reflecting your organization's equipment types."
      }
    ],
    rules: [
      {
        titleAr: "حماية المنتجات المرتبطة",
        titleEn: "Referential Safety",
        tipAr: "لا يمكن حذف تصنيف يحتوي على منتجات نشطة في النظام حتى يتم نقل المنتجات لتصنيف آخر.",
        tipEn: "Categories with assigned active products cannot be deleted until items are reassigned."
      }
    ]
  }
};
