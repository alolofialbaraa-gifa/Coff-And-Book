// ===== إعداد Supabase =====
import { supabase } from "./supabase.js";

// ===== جلب المنتجات حسب القسم =====
async function getProducts(sec) {
  const { data, error } = await supabase
    .from("Notebook")
    .select("id, name, basePrice, coverURL")
    .eq("sec", sec);

  if (error) {
    console.error("خطأ في جلب المنتجات:", error.message);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    basePrice: item.basePrice,
    thumb: item.coverURL,
  }));
}

// ===== جلب الأقسام مع المنتجات =====
async function getSections() {
  const sections = [
    { id: "anime", title: "دفاتر أنمي 🔥" },
    { id: "kids", title: "دفاتر شخصيات كرتونية 🐱‍👤" },
    { id: "university", title: "دفاتر رسمية" },
    { id: "notes", title: "نوت (ملاحظات)" },
  ];

  for (let sec of sections) {
    sec.products = await getProducts(sec.id);
  }

  return sections;
}

// ===== عرض الكاتالوج =====
async function renderCatalog() {
  const sections = await getSections();
  const catalogEl = document.getElementById("catalog");

  sections.forEach((sec) => {
    const secWrap = document.createElement("div");
    secWrap.className = "mb-6";
    secWrap.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-md font-bold">${sec.title}</h3>
            <button data-section="${sec.id}" class="text-sm text-gray-500" onclick="openSectionFull(event)">شاهد المزيد →</button>
          </div>
          <div class="overflow-x-auto -mx-2 pb-2">
            <div class="flex gap-3 px-2" id="carousel-${sec.id}"></div>
          </div>
        `;
    catalogEl.appendChild(secWrap);

    const carousel = secWrap.querySelector(`#carousel-${sec.id}`);
    sec.products.slice(0, 5).forEach((p) => {
      const card = document.createElement("div");
      card.className =
        "min-w-[160px] w-[160px] bg-white rounded-xl shadow p-2 flex-shrink-0";
      card.innerHTML = `
            <button class="w-full h-full text-right" onclick="goToCustomizer('${p.id}')">
              <img src="${p.thumb}" alt="${p.name}" class="rounded-lg h-36 w-full object-cover mb-2">
              <div class="text-sm font-semibold">${p.name}</div>
              <div class="text-xs text-gray-500">ابتداءً من ${p.basePrice} ريال</div>
            </button>
          `;
      carousel.appendChild(card);
    });
    document.querySelector(".splash-screen").style.display = "none";
  });

  // نحفظ الأقسام للاستخدام لاحقًا
  window.sections = sections;
}

// ===== فتح صفحة القسم =====
window.openSectionFull = function (e) {
  const id = e.currentTarget.dataset.section;
  const sec = window.sections.find((s) => s.id === id);
  document.getElementById("sectionTitle").textContent = sec.title;
  const grid = document.getElementById("sectionGrid");
  grid.innerHTML = "";
  sec.products.forEach((p) => {
    const el = document.createElement("div");
    el.className = "bg-white rounded-lg p-2 shadow";
    el.innerHTML = `
          <button class="w-full text-right" onclick="goToCustomizer('${p.id}')">
            <img src="${p.thumb}" alt="${p.name}" class="rounded-md mb-2 w-full h-36 object-cover">
            <div class="font-semibold text-sm">${p.name}</div>
            <div class="text-xs text-gray-500">ابتداءً من ${p.basePrice} ريال</div>
          </button>
        `;
    grid.appendChild(el);
  });
  document.getElementById("sectionPage").classList.remove("hidden");
  document.getElementById("sectionPage").classList.add("flex");
};

// ===== إغلاق صفحة القسم =====
document.getElementById("closeSectionPage").addEventListener("click", () => {
  document.getElementById("sectionPage").classList.add("hidden");
});

// ===== فتح صفحة التخصيص =====
window.goToCustomizer = function (productId) {
  const url = `./pages/request.html?pid=${productId}`;
  window.location.href = url;
};

// ===== زر البداية =====
// document.getElementById('startBtn').addEventListener('click', ()=>{
//   document.getElementById('catalog').scrollIntoView({behavior:'smooth'});
// });

// ===== تشغيل الكاتالوج =====
renderCatalog();