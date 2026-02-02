// ===== إعداد Supabase =====
import { supabase } from "./supabase.js";

const submitBtn = document.getElementById("next-btn");
var coverIdX;
var NImgR;

const params = new URLSearchParams(location.search);
const pid = params.get("pid");
const name = params.get("name");
const pages = params.get("pages");
const type = params.get("type");
const price = params.get("price");
const idCover = params.get("idCover")

// ===== جلب الأغلفة المخصصة =====
async function getCustomCovers() {
  const { data, error } = await supabase
    .from("Custom Cover")
    .select("id, coverName, frontCover, backCover, NImgR");

  if (error) {
    console.error("خطأ في جلب الأغلفة:", error.message);
    return [];
  }
  return data;
}

// ===== جلب الغلاف الافتراضي =====
async function getDeflutCover() {
  const { data, error } = await supabase
    .from("Notebook")
    .select("id, coverURL, coverBackURL")
    .eq("id", pid)
    .single();

  if (error) {
    console.error("خطأ في جلب الغلاف الافتراضي:", error.message);
    return [];
  }
  return data ? [data] : [];
}

// ===== دوال الكاروسيل =====
// function nextSlide(btn) {
//   const carousel = btn.closest(".carousel");
//   const images = carousel.querySelectorAll(".carousel-image");
//   let activeIndex = -1;

//   images.forEach((img, index) => {
//     if (img.classList.contains("active")) {
//       img.classList.remove("active");
//       activeIndex = index;
//     }
//   });

//   const nextIndex = (activeIndex + 1) % images.length;
//   images[nextIndex].classList.add("active");
// }

// function prevSlide(btn) {
//   const carousel = btn.closest(".carousel");
//   const images = carousel.querySelectorAll(".carousel-image");
//   let activeIndex = -1;

//   images.forEach((img, index) => {
//     if (img.classList.contains("active")) {
//       img.classList.remove("active");
//       activeIndex = index;
//     }
//   });

//   const prevIndex = (activeIndex - 1 + images.length) % images.length;
//   images[prevIndex].classList.add("active");
// }

// ===== دالة اختيار الغلاف =====
function chooseCover(coverId, btn, nImgR) {
  document.querySelectorAll(".cover-card").forEach((card) => {
    card.classList.remove("selected");
  });
  document.querySelectorAll(".choose-btn").forEach((button) => {
    button.classList.remove("selected");
    button.textContent = "اختيار الغلاف";
  });

  const card = btn.closest(".cover-card");
  card.classList.add("selected");

  btn.classList.add("selected");
  btn.textContent = "تم الاختيار";

  coverIdX = coverId;
  NImgR = nImgR;
  console.log(`تم اختيار الغلاف رقم: ${coverId}`);

  document.querySelector(".bottom-bar").style.display = "block";
}

// ===== عرض الأغلفة =====
async function renderCustomCovers() {
  const grid = document.getElementById("coverGrid");

  try {
    grid.innerHTML = '<div class="loading">جاري تحميل الأغلفة...</div>';

    const [customCovers, defaultCovers] = await Promise.all([
      getCustomCovers(),
      getDeflutCover()
    ]);
    const covers = [...customCovers, ...defaultCovers];

    if (!covers || covers.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i>📁</i>
          <h3>لا توجد أغلفة متاحة</h3>
          <p>لم يتم العثور على أي أغلفة، تأكد من اتصالك بالإنترنت</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = "";

    covers.forEach((cover, index) => {
      const card = document.createElement("div");
      card.className = "cover-card";
      card.style.animationDelay = `${index * 0.1}s`;

      const front = cover.frontCover || cover.coverURL;
      const back  = cover.backCover || cover.coverBackURL;
      const name  = cover.coverName || "غلاف افتراضي";

      card.innerHTML = `
      <div class="flip-container" onclick="this.classList.toggle('clicked')">
        <div class="flipper">
          <div class="front">
            <img src="${front}" alt="${name}">
          </div>
          <div class="back">
            <img src="${back}" alt="${name}">
          </div>
        </div>
      </div>
      <div class="cover-info">
        <div class="cover-name">${name}</div>
        <button class="choose-btn">اختيار الغلاف</button>
      </div>
      <hr/>
      `;

      // const prevBtn = card.querySelector(".carousel-btn.prev");
      // const nextBtn = card.querySelector(".carousel-btn.next");
      const chooseBtn = card.querySelector(".choose-btn");

      // prevBtn.addEventListener("click", () => prevSlide(prevBtn));
      // nextBtn.addEventListener("click", () => nextSlide(nextBtn));
      chooseBtn.addEventListener("click", () =>
        chooseCover(cover.id, chooseBtn, cover.NImgR)
      );

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("حدث خطأ أثناء تحميل الأغلفة:", error);
    grid.innerHTML = `
      <div class="empty-state">
        <i>⚠️</i>
        <h3>حدث خطأ أثناء التحميل</h3>
        <p>تعذر تحميل الأغلفة. يرجى المحاولة مرة أخرى لاحقًا.</p>
      </div>
    `;
  }
}

// ==== الانتقال للصفحة التالية ====
submitBtn.addEventListener("click", () => {
  if (!coverIdX) {
    alert("الرجاء اختيار غلاف أولاً.");
    return;
  }

  const isDefault = !NImgR || NImgR === null || NImgR === undefined;

  if (isDefault) {
    // الغلاف افتراضي → أرسل الطلب مباشرة
    insertOrderWithImages();
  } else {
    // الغلاف مخصص → انتقل لصفحة رفع الصور
    const p = new URLSearchParams(location.search);
    p.set("idCover", coverIdX);
    p.set("NImgR", NImgR);
    location.href = "./uploadImages.html?" + p.toString();
  }
});


async function insertOrderWithImages() {
  const { data, error } = await supabase.from("Request").insert([
    {
      idNotebook: pid,
      name: name,
      type: type,
      sheets: pages,
      cover: idCover,
      img: [], // لا توجد صور
    },
  ]);

  if (error) {
    alert("حدث خطأ أثناء رفع طلبك، تحقق من اتصالك بالإنترنت");
    return null;
  }

  window.location.href = "../pages/success.html";
  return data;
}


// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener("DOMContentLoaded", renderCustomCovers);