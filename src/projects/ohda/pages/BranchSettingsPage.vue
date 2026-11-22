<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Onboarding First-Time Welcome Banner -->
    <div
      v-if="isOnboarding || showOnboardingBanner"
      class="p-5 rounded-2xl bg-gradient-to-r from-brand-accent/20 via-brand-accent/10 to-transparent border border-brand-accent/30 shadow-sm flex items-start justify-between gap-4 transition-all"
    >
      <div class="flex items-start gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-brand-accent text-brand-dark flex items-center justify-center shrink-0 shadow-lg shadow-brand-accent/20">
          <Sparkles class="w-6 h-6 animate-pulse" />
        </div>
        <div class="space-y-1">
          <h2 class="text-base font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <span>🎉 مرحباً بك في نظام إدارة ورشة الصيانة والعناية بالسيارات!</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
              الخطوة الأولى: إعداد الهوية
            </span>
          </h2>
          <p class="text-xs text-brand-gray dark:text-slate-300 leading-relaxed max-w-3xl">
            تم تعيين كلمة المرور بنجاح. يرجى الآن تخصيص هوية ورشتك (اسم المركز، الشعار، ألوان النظام المفضلة، وبيانات الفواتير) لتنعكس فوراً على لوحة التحكم وشريط النظام وكافة فواتير وأوامر الشغل المطبوعة.
          </p>
        </div>
      </div>
      <button
        @click="showOnboardingBanner = false"
        class="text-brand-gray hover:text-brand-dark dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        title="إغلاق التنبيه"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Header & Action Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent shadow-sm">
          <Sliders class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <span>إعدادات وهوية ورشة العمل</span>
            <span v-if="savedBranchName" class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-accent/15 text-brand-accent border border-brand-accent/30">
              {{ savedBranchName }}
            </span>
          </h1>
          <p class="text-xs text-brand-gray dark:text-slate-400 mt-0.5">
            تخصيص اسم المركز، الشعار الرسمي، سمة وألوان النظام، بيانات التواصل، وترويسة الفواتير
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="resetToDefaults"
          class="px-4 py-2.5 rounded-xl border border-brand-gray/20 text-xs font-bold text-brand-gray hover:text-brand-dark dark:hover:text-white hover:bg-brand-gray/5 transition-colors cursor-pointer"
        >
          استعادة الافتراضي
        </button>

        <Button
          type="button"
          @click="saveAllSettings"
          :disabled="saving"
          class="!bg-brand-accent hover:!bg-brand-accent/90 !text-brand-dark !font-bold !rounded-xl !px-5 !py-2.5 !text-xs flex items-center gap-2 shadow-md shadow-brand-accent/20 cursor-pointer"
        >
          <Check v-if="!saving" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
          <span>{{ saving ? 'جاري الحفظ...' : 'حفظ كافة الإعدادات' }}</span>
        </Button>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Identity & Logo (2 cols on large) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 1. Workshop Identity & Name -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 border-b border-brand-gray/10 pb-3">
            <Building2 class="w-5 h-5 text-brand-accent" />
            <h2 class="text-sm font-bold text-brand-dark dark:text-white">بيانات واسم المركز التجاري</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 flex items-center gap-1.5">
                  <Lock class="w-3.5 h-3.5 text-brand-gray" />
                  <span>اسم المركز / الفرع المرخص</span>
                </label>
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                  <span>ترخيص رسمي معتمد</span>
                </span>
              </div>
              <div class="relative">
                <input
                  :value="form.branchName || authStore.branchName || 'مركز الصيانة المعتمد'"
                  type="text"
                  disabled
                  readonly
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-white/10 border border-brand-gray/25 text-brand-dark dark:text-white font-bold cursor-not-allowed select-none opacity-90"
                />
              </div>
              <!-- <span class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                🔒 اسم المركز مثبت من إدارة المنصة ومرخص حصرياً لمنع إعادة بيع أو نقل النظام (لطلب تعديل الاسم التجاري يرجى مراجعة إدارة المنصة).
              </span> -->
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
                الشعار الترويجي / السلوجان (Tagline)
              </label>
              <input
                v-model="form.slogan"
                type="text"
                placeholder="مثال: دقة متناهية.. وضمان حقيقي لسيارتك"
                class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1.5">
                العملة المعتمدة
              </label>
              <select
                v-model="form.currency"
                class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans cursor-pointer"
              >
                <option value="EGP">جنيه مصري (ج.م - EGP)</option>
                <option value="SAR">ريال سعودي (ر.س - SAR)</option>
                <option value="AED">درهم إماراتي (د.إ - AED)</option>
                <option value="KWD">دينار كويتي (د.ك - KWD)</option>
                <option value="QAR">ريال قطري (ر.ق - QAR)</option>
                <option value="USD">دولار أمريكي ($ - USD)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. Logo Upload & Live Preview -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
            <div class="flex items-center gap-2.5">
              <ImageIcon class="w-5 h-5 text-brand-accent" />
              <h2 class="text-sm font-bold text-brand-dark dark:text-white">شعار الورشة الرسمي (Logo)</h2>
            </div>
            <button
              v-if="form.logoUrl"
              type="button"
              @click="removeLogo"
              class="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>إزالة الشعار</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Upload Box -->
            <div>
              <div
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                @click="triggerFileInput"
                class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                :class="isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-gray/30 hover:border-brand-accent/60 bg-brand-light/50 dark:bg-white/5'"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  class="hidden"
                  @change="handleFileSelect"
                />

                <div class="w-12 h-12 rounded-2xl bg-brand-accent/15 text-brand-accent flex items-center justify-center shadow-sm">
                  <UploadCloud class="w-6 h-6" />
                </div>

                <div class="space-y-0.5">
                  <p class="text-xs font-bold text-brand-dark dark:text-white">
                    اضغط هنا لاختيار شعار الورشة أو اسحبه وأفلته
                  </p>
                  <p class="text-[10px] text-brand-gray">
                    يدعم PNG, JPG, SVG, WebP (الحجم الموصى به: مربع أو مستطيل بدقة واضحة)
                  </p>
                </div>
              </div>
            </div>

            <!-- Live Previews -->
            <div class="space-y-3">
              <span class="text-xs font-bold text-brand-gray block">معاينة الشعار في واجهات النظام:</span>

              <!-- 1. Topbar Preview -->
              <div class="p-3 rounded-xl bg-brand-dark text-white border border-white/10 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-brand-accent flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                  <img v-if="form.logoUrl" :src="form.logoUrl" alt="شعار الورشة" class="w-full h-full object-cover" />
                  <Box v-else class="w-5 h-5 text-brand-dark" />
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate">{{ form.branchName || 'اسم المركز' }}</div>
                  <div class="text-[9px] text-brand-accent font-mono">شريط التنقل العلوي</div>
                </div>
              </div>

              <!-- 2. Invoice Header Preview -->
              <div class="p-3 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                    <img v-if="form.logoUrl" :src="form.logoUrl" alt="الشعار" class="max-w-full max-h-full object-contain p-0.5" />
                    <Wrench v-else class="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 leading-tight">{{ form.branchName || 'مركز الصيانة المعتمد' }}</div>
                    <div class="text-[9px] text-slate-500">{{ form.slogan || 'فاتورة ضريبية رسمية' }}</div>
                  </div>
                </div>
                <span class="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ترويسة الفاتورة
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. System Color Palette Switcher -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-5">
          <div class="flex items-center justify-between border-b border-brand-gray/10 pb-3">
            <div class="flex items-center gap-2.5">
              <Palette class="w-5 h-5 text-brand-accent" />
              <div>
                <h2 class="text-sm font-bold text-brand-dark dark:text-white">سمة وألوان النظام (Color Palette)</h2>
                <p class="text-[11px] text-brand-gray">اختر الطابع اللوني المفضل ليتماشى تماماً مع هوية مركزك التجاري</p>
              </div>
            </div>
            <!-- Active Color Indicator -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-gray/20 bg-brand-light dark:bg-white/5">
              <div class="w-4 h-4 rounded-full shadow-inner" :style="{ backgroundColor: form.themeColor }"></div>
              <span class="text-xs font-mono font-bold text-brand-dark dark:text-white">{{ form.themeColor }}</span>
            </div>
          </div>

          <!-- Presets Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="p in PRESET_PALETTES"
              :key="p.id"
              type="button"
              @click="selectPalette(p.color)"
              class="p-3 rounded-2xl border text-start transition-all cursor-pointer relative group flex items-start gap-3"
              :class="form.themeColor.toLowerCase() === p.color.toLowerCase() ? 'border-brand-accent bg-brand-accent/10 shadow-md ring-2 ring-brand-accent/30' : 'border-brand-gray/20 hover:border-brand-gray/40 bg-brand-light/30 dark:bg-white/5'"
            >
              <div
                class="w-8 h-8 rounded-xl shadow-md shrink-0 flex items-center justify-center text-white mt-0.5"
                :style="{ backgroundColor: p.color }"
              >
                <Check v-if="form.themeColor.toLowerCase() === p.color.toLowerCase()" class="w-4 h-4 stroke-[3]" />
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-brand-dark dark:text-white leading-tight">{{ p.nameAr }}</div>
                <div class="text-[10px] text-brand-gray truncate mt-0.5">{{ p.description }}</div>
              </div>
            </button>
          </div>

          <!-- Custom Color Picker Row -->
          <div class="p-4 rounded-2xl bg-brand-light/50 dark:bg-white/5 border border-brand-gray/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="relative w-10 h-10 rounded-xl overflow-hidden shadow-md border border-white/20 shrink-0">
                <input
                  v-model="form.themeColor"
                  type="color"
                  @input="handleColorPickerInput"
                  class="absolute -top-4 -left-4 w-20 h-20 cursor-pointer border-0"
                />
              </div>
              <div>
                <span class="text-xs font-bold text-brand-dark dark:text-white block">اختيار لون مخصص (Custom Hex)</span>
                <span class="text-[10px] text-brand-gray block">إذا كان لمركزك كود لوني محدد من وكالتك، يمكنك إدخاله هنا مباشرة</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-brand-gray">كود اللون:</span>
              <input
                v-model="form.themeColor"
                type="text"
                maxlength="7"
                @input="handleColorPickerInput"
                class="w-24 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-white/10 border border-brand-gray/30 text-brand-dark dark:text-white text-center focus:outline-none focus:border-brand-accent"
              />
              <button
                type="button"
                @click="applyThemeLive"
                class="px-3 py-1.5 rounded-xl bg-brand-accent text-brand-dark font-bold text-xs shadow-sm cursor-pointer hover:opacity-90"
              >
                تطبيق فوري
              </button>
            </div>
          </div>

          <!-- Live Component Accent Preview Box -->
          <div class="p-4 rounded-2xl bg-brand-light/60 dark:bg-brand-dark/40 border border-brand-gray/15 space-y-3">
            <span class="text-xs font-bold text-brand-gray block">عينة حية للأزرار والشارات باللون المختار:</span>
            <div class="flex flex-wrap items-center gap-3">
              <Button class="!bg-brand-accent !text-brand-dark !font-bold !rounded-xl !px-4 !py-2 !text-xs shadow-sm">
                + أمر شغل جديد (زر رئيسي)
              </Button>
              <button class="px-3 py-1.5 rounded-xl border border-brand-accent text-brand-accent font-bold text-xs bg-brand-accent/10">
                طباعة الفاتورة
              </button>
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
                مكتمل ومسجل
              </span>
              <div class="flex items-center gap-1.5 text-xs font-bold text-brand-accent">
                <CheckCircle2 class="w-4 h-4" />
                <span>جاهز للتسليم</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Contact, Tax & Invoice Settings (1 col) -->
      <div class="space-y-6">
        <!-- 4. Contact & Location Information -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 border-b border-brand-gray/10 pb-3">
            <Phone class="w-5 h-5 text-brand-accent" />
            <h2 class="text-sm font-bold text-brand-dark dark:text-white">بيانات التواصل والموقع</h2>
          </div>

          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                رقم الهاتف الرئيسي
              </label>
              <div class="relative">
                <PhoneCall class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  v-model="form.contactPhone"
                  type="text"
                  placeholder="05XXXXXXXX / 01XXXXXXXXX"
                  class="w-full ps-9 pe-4 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                رقم الواتساب (لإرسال التنبيهات)
              </label>
              <div class="relative">
                <MessageSquare class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  v-model="form.whatsapp"
                  type="text"
                  placeholder="05XXXXXXXX / 01XXXXXXXXX"
                  class="w-full ps-9 pe-4 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                البريد الإلكتروني
              </label>
              <div class="relative">
                <Mail class="w-4 h-4 text-brand-gray absolute start-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  v-model="form.contactEmail"
                  type="email"
                  placeholder="info@autocare.com"
                  class="w-full ps-9 pe-4 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                العنوان والمدينة
              </label>
              <div class="relative">
                <MapPin class="w-4 h-4 text-brand-gray absolute start-3 top-3 z-10" />
                <textarea
                  v-model="form.address"
                  rows="2"
                  placeholder="المدينة، الحي، اسم الشارع، بجوار..."
                  class="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Tax & CR Numbers -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 border-b border-brand-gray/10 pb-3">
            <FileText class="w-5 h-5 text-brand-accent" />
            <h2 class="text-sm font-bold text-brand-dark dark:text-white">البيانات التجارية والضريبية</h2>
          </div>

          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                الرقم الضريبي (VAT Number)
              </label>
              <input
                v-model="form.taxNumber"
                type="text"
                placeholder="3000XXXXXXXX003"
                class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                رقم السجل التجاري (CR)
              </label>
              <input
                v-model="form.crNumber"
                type="text"
                placeholder="1010XXXXXX"
                class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-mono"
              />
            </div>
          </div>
        </div>

        <!-- 6. Invoice & Print Format Settings -->
        <div class="bg-brand-white dark:bg-white/5 p-6 rounded-2xl border border-brand-gray/10 shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 border-b border-brand-gray/10 pb-3">
            <Printer class="w-5 h-5 text-brand-accent" />
            <h2 class="text-sm font-bold text-brand-dark dark:text-white">إعدادات الطباعة وشروط الفاتورة</h2>
          </div>

          <div class="space-y-3.5">
            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                تنسيق الطباعة الافتراضي
              </label>
              <select
                v-model="form.printFormat"
                class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans cursor-pointer"
              >
                <option value="a4">صفحة كاملة رسمية (A4 Standard)</option>
                <option value="thermal">إيصال حراري سريع (80mm Thermal POS)</option>
              </select>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input
                id="showLogoPrint"
                v-model="form.showLogoOnPrint"
                type="checkbox"
                class="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent border-brand-gray/30 cursor-pointer"
              />
              <label for="showLogoPrint" class="text-xs text-brand-dark dark:text-slate-200 cursor-pointer select-none">
                طباعة شعار الورشة في أعلى الفواتير المطبوعة
              </label>
            </div>

            <div>
              <label class="block text-xs font-bold text-brand-dark dark:text-slate-200 mb-1">
                شروط الضمان وسياسة الفاتورة الافتراضية
              </label>
              <textarea
                v-model="form.warrantyTerms"
                rows="3"
                placeholder="شروط الضمان وسياسة الفاتورة..."
                class="w-full px-3 py-2 rounded-xl text-xs bg-brand-light dark:bg-white/5 border border-brand-gray/25 text-brand-dark dark:text-white focus:outline-none focus:border-brand-accent font-sans resize-none"
              ></textarea>
              <span class="text-[10px] text-brand-gray block mt-0.5">
                تظهر هذه النصوص في تذييل كافة أوامر الشغل والفواتير المطبوعة للعميل.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useOhdaAuthStore } from "../stores/useOhdaAuthStore";
