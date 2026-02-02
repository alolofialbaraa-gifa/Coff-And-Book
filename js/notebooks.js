// ===== إعداد Supabase =====
import { supabase } from "./supabase.js";

const submitBtn = document.getElementById("next-btn");
let coverIdX = null;
var notebook = "null";

const params = new URLSearchParams(window.location.search);
const sec = params.get("sec");

// ===== جلب الدفاتر المخصصة =====
async function getCustomCovers() {
  const { data, error } = await supabase
    .from("Notebook")
    .select("id, name, basePrice, coverURL, coverBackURL, notebookURL")
    .eq("sec", sec);

  if (error) {
    console.error("خطأ في جلب الدفاتر:", error.message);
    return [];
  }
  return data || [];
}

// ===== دالة اختيار الدفتر =====
function chooseCover(coverId, btn, notebookURL) {
  document.querySelectorAll(".cover-card").forEach((card) => {
    card.classList.remove("selected");
  });
  document.querySelectorAll(".choose-btn").forEach((button) => {
    button.classList.remove("selected");
    button.textContent = "اختيار الدفتر";
  });

  const card = btn.closest(".cover-card");
  card.classList.add("selected");

  btn.classList.add("selected");
  btn.textContent = "تم الاختيار";

  coverIdX = coverId;
  notebook = notebookURL;
  console.log(`تم اختيار الدفتر رقم: ${coverId}`);

  document.querySelector(".bottom-bar").style.display = "block";
}

// ===== عرض الدفاتر =====
async function renderCustomCovers() {
  const grid = document.getElementById("coverGrid");

  try {
    grid.innerHTML = '<div class="loading">جاري تحميل الدفاتر...</div>';
    const covers = await getCustomCovers(); // ← هنا كان ناقص await

    if (!covers || covers.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i>📁</i>
          <h3>لا يوجد إنترنت</h3>
          <p>تأكد من اتصالك بالإنترنت</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = "";

    covers.forEach((cover, index) => {
      const card = document.createElement("div");
      card.className = "cover-card";
      card.style.animationDelay = `${index * 0.1}s`;

      const front = cover.coverURL;
      const back = cover.coverBackURL;
      const coverName = cover.name || "دفتر";

      card.innerHTML = `
        <div class="flip-container" onclick="this.classList.toggle('clicked')">
          <div class="flipper">
            <div class="front">
              <img src="${front}" alt="${coverName}">
            </div>
            <div class="back">
              <img src="${back}" alt="${coverName}">
            </div>
          </div>
        </div>
        <div class="cover-info">
          <div class="cover-name">${coverName}</div>
          <button class="choose-btn">اختيار الدفتر</button>
        </div>
        <hr/>
      `;

      const chooseBtn = card.querySelector(".choose-btn");
      chooseBtn.addEventListener("click", () =>
        chooseCover(cover.id, chooseBtn, cover.notebookURL)
      );

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("حدث خطأ أثناء تحميل الدفاتر:", error);
    grid.innerHTML = `
      <div class="empty-state">
        <i>⚠️</i>
        <h3>حدث خطأ أثناء التحميل</h3>
        <p>تعذر تحميل الدفاتر. يرجى المحاولة مرة أخرى لاحقًا.</p>
      </div>
    `;
  }
}

// ==== الانتقال للصفحة التالية ====
submitBtn.addEventListener("click", () => {
  if (!coverIdX) {
    alert("الرجاء اختيار دفتر أولاً.");
    return;
  } else {
    const url = `../pages/request.html?pid=${coverIdX}&notebook=${encodeURIComponent(
      notebook
    )}`;
    window.location.href = url;
  }
});

// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener("DOMContentLoaded", renderCustomCovers);
