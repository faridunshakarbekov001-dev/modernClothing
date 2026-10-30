const products = window.CommonThreadProducts;
const page = document.body.dataset.page;
const toast = document.querySelector(".toast");
let activeCategory =
  new URLSearchParams(location.search).get("category") || "All";

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    notify(
      "Your browser could not save this change. Please check available storage.",
    );
    return false;
  }
}

function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(
    () => toast.classList.remove("is-visible"),
    2600,
  );
}

function initHeroSlider() {
  const hero = document.querySelector(".hero");
  const image = hero?.querySelector(".hero-image");
  const eyebrow = hero?.querySelector("#hero-eyebrow");
  const title = hero?.querySelector("#hero-title");
  const description = hero?.querySelector("#hero-description");
  const cta = hero?.querySelector("#hero-cta");
  const index = hero?.querySelector("#hero-index");
  const toggle = hero?.querySelector(".hero-toggle");
  const controls = hero?.querySelectorAll("[data-hero-direction]");
  const heroStats = hero?.querySelectorAll(".hero-stat");
  if (
    !hero ||
    !(image instanceof HTMLImageElement) ||
    !(eyebrow instanceof HTMLElement) ||
    !(title instanceof HTMLElement) ||
    !(description instanceof HTMLElement) ||
    !(cta instanceof HTMLAnchorElement) ||
    !(index instanceof HTMLElement) ||
    !(toggle instanceof HTMLButtonElement) ||
    !controls?.length ||
    !heroStats?.length ||
    Array.from(controls).some(
      (control) => !(control instanceof HTMLButtonElement),
    )
  )
    return;

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=85",
      alt: "Friends walking together in relaxed everyday clothing",
      eyebrow: "A little more room to move",
      title: "Made for\nthe in-between.",
      description:
        "Easy layers for all the parts of the day that make it yours.",
      cta: "Meet the new season",
      href: "#new-in",
      label: "Everyday, well made",
      stats: [
        { value: "3k+", label: "happy shoppers" },
        { value: "88%", label: "repeat orders" },
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=85",
      alt: "A model wearing relaxed contemporary clothing",
      eyebrow: "Pieces that work together",
      title: "Easy layers,\nall day long.",
      description:
        "Comfortable favourites that feel right, wherever you are headed.",
      cta: "Explore the edit",
      href: "#edit",
      label: "The everyday edit",
      stats: [
        { value: "12", label: "capsule pieces" },
        { value: "4.9/5", label: "average rating" },
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=85",
      alt: "A woman in a thoughtfully styled everyday outfit",
      eyebrow: "A wardrobe that feels like you",
      title: "Find your\nown rhythm.",
      description:
        "Thoughtful staples made to move with you through every kind of day.",
      cta: "Find your favourites",
      href: "#shop",
      label: "Made to move",
      stats: [
        { value: "100%", label: "natural fabrics" },
        { value: "24h", label: "dispatch" },
      ],
    },
  ];
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let activeSlide = 0;
  let isPaused = reducedMotion.matches;
  let transitionTimeout;

  function updateToggle() {
    const label = isPaused
      ? "Resume automatic slide rotation"
      : "Pause automatic slide rotation";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.querySelector("span").textContent = isPaused ? "▶" : "Ⅱ";
  }

  function showSlide(nextSlide) {
    if (nextSlide === activeSlide) return;
    activeSlide = (nextSlide + slides.length) % slides.length;
    const slide = slides[activeSlide];
    window.clearTimeout(transitionTimeout);
    hero.classList.add("is-changing");
    transitionTimeout = window.setTimeout(() => {
      image.src = slide.image;
      image.alt = slide.alt;
      eyebrow.textContent = slide.eyebrow;
      title.textContent = slide.title;
      description.textContent = slide.description;
      cta.firstChild.textContent = slide.cta;
      cta.href = slide.href;
      index.textContent = `${String(activeSlide + 1).padStart(2, "0")} — ${String(slides.length).padStart(2, "0")} / ${slide.label}`;

      slide.stats.forEach((stat, index) => {
        const statNode = heroStats[index];
        if (!statNode) return;
        const statValue = statNode.querySelector("strong");
        const statLabel = statNode.querySelector("span");
        if (statValue) statValue.textContent = stat.value;
        if (statLabel) statLabel.textContent = stat.label;
      });

      hero.classList.remove("is-changing");
    }, 220);
  }

  function showNextSlide() {
    showSlide(activeSlide + 1);
  }

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      const direction = Number(control.dataset.heroDirection);
      showSlide(activeSlide + direction);
    });
  });

  toggle.addEventListener("click", () => {
    isPaused = !isPaused;
    updateToggle();
  });
  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;
    isPaused = true;
    updateToggle();
  });

  updateToggle();
  window.setInterval(() => {
    if (!isPaused && !document.hidden) showNextSlide();
  }, 5000);
}