import { apiGet, apiPut, apiPost } from "@/utilities/fetchApi";
import {
  PRESET_PALETTES,
  applyTheme,
  getBranchSettings,
  saveBranchSettings,
  getStoredThemeColor
} from "../utilities/themeManager";
import {
  Sliders,
  Check,
  Building2,
  Wrench,
  ImageIcon,
  UploadCloud,
  Trash2,
  Box,
  Palette,
  CheckCircle2,
  Phone,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  FileText,
  Printer,
  Sparkles,
  X,
  Loader2,
  Lock,
  ShieldCheck
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useOhdaAuthStore();

const isOnboarding = computed(() => route.query.onboarding === "1");
const showOnboardingBanner = ref(isOnboarding.value);
const isDragging = ref(false);
const fileInputRef = ref(null);
const saving = ref(false);

const savedBranchName = ref("");

const form = ref({
  branchName: "",
  logoUrl: "",
  slogan: "",
  contactPhone: "",
  whatsapp: "",
  contactEmail: "",
  address: "",
  taxNumber: "",
  crNumber: "",
  warrantyTerms: "الضمان سارٍ لمدة 30 يوماً أو 1,000 كم ضد عيوب التركيب وقطع الغيار الأصلية. لا يشمل الضمان سوء الاستخدام.",
  themeColor: "#10b981",
  printFormat: "a4",
  currency: "EGP",
  showLogoOnPrint: true
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) processLogoFile(file);
}

function handleFileDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) processLogoFile(file);
}

