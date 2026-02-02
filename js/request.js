const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");
const nameOverlay = document.getElementById("nameOverlay");
const pagesSelect = document.getElementById("pagesSelect");
const typeSelect = document.getElementById("typeSelect");
const optionSheets = document.getElementById("optionSheets");
const priceEl = document.getElementById("price");
const submitBtn = document.getElementById("submitBtn");

const params = new URLSearchParams(window.location.search);

const productId = params.get("pid");

const basePrice = 500; // سعر ابتدائي

function updatePrice() {
  if (typeSelect.value == "JR") {
    const pagesPrice = parseInt(pagesSelect.value);
    const total = pagesPrice;
    priceEl.textContent = total;

    const options = pagesSelect.querySelectorAll(
      'option[value="1000"], option[value="1200"], option[value="1500"]'
    );
    options.forEach((opt) => (opt.disabled = false));
  } else {
    const pagesPrice = parseInt(pagesSelect.value);
    const total = pagesPrice - 100;
    priceEl.textContent = total;
  }
}

function updatePageSelect() {
  // عطل خيار 80
  const options = pagesSelect.querySelectorAll(
    'option[value="1000"], option[value="1200"], option[value="1500"]'
  );
  options.forEach((opt) => (opt.disabled = true));

  pagesSelect.value = "600";
  pagesSelect.dispatchEvent(new Event("change"));

  updatePrice();
}

pagesSelect.addEventListener("change", updatePrice);
typeSelect.addEventListener("change", updatePageSelect);

submitBtn.addEventListener("click", () => {
  if (nameInput.value.trim() === "") {
    nameError.style.display = "block";
  } else {
    nameError.style.display = "none";
    const url = `./selectCover.html?pid=${productId}&name=${encodeURIComponent(
      nameInput.value
    )}&pages=${pagesSelect.value}&type=${typeSelect.value}&price=${
      priceEl.textContent
    }`;
    window.location.href = url;
    const notebookType = document.querySelector(
      'input[name="notebookType"]:checked'
    ).value;
  }
});

updatePrice();