import { supabase } from "./supabase.js";

// نقرأ الاستعلامات من الرابط الحالي
const params = new URLSearchParams(location.search);
const NImgR = Number(params.get("NImgR") || 8);
const pid = params.get("pid");
const name = params.get("name");
const pages = params.get("pages");
const type = params.get("type");
const price = params.get("price");
const idCover = params.get("idCover");

const MAX = 8;
const filesData = Array(MAX).fill(null);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per image limit

const nextBtn = document.getElementById("nextBtn");
const uploadForm = document.getElementById("uploadForm");

for (let i = 1; i <= MAX; i++) {
  const input = document.getElementById("file" + i);
  const box = document.getElementById("box" + i);
  const preview = box.querySelector(".preview");
  const placeholder = box.querySelector(".placeholder");
  const removeBtn = box.querySelector(".remove-btn");

  // عند اختيار الملف
  input.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("الملف ليس صورة. الرجاء اختيار صورة.");
      input.value = "";
      return;
    }
    if (f.size > MAX_SIZE) {
      alert("حجم الصورة أكبر من 5 ميغابايت. اختر صورة أصغر.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      preview.classList.remove("hidden");
      placeholder.classList.add("hidden");
      removeBtn.classList.remove("hidden");
      filesData[i - 1] = { file: f, dataURL: ev.target.result };
    };
    reader.readAsDataURL(f);
  });

  // زر إزالة الصورة
  removeBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    input.value = "";
    preview.src = "";
    preview.classList.add("hidden");
    placeholder.classList.remove("hidden");
    removeBtn.classList.add("hidden");
    filesData[i - 1] = null;
  });

  // استبدال الصورة عند الضغط على المعاينة
  preview.addEventListener("click", (ev) => {
    ev.stopPropagation();
    input.click();
  });

  // إخفاء المربعات الغير مستخدمة حسب NImgR
  if (i > NImgR && box) {
    box.style.display = "none";
  }
}

// عند الضغط على زر التالي
nextBtn.addEventListener("click", async () => {
  await insertOrderWithImages();
});

// دالة رفع عدة صور
async function uploadMultipleImages(files) {
  uploadForm.style.display = "none";
  nextBtn.textContent = "جاري رفع الصور";
  nextBtn.disabled = true;
  nextBtn.innerHTML = `<div class="spinner" 
       style="width:20px;height:20px;gap:2rem;border:3px solid #fff;border-top:3px solid #333;
              border-radius:50%;animation:spin 1s linear infinite;display:inline-block;margin-right:8px;"></div> جاري الرفع...`;

  // احتفظ فقط بالملفات الصحيحة
  const validFiles = files.filter((f) => f instanceof File);
  if (validFiles.length === 0) return [];

  const uploadPromises = validFiles.map(async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });
    if (error) {
      console.error("خطأ في رفع الصورة:", error);
      return null;
    }

    const { data: publicData, error: urlError } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    if (urlError) {
      console.error("خطأ في الحصول على رابط الصورة:", urlError);
      return null;
    }

    return publicData.publicUrl;
  });

  // انتظر رفع كل الصور
  const urls = await Promise.all(uploadPromises);
  return urls.filter(Boolean);
}

async function insertOrderWithImages() {
  // اختَر الملفات فقط
  const selectedFiles = filesData.filter(Boolean).map((f) => f.file);
  if (selectedFiles.length === 0) {
    alert("الرجاء رفع صورة واحدة على الأقل.");
    return;
  }

  const imageUrls = await uploadMultipleImages(selectedFiles);

  const { data, error } = await supabase.from("Request").insert([
    {
      idNotebook: pid,
      name: name,
      type: type,
      sheets: pages,
      cover: idCover,
      img: imageUrls, // الآن يجب أن تحتوي على كل الروابط
    },
  ]);

  if (error) {
    alert("حدث خطأ أثناء رفع طلبك، تحقق من اتصالك بالإنترنت");
    nextBtn.textContent = "ارسال الطلب";
    nextBtn.disabled = false;
    return null;
  }

  window.location.href = "../pages/success.html";
  return data;
}