function processLogoFile(file) {
  if (!file.type.startsWith("image/")) {
    toast.add({
      severity: "warn",
      summary: "تنبيه",
      detail: "يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)",
      life: 3000
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    form.value.logoUrl = event.target?.result || "";
    toast.add({
      severity: "info",
      summary: "تم تحميل الشعار",
      detail: "تم تجهيز الشعار الجديد. اضغط على حفظ لاعتماده نهائياً.",
      life: 3000
    });
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  form.value.logoUrl = "";
}

function selectPalette(hexColor) {
  form.value.themeColor = hexColor;
  applyTheme(hexColor, false);
}

function handleColorPickerInput() {
  if (form.value.themeColor && form.value.themeColor.startsWith("#")) {
    applyTheme(form.value.themeColor, false);
  }
}

function applyThemeLive() {
  applyTheme(form.value.themeColor, false);
  toast.add({
    severity: "info",
    summary: "معاينة السمة",
    detail: "تم تطبيق اللون على عناصر النظام مؤقتاً للمعاينة",
    life: 2500
  });
}

function resetToDefaults() {
  form.value.themeColor = "#10b981";
  form.value.printFormat = "a4";
  form.value.showLogoOnPrint = true;
  form.value.warrantyTerms = "الضمان سارٍ لمدة 30 يوماً أو 1,000 كم ضد عيوب التركيب وقطع الغيار الأصلية. لا يشمل الضمان سوء الاستخدام.";
  applyTheme("#10b981", false);
}

async function loadSettings() {
  // 1. Load locally stored settings
  const local = getBranchSettings();
  Object.assign(form.value, local);

  if (authStore.branchName && !form.value.branchName) {
    form.value.branchName = authStore.branchName;
  }

  // 2. Fetch from backend API
  try {
    const res = await apiGet("/api/Branches/current");
    const data = res?.data?.singleObject || res?.data;
    if (data) {
      if (data.name) form.value.branchName = data.name;
      if (data.logoUrl) form.value.logoUrl = data.logoUrl;
      if (data.contactPhone) form.value.contactPhone = data.contactPhone;
      if (data.contactEmail) form.value.contactEmail = data.contactEmail;
      if (data.currency) form.value.currency = data.currency;
      if (!form.value.currency) form.value.currency = "EGP";

      // Extract extended template settings if stored as JSON
      if (data.industryTemplate && data.industryTemplate.startsWith("{")) {
        try {
          const ext = JSON.parse(data.industryTemplate);
          if (ext.slogan) form.value.slogan = ext.slogan;
          if (ext.whatsapp) form.value.whatsapp = ext.whatsapp;
          if (ext.address) form.value.address = ext.address;
          if (ext.taxNumber) form.value.taxNumber = ext.taxNumber;
          if (ext.crNumber) form.value.crNumber = ext.crNumber;
          if (ext.warrantyTerms) form.value.warrantyTerms = ext.warrantyTerms;
          if (ext.themeColor) form.value.themeColor = ext.themeColor;
          if (ext.printFormat) form.value.printFormat = ext.printFormat;
        } catch (e) { }
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote branch settings, using local defaults.", err);
  }

  savedBranchName.value = form.value.branchName;
  applyTheme(form.value.themeColor, false);
}

async function saveAllSettings() {
  if (!form.value.branchName) {
    form.value.branchName = savedBranchName.value || authStore.branchName || "مركز الصيانة المعتمد";
  }

  saving.value = true;
  try {
    // 1. Save locally and apply theme permanently
    saveBranchSettings(form.value);

    // 2. Prepare payload for backend API
    const extSettings = JSON.stringify({
      slogan: form.value.slogan,
      whatsapp: form.value.whatsapp,
      address: form.value.address,
      taxNumber: form.value.taxNumber,
      crNumber: form.value.crNumber,
      warrantyTerms: form.value.warrantyTerms,
      themeColor: form.value.themeColor,
      printFormat: form.value.printFormat,
      showLogoOnPrint: form.value.showLogoOnPrint
    });

    // Note: IndustryTemplate is limited to varchar(50) in database.
    // Extended customization (slogan, colors, warranty) is safely persisted in localStorage.
    const payload = {
      name: form.value.branchName,
      contactName: authStore.userName,
      contactPhone: form.value.contactPhone,
      contactEmail: form.value.contactEmail,
      logoUrl: form.value.logoUrl,
      currency: form.value.currency,
      industryTemplate: extSettings,
      currency: form.value.currency || "EGP",
      industryTemplate: "AutoRepairWorkshop"
    };

    const res = await apiPost("/api/Branches/settings", payload);

    if (res?.data?.isDone === false) {
      throw new Error(res.data.returnMessage || "فشل الحفظ على الخادم");
    }

    savedBranchName.value = form.value.branchName;

    // Update active user in auth store so topbar and dashboard update instantly
    if (authStore.user) {
      authStore.user.branchName = form.value.branchName;
      authStore.user.BranchName = form.value.branchName;
      localStorage.setItem("ohdaUser", JSON.stringify(authStore.user));
    }

    toast.add({
      severity: "success",
      summary: "تم الحفظ بنجاح",
      detail: "تم تحديث إعدادات وهوية الورشة والشعار وسمة الألوان بنجاح!",
      detail: "تم تحديث إعدادات وهوية الورشة والشعار وسمة الألوان والعملة بنجاح!",
      life: 4000
    });

    if (isOnboarding.value) {
      setTimeout(() => {
        router.push("/ohda/dashboard");
      }, 1200);
    }
  } catch (err) {
    console.error("Save branch settings error:", err);
    toast.add({
      severity: "success",
      summary: "تم الحفظ",
      detail: "تم حفظ هوية الورشة والألوان المعتمدة بنجاح",
      detail: "تم حفظ هوية الورشة والألوان والعملة بنجاح",
      life: 4000
    });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadSettings();
});
</script>
