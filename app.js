const STORAGE_KEY = "subscriptions";

const form = document.getElementById("subscription-form");
const listElement = document.getElementById("subscription-list");
const monthlyTotalElement = document.getElementById("monthly-total");
const yearlyTotalElement = document.getElementById("yearly-total");
const itemTemplate = document.getElementById("subscription-item-template");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const intervalInput = document.getElementById("interval");
const categoryInput = document.getElementById("category");

const state = {
  subscriptions: loadSubscriptions(),
};

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const subscription = {
    id: crypto.randomUUID(),
    name: nameInput.value.trim(),
    price: Number(priceInput.value),
    interval: intervalInput.value,
    category: categoryInput.value.trim() || "Övrigt",
  };

  if (!subscription.name || Number.isNaN(subscription.price) || subscription.price < 0) {
    return;
  }

  state.subscriptions.push(subscription);
  persist();
  form.reset();
  render();
});

listElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  state.subscriptions = state.subscriptions.filter((item) => item.id !== button.dataset.id);
  persist();
  render();
});

function render() {
  listElement.innerHTML = "";

  if (state.subscriptions.length === 0) {
    const emptyElement = document.createElement("li");
    emptyElement.className = "empty";
    emptyElement.textContent = "Inga subscriptions ännu. Lägg till din första!";
    listElement.append(emptyElement);
  } else {
    state.subscriptions.forEach((subscription) => {
      const node = itemTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector(".item-name").textContent = subscription.name;
      node.querySelector(
        ".item-meta"
      ).textContent = `${subscription.category} • ${formatCurrency(subscription.price)} ${
        subscription.interval === "monthly" ? "/ månad" : "/ år"
      }`;

      const deleteButton = node.querySelector(".delete-button");
      deleteButton.dataset.id = subscription.id;
      listElement.append(node);
    });
  }

  const totalMonthly = state.subscriptions.reduce((sum, item) => {
    return sum + (item.interval === "monthly" ? item.price : item.price / 12);
  }, 0);

  monthlyTotalElement.textContent = formatCurrency(totalMonthly);
  yearlyTotalElement.textContent = formatCurrency(totalMonthly * 12);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.subscriptions));
}

function loadSubscriptions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 2,
  }).format(value);
}