function getBag() {
  const bag = readStore("common-thread-bag", []);
  return Array.isArray(bag)
    ? bag
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            products[item.id] &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        )
        .map((item) => ({
          ...item,
          size: ["XS", "S", "M", "L", "XL"].includes(item.size)
            ? item.size
            : "M",
        }))
    : [];
}

function getFavourites() {
  const favourites = readStore("common-thread-favourites", []);
  return Array.isArray(favourites)
    ? [
        ...new Set(
          favourites.filter((id) => Number.isInteger(id) && products[id]),
        ),
      ]
    : [];
}

function photoUrl(product, width = 700) {
  return `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=${width}&q=80`;
}

function productUrl(id) {
  return id === 0 ? "product.html" : `product-${id}.html`;
}

function updateHeaderCounts() {
  const bagCount = getBag().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".bag-count").forEach((badge) => {
    badge.textContent = String(bagCount);
  });
  document.querySelectorAll(".bag-button").forEach((button) => {
    button.setAttribute(
      "aria-label",
      `Shopping bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`,
    );
  });
  const favouriteCount = getFavourites().length;
  document.querySelectorAll(".wishlist-count").forEach((badge) => {
    badge.textContent = String(favouriteCount);
  });
  document.querySelectorAll(".wishlist-link").forEach((link) => {
    link.setAttribute(
      "aria-label",
      `Wishlist, ${favouriteCount} ${favouriteCount === 1 ? "saved item" : "saved items"}`,
    );
  });
}

function updateCart() {
  const content = document.querySelector("[data-cart-content]");
  const template = document.querySelector("#cart-row-template");
  if (!content || !(template instanceof HTMLTemplateElement)) return;

  const bag = getBag();
  const subtotal = bag.reduce(
    (sum, item) => sum + products[item.id].price * item.quantity,
    0,
  );
  const cartItems = content.querySelector(".cart-items");
  const fragment = document.createDocumentFragment();

  bag.forEach((item) => {
    const product = products[item.id];
    const row = template.content.cloneNode(true);
    const article = row.querySelector(".cart-row");
    const imageLink = row.querySelector(".cart-image");
    const image = row.querySelector(".cart-image img");
    const productLink = row.querySelector(".cart-item-name");

    article.dataset.productId = String(item.id);
    article.dataset.size = item.size;
    imageLink.href = productUrl(item.id);
    image.src = photoUrl(product, 500);
    image.alt = product.alt;
    productLink.href = productUrl(item.id);
    productLink.textContent = product.name;
    row.querySelector(".cart-item-category").textContent =
      `${product.type} · Size ${item.size}`;
    row.querySelector(".cart-item-price").textContent =
      `£${product.price.toFixed(2)}`;
    row.querySelector(".cart-item-quantity").textContent = String(
      item.quantity,
    );
    row.querySelectorAll("[data-cart-action]").forEach((button) => {
      button.dataset.productId = String(item.id);
      button.dataset.size = item.size;
      button.setAttribute(
        "aria-label",
        button.dataset.cartAction === "remove"
          ? `Remove ${product.name} from your bag`
          : `${button.dataset.cartAction === "decrease" ? "Remove one" : "Add one"} ${product.name}`,
      );
    });
    fragment.append(row);
  });

  cartItems.replaceChildren(fragment);
  content.querySelector("[data-cart-empty]").hidden = bag.length > 0;
  content.querySelector("[data-cart-layout]").hidden = bag.length === 0;
  content.querySelector("[data-cart-subtotal]").textContent =
    `£${subtotal.toFixed(2)}`;
  content.querySelector("[data-cart-delivery]").textContent =
    subtotal >= 50 ? "Free" : "Calculated at checkout";
}

