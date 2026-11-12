const $ = (id) => document.getElementById(id);

const answers = [
  { keys: ["soil", "health", "fertility", "organic"], answer: "Start with a soil test to understand pH and nutrient levels. Add well-decomposed compost or farmyard manure where appropriate, rotate crops, retain suitable crop residues and avoid excessive tillage. Apply fertilizers based on the soil test and local agricultural recommendations." },
  { keys: ["drip", "irrigation", "water"], answer: "Drip irrigation delivers water slowly near plant roots through emitters. It can reduce water loss and keep foliage drier. Filter and maintain the system regularly, check for blocked emitters and schedule irrigation according to crop stage, soil and weather." },
  { keys: ["yellow", "leaf", "leaves"], answer: "Yellow leaves can result from overwatering, poor drainage, nutrient deficiency, pests or disease. Check whether the yellowing affects old or new leaves, inspect both leaf surfaces and examine soil moisture. A clear photo and crop details help narrow down possible causes; this demo cannot diagnose disease." },
  { keys: ["pest", "insect"], answer: "Inspect the crop regularly and identify the pest before taking action. Encourage beneficial insects, remove heavily affected plant parts when appropriate and use integrated pest management. Follow local agriculture department guidance and pesticide label directions." },
  { keys: ["fertilizer", "urea", "nutrient"], answer: "The right fertilizer and quantity depend on crop, soil test, growth stage and local recommendations. Avoid applying fertilizer by guesswork. A soil health card or laboratory test can help guide balanced nutrient management." },
  { keys: ["sowing", "planting", "seed"], answer: "Sowing time and seed rate vary by crop, variety, season and local climate. Use certified seed where available and follow the package and local extension recommendations for spacing, seed treatment and sowing depth." },
  { keys: ["rice", "paddy"], answer: "For paddy, consider local water availability, suitable variety and season. Use healthy seed, prepare a level field, manage weeds early and follow locally recommended nutrient and water practices. Recommendations vary by region." },
  { keys: ["tomato"], answer: "Tomato performs best with well-drained soil, adequate sunlight and consistent moisture. Use healthy seedlings, support plants where needed and monitor regularly for leaf curl, fruit borer and fungal symptoms. Choose varieties suited to your season and area." }
];

function getAnswer(question) {
  const q = question.toLowerCase();
  const match = answers.find(item => item.keys.some(key => q.includes(key)));
  return match ? match.answer : "Thanks for your question. For useful general guidance, share the crop name, your location, crop growth stage and what you have observed. This demo has a limited set of prepared answers, so please confirm important decisions with your local agriculture officer or extension service.";
}

function addMessage(text, sender) {
  const row = document.createElement("div");
  row.className = `chat-message ${sender === "user" ? "user-message" : "bot-message"}`;
  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.textContent = sender === "user" ? "You" : "✳";
  const body = document.createElement("div");
  body.className = "message-body";
  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = sender === "user" ? "YOU" : "AGROBOT";
  const p = document.createElement("p");
  p.textContent = text;
  body.append(name, p);
  row.append(avatar, body);
  $("chatWindow").append(row);
  $("chatWindow").scrollTop = $("chatWindow").scrollHeight;
}

function sendQuestion(question) {
  const clean = question.trim();
  if (!clean) return;
  addMessage(clean, "user");
  window.setTimeout(() => addMessage(getAnswer(clean), "bot"), 250);
}

$("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  sendQuestion($("chatInput").value);
  $("chatInput").value = "";
});
document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => sendQuestion(button.dataset.question));
});

$("cropForm").addEventListener("submit", event => {
  event.preventDefault();
  const soil = $("soilType").value;
  const season = $("season").value;
  const water = $("water").value;
  const acres = Number($("fieldSize").value);
  if (!soil || !season || !water || !Number.isFinite(acres) || acres <= 0) return;

  const choices = new Set();
  if (season === "kharif") {
    if (water !== "low") choices.add("Paddy (where locally suitable)");
    choices.add("Maize");
    choices.add("Pigeon pea");
    if (soil === "black" || soil === "clay") choices.add("Cotton (check local suitability)");
  } else if (season === "rabi") {
    choices.add("Chickpea");
    choices.add("Mustard");
    if (water !== "low") choices.add("Wheat (where locally suitable)");
    choices.add("Safflower");
  } else {
    choices.add("Green gram");
    choices.add("Groundnut");
    if (water !== "low") choices.add("Vegetables (season-appropriate)");
  }
  if (water === "low") {
    choices.delete("Paddy (where locally suitable)");
    choices.add("Millets (locally adapted varieties)");
  }
  if (soil === "sandy") choices.add("Pearl millet");
  if (soil === "loamy") choices.add("Vegetables (season-appropriate)");

  const result = $("cropResult");
  result.hidden = false;
  result.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = `Illustrative options for ${acres} acre${acres === 1 ? "" : "s"}`;
  const note = document.createElement("p");
  note.className = "fine-print";
  note.textContent = "Based only on the selections entered. Check local rainfall, temperature, soil test, seed availability and market before choosing.";
  const chips = document.createElement("div");
  chips.className = "crop-chips";
  [...choices].forEach(crop => {
    const chip = document.createElement("span");
    chip.className = "crop-chip";
    chip.textContent = crop;
    chips.append(chip);
  });
  result.append(title, chips, note);
});

$("chooseImage").addEventListener("click", () => $("leafInput").click());
$("uploadArea").addEventListener("click", event => {
  if (event.target.id !== "chooseImage" && event.target.id !== "removeImage") $("leafInput").click();
});
$("leafInput").addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showToast("Please choose an image smaller than 8 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    $("leafPreview").src = reader.result;
    $("leafPreview").hidden = false;
    $("uploadPlaceholder").hidden = true;
    $("fileName").textContent = file.name;
    $("removeImage").hidden = false;
  };
  reader.readAsDataURL(file);
});
$("removeImage").addEventListener("click", () => {
  $("leafInput").value = "";
  $("leafPreview").removeAttribute("src");
  $("leafPreview").hidden = true;
  $("uploadPlaceholder").hidden = false;
  $("fileName").textContent = "No image selected";
  $("removeImage").hidden = true;
});

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}
$("menuBtn").addEventListener("click", () => $("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    $("sidebar").classList.remove("open");
  });
});