function updateWishlist() {
  const content = document.querySelector("[data-wishlist-content]");
  if (!content) return;
  const favourites = getFavourites();
  content.querySelectorAll("[data-wishlist-product]").forEach((card) => {
    card.hidden = !favourites.includes(Number(card.dataset.productId));
  });
  content.querySelector("[data-wishlist-empty]").hidden = favourites.length > 0;
  content.querySelector("[data-wishlist-grid]").hidden =
    favourites.length === 0;
}

function updateCategoryLinks() {
  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.classList.toggle(
      "selected",
      link.dataset.categoryLink === activeCategory,
    );
  });
}

function filterProducts() {
  const cards = [...document.querySelectorAll("[data-product-card]")];
  if (!cards.length) return;
  const search = document.querySelector(".search");
  const query = (
    search?.querySelector('input[type="search"]')?.value ||
    new URLSearchParams(location.search).get("q") ||
    ""
  )
    .trim()
    .toLowerCase();
  const selectedCategory = activeCategory;
  const sort =
    document.querySelector(".sort-control select")?.value || "featured";
  const grid = cards[0].parentElement;
  const ordered = cards.slice().sort((a, b) => {
    if (sort === "price-low")
      return Number(a.dataset.price) - Number(b.dataset.price);
    if (sort === "price-high")
      return Number(b.dataset.price) - Number(a.dataset.price);
    return Number(a.dataset.productId) - Number(b.dataset.productId);
  });
  ordered.forEach((card) => grid.append(card));
  let visible = 0;
  ordered.forEach((card) => {
    const matches =
      (selectedCategory === "All" ||
        card.dataset.category === selectedCategory) &&
      `${card.dataset.name} ${card.dataset.type} ${card.dataset.category.toLowerCase()}`.includes(
        query,
      );
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  const status = document.querySelector(".search-status");
  if (status)
    status.textContent =
      query && visible === 0
        ? "No pieces found. Try another search."
        : query
          ? `${visible} ${visible === 1 ? "piece" : "pieces"} found`
          : "";
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const menuToggle = target.closest(".menu-toggle");
  if (menuToggle) {
    const nav = document.querySelector(".main-nav");
    const open = nav?.classList.toggle("is-open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  const filter = target.closest("[data-filter]");
  if (filter) {
    activeCategory = filter.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((button) => {
      const active = button === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateCategoryLinks();
    filterProducts();
  }

  const addButton = target.closest("[data-add], [data-detail-add]");
  if (addButton) {
    const id = Number(
      addButton.getAttribute("data-add") ||
        addButton.getAttribute("data-detail-add"),
    );
    const sizeSelect = document.querySelector("#product-size");
    if (sizeSelect && !sizeSelect.value) {
      sizeSelect.focus();
      notify("Please choose a size first.");
      return;
    }
    const bag = getBag();
    const size = sizeSelect?.value || "M";
    const item = bag.find((entry) => entry.id === id && entry.size === size);
    if (item) item.quantity += 1;
    else bag.push({ id, quantity: 1, size });
    if (writeStore("common-thread-bag", bag)) {
      updateHeaderCounts();
      notify(`${products[id].name} added to your bag.`);
      updateCart();
    }
  }

  const cartAction = target.closest("[data-cart-action]");
  if (cartAction) {
    const bag = getBag();
    const itemIndex = bag.findIndex(
      (item) =>
        item.id === Number(cartAction.dataset.productId) &&
        item.size === cartAction.dataset.size,
    );
    if (itemIndex !== -1) {
      if (cartAction.dataset.cartAction === "remove") bag.splice(itemIndex, 1);
      else
        bag[itemIndex].quantity +=
          cartAction.dataset.cartAction === "increase" ? 1 : -1;
    }
    if (
      writeStore(
        "common-thread-bag",
        bag.filter((item) => item.quantity > 0),
      )
    ) {
      updateHeaderCounts();
      updateCart();
    }
  }

  const removeFavourite = target.closest("[data-remove-favourite]");
  const toggleFavourite = target.closest("[data-toggle-favourite]");
  if (removeFavourite || toggleFavourite) {
    const button = removeFavourite || toggleFavourite;
    const id = Number(
      button.getAttribute("data-remove-favourite") ||
        button.getAttribute("data-toggle-favourite"),
    );
    const favourites = getFavourites();
    const isSaved = favourites.includes(id);
    const updated = isSaved
      ? favourites.filter((savedId) => savedId !== id)
      : [...favourites, id];
    if (writeStore("common-thread-favourites", updated)) {
      updateHeaderCounts();
      notify(
        isSaved ? "Removed from your wishlist." : "Saved to your wishlist.",
      );
      document
        .querySelectorAll(`[data-toggle-favourite="${id}"]`)
        .forEach((favouriteButton) => {
          favouriteButton.classList.toggle("is-favourite", !isSaved);
          favouriteButton.setAttribute("aria-pressed", String(!isSaved));
          favouriteButton.setAttribute(
            "aria-label",
            `${isSaved ? "Add" : "Remove"} ${products[id].name} ${isSaved ? "to" : "from"} wishlist`,
          );
          favouriteButton.textContent = favouriteButton.matches(
            ".detail-wishlist",
          )
            ? isSaved
              ? "♡ Save to wishlist"
              : "♥ Saved to wishlist"
            : isSaved
              ? "♡"
              : "♥";
        });
      updateWishlist();
    }
  }

  if (target.closest(".checkout-button"))
    notify("Checkout is a demo and no order has been placed.");
});

document.addEventListener("input", (event) => {
  if (event.target.matches('.search input[type="search"]')) {
    event.target
      .closest(".search")
      .classList.toggle("has-value", Boolean(event.target.value));
    filterProducts();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches(".sort-control select")) filterProducts();
});

document.addEventListener("reset", (event) => {
  if (event.target.matches(".search")) window.setTimeout(filterProducts);
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches(".search")) return;
  if (form.matches(".newsletter, [data-demo-form]")) {
    event.preventDefault();
    const mode = form.dataset.demoForm;
    notify(
      mode === "contact"
        ? "Thanks — your message is ready for our team."
        : mode === "register"
          ? "Thanks for joining Common Thread."
          : mode === "login"
            ? "You’re signed in for this demo."
            : "Thanks for joining us.",
    );
    form.reset();
  }
});

updateHeaderCounts();
initHeroSlider();
const savedFavourites = getFavourites();
document.querySelectorAll("[data-toggle-favourite]").forEach((button) => {
  const id = Number(button.dataset.toggleFavourite);
  const saved = savedFavourites.includes(id);
  button.classList.toggle("is-favourite", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute(
    "aria-label",
    `${saved ? "Remove" : "Add"} ${products[id].name} ${saved ? "from" : "to"} wishlist`,
  );
  if (button.matches(".detail-wishlist"))
    button.textContent = saved ? "♥ Saved to wishlist" : "♡ Save to wishlist";
  else button.textContent = saved ? "♥" : "♡";
});
const requestedCategory = new URLSearchParams(location.search).get("category");
if (requestedCategory) {
  activeCategory = requestedCategory;
  document.querySelectorAll(".filter-tab").forEach((button) => {
    const active = button.dataset.filter === requestedCategory;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
updateCategoryLinks();
filterProducts();
if (page === "cart") updateCart();
if (page === "wishlist") updateWishlist();
