/* =========================================================
   Flowers Sayf — script.js
   Handles: auth (login/register), password visibility toggle,
   product catalog rendering, search + filter, cart, checkout,
   logout, mobile nav, contact form.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Storage keys ---------- */
  const USERS_KEY = "flowersSayf_users";
  const SESSION_KEY = "flowersSayf_session";
  const CART_KEY = "flowersSayf_cart";

  /* ---------- Helpers ---------- */
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function setSession(email) {
    localStorage.setItem(SESSION_KEY, email);
  }
  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }
  function formatPrice(n) {
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* =========================================================
     PASSWORD EYE TOGGLE (login.html + register.html)
     ========================================================= */
  document.querySelectorAll(".eye-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.classList.toggle("is-visible", !showing);
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });

  function showAuthToast(message, isError) {
    const toast = document.getElementById("authToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("is-visible", "is-error");
    toast.classList.add("is-visible");
    if (isError) toast.classList.add("is-error");
  }

  function setFieldError(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.toggle("has-error", !!hasError);
  }

  /* =========================================================
     REGISTER PAGE
     ========================================================= */
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim().toLowerCase();
      const password = document.getElementById("regPassword").value;
      const confirm = document.getElementById("regConfirm").value;

      let valid = true;

      setFieldError("regNameField", false);
      setFieldError("regEmailField", false);
      setFieldError("regPasswordField", false);
      setFieldError("regConfirmField", false);

      if (!name) {
        setFieldError("regNameField", true);
        valid = false;
      }
      if (!isValidEmail(email)) {
        setFieldError("regEmailField", true);
        valid = false;
      }
      if (password.length < 6) {
        setFieldError("regPasswordField", true);
        valid = false;
      }
      if (confirm !== password || !confirm) {
        setFieldError("regConfirmField", true);
        valid = false;
      }

      if (!valid) {
        showAuthToast("Please fix the highlighted fields.", true);
        return;
      }

      const users = getUsers();
      if (users.some(function (u) { return u.email === email; })) {
        showAuthToast("An account with this email already exists. Please log in.", true);
        return;
      }

      users.push({ name: name, email: email, password: password });
      saveUsers(users);

      showAuthToast("Account created! Redirecting to log in...", false);
      registerForm.reset();
      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    });
  }

  /* =========================================================
     LOGIN PAGE
     ========================================================= */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    // If just registered, show a friendly note
    const params = new URLSearchParams(window.location.search);

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value;

      let valid = true;
      setFieldError("loginEmailField", false);
      setFieldError("loginPasswordField", false);

      if (!isValidEmail(email)) {
        setFieldError("loginEmailField", true);
        valid = false;
      }
      if (!password) {
        setFieldError("loginPasswordField", true);
        valid = false;
      }
      if (!valid) {
        showAuthToast("Please fix the highlighted fields.", true);
        return;
      }

      const users = getUsers();
      const match = users.find(function (u) { return u.email === email && u.password === password; });

      if (!match) {
        showAuthToast("No account matches that email and password. Please register first.", true);
        return;
      }

      setSession(email);
      showAuthToast("Welcome back! Redirecting...", false);
      setTimeout(function () {
        window.location.href = "shop.html";
      }, 500);
    });
  }

  /* =========================================================
     SHOP PAGE
     ========================================================= */
  const productGrid = document.getElementById("productGrid");
  if (productGrid) {

    /* ---- Auth guard: must be logged in to view the shop ---- */
    if (!getSession()) {
      window.location.href = "login.html";
      return;
    }

    /* ---- Product catalog (25 items, real photography) ---- */
    const IMG = {
      r1: "https://images.unsplash.com/photo-1518709779341-56cf4535e94b?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r2: "https://images.unsplash.com/photo-1548094967-e25a127d1f6d?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r3: "https://images.unsplash.com/photo-1512056495345-913a0c261dc8?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r4: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r5: "https://images.unsplash.com/photo-1523693916903-027d144a2b7d?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r6: "https://images.unsplash.com/photo-1556712691-5c39e0e32a8e?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r7: "https://images.unsplash.com/photo-1673277848241-86e145cd7112?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r8: "https://images.unsplash.com/photo-1615385639736-362b69696227?fm=jpg&q=75&w=700&auto=format&fit=crop",
      r9: "https://images.unsplash.com/photo-1581938165093-050aeb5ef218?fm=jpg&q=75&w=700&auto=format&fit=crop",
      l1: "https://images.unsplash.com/photo-1573659704883-b0f201c9f41d?fm=jpg&q=75&w=700&auto=format&fit=crop",
      l2: "https://images.unsplash.com/photo-1558684131-9860da30c336?fm=jpg&q=75&w=700&auto=format&fit=crop",
      l3: "https://images.unsplash.com/photo-1552039242-5dff0de3a6b7?fm=jpg&q=75&w=700&auto=format&fit=crop",
      s1: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?fm=jpg&q=75&w=700&auto=format&fit=crop",
      s2: "https://images.unsplash.com/photo-1567020991467-969b681f5603?fm=jpg&q=75&w=700&auto=format&fit=crop",
      s3: "https://images.unsplash.com/photo-1652175450325-00966ffd4551?fm=jpg&q=75&w=700&auto=format&fit=fit=crop",
      m4: "https://images.unsplash.com/photo-1608027790251-5e0c80d043d9?fm=jpg&q=75&w=700&auto=format&fitcrop",
      m1: "https://images.unsplash.com/photo-1605341778220-2652cd6c97c6?fm=jpg&q=75&w=700&auto=format&fit=crop",
      m2: "https://images.unsplash.com/photo-1652346072098-cfc2e94d30e7?fm=jpg&q=75&w=700&auto=format&fit=crop",
      m3: "https://images.unsplash.com/photo-1572454591674-2739f30d8c40?fm=jpg&q=75&w=700&auto=format&=crop"
    };

    const PRODUCTS = [
      { id: 1, name: "Classic Red Rose Bouquet", type: "rose", size: "Small · 12 stems", price: 799, img: IMG.r1 },
      { id: 2, name: "Classic Red Rose Bouquet", type: "rose", size: "Medium · 24 stems", price: 1399, img: IMG.r2 },
      { id: 3, name: "Classic Red Rose Bouquet", type: "rose", size: "Large · 36 stems", price: 1999, img: IMG.r3 },
      { id: 4, name: "Blush Pink Rose Bouquet", type: "rose", size: "Medium · 18 stems", price: 1199, img: IMG.r4 },
      { id: 5, name: "Pink & White Rose Bouquet", type: "rose", size: "Medium · 20 stems", price: 1299, img: IMG.r5 },
      { id: 6, name: "Sunset Rose Bouquet", type: "rose", size: "Medium · 20 stems", price: 1349, img: IMG.r6 },
      { id: 7, name: "Golden Yellow Rose Bouquet", type: "rose", size: "Medium · 18 stems", price: 1249, img: IMG.r7 },
      { id: 8, name: "Kraft-Wrapped Garden Roses", type: "rose", size: "Small · 10 stems", price: 899, img: IMG.r8 },
      { id: 9, name: "Rose Petals Gift Box", type: "rose", size: "Small keepsake box", price: 599, img: IMG.r9 },
      { id: 10, name: "White Lily Elegance Bouquet", type: "lily", size: "Medium · 8 stems", price: 1099, img: IMG.l1 },
      { id: 11, name: "Pink Lily Charm Bouquet", type: "lily", size: "Medium · 8 stems", price: 1149, img: IMG.l2 },
      { id: 12, name: "Red Lily Passion Bouquet", type: "lily", size: "Medium · 8 stems", price: 1199, img: IMG.l3 },
      { id: 13, name: "Casablanca Lily Bouquet", type: "lily", size: "Large · 14 stems", price: 1799, img: IMG.l1 },
      { id: 14, name: "Stargazer Lily Bouquet", type: "lily", size: "Small · 5 stems", price: 899, img: IMG.l2 },
      { id: 15, name: "Lily Trio Gift Set", type: "lily", size: "Small · 3 stems", price: 849, img: IMG.l3 },
      { id: 16, name: "Sunny Sunflower Bouquet", type: "sunflower", size: "Small · 6 stems", price: 699, img: IMG.s1 },
      { id: 17, name: "Sunny Sunflower Bouquet", type: "sunflower", size: "Medium · 10 stems", price: 999, img: IMG.s2 },
      { id: 18, name: "Sunny Sunflower Bouquet", type: "sunflower", size: "Large · 16 stems", price: 1499, img: IMG.s3 },
      { id: 19, name: "Rustic Sunflower Basket", type: "sunflower", size: "Medium basket arrangement", price: 1349, img: IMG.s1 },
      { id: 20, name: "Sunflower & Greenery Bouquet", type: "sunflower", size: "Medium · 8 stems", price: 1099, img: IMG.s2 },
      { id: 21, name: "Golden Fields Sunflower Bunch", type: "sunflower", size: "Large · 14 stems", price: 1599, img: IMG.s3 },
      { id: 22, name: "Pastel Mixed Bouquet", type: "mixed", size: "Medium mixed arrangement", price: 1449, img: IMG.m1 },
      { id: 23, name: "Garden Mix Bouquet", type: "mixed", size: "Medium mixed arrangement", price: 1349, img: IMG.m2 },
      { id: 24, name: "Romance Mixed Bouquet", type: "mixed", size: "Large mixed arrangement", price: 1899, img: IMG.m3 },
      { id: 25, name: "Vintage Mixed Bouquet", type: "mixed", size: "Medium mixed arrangement", price: 1599, img: IMG.m4 }
    ];

    const TYPE_LABEL = { rose: "Rose", lily: "Lily", sunflower: "Sunflower", mixed: "Mixed" };

    let activeFilter = "all";
    let searchTerm = "";

    /* ---- Render product grid ---- */
    function renderProducts() {
      const noResults = document.getElementById("noResults");
      const filtered = PRODUCTS.filter(function (p) {
        const matchesFilter = activeFilter === "all" || p.type === activeFilter;
        const haystack = (p.name + " " + p.type + " " + p.size).toLowerCase();
        const matchesSearch = haystack.indexOf(searchTerm) !== -1;
        return matchesFilter && matchesSearch;
      });

      productGrid.innerHTML = filtered.map(function (p) {
        return (
          '<article class="product-card" data-id="' + p.id + '">' +
            '<div class="product-media">' +
              '<span class="product-badge">' + TYPE_LABEL[p.type] + '</span>' +
              '<img src="' + p.img + '" alt="' + p.name + ' - ' + p.size + '" loading="lazy">' +
            '</div>' +
            '<div class="product-body">' +
              '<h3>' + p.name + '</h3>' +
              '<div class="product-meta">' + p.size + '</div>' +
              '<div class="product-price">' + formatPrice(p.price) + '</div>' +
              '<div class="product-actions">' +
                '<button class="btn btn-outline add-to-cart" data-id="' + p.id + '">Add to Cart</button>' +
                '<button class="btn btn-primary buy-now" data-id="' + p.id + '">Buy Now</button>' +
              '</div>' +
            '</div>' +
          '</article>'
        );
      }).join("");

      if (noResults) noResults.classList.toggle("is-visible", filtered.length === 0);
    }

    function getProduct(id) {
      return PRODUCTS.find(function (p) { return p.id === Number(id); });
    }

    /* ---- Search ---- */
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderProducts();
      });
    }

    /* ---- Filter chips ---- */
    const filterRow = document.getElementById("filterRow");
    function setFilter(filter) {
      activeFilter = filter;
      document.querySelectorAll(".chip").forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-filter") === filter);
      });
      renderProducts();
    }
    if (filterRow) {
      filterRow.addEventListener("click", function (e) {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        setFilter(chip.getAttribute("data-filter"));
      });
    }
    // Footer quick-filter links
    document.querySelectorAll("[data-filter-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        setFilter(link.getAttribute("data-filter-link"));
      });
    });

    /* =========================================================
       CART
       ========================================================= */
    function getCart() {
      try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
      } catch (e) {
        return [];
      }
    }
    function saveCart(cart) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
    }
    function addToCart(id, qty) {
      qty = qty || 1;
      const cart = getCart();
      const existing = cart.find(function (item) { return item.id === id; });
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ id: id, qty: qty });
      }
      saveCart(cart);
    }
    function updateQty(id, delta) {
      const cart = getCart();
      const item = cart.find(function (i) { return i.id === id; });
      if (!item) return;
      item.qty += delta;
      const next = item.qty <= 0 ? cart.filter(function (i) { return i.id !== id; }) : cart;
      saveCart(next);
    }
    function removeFromCart(id) {
      saveCart(getCart().filter(function (i) { return i.id !== id; }));
    }
    function clearCart() {
      saveCart([]);
    }

    const cartItemsEl = document.getElementById("cartItems");
    const cartCountEl = document.getElementById("cartCount");
    const cartTotalEl = document.getElementById("cartTotal");

    function renderCart() {
      const cart = getCart();
      const totalQty = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
      if (cartCountEl) cartCountEl.textContent = totalQty;

      if (!cartItemsEl) return;

      if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Add a bouquet to get started 🌷</p>';
        if (cartTotalEl) cartTotalEl.textContent = formatPrice(0);
        return;
      }

      let total = 0;
      cartItemsEl.innerHTML = cart.map(function (item) {
        const p = getProduct(item.id);
        if (!p) return "";
        const lineTotal = p.price * item.qty;
        total += lineTotal;
        return (
          '<div class="cart-item">' +
            '<img src="' + p.img + '" alt="' + p.name + '">' +
            '<div class="cart-item-info">' +
              '<h4>' + p.name + '</h4>' +
              '<div class="meta">' + p.size + '</div>' +
              '<div class="cart-item-price">' + formatPrice(lineTotal) + '</div>' +
              '<div class="qty-control">' +
                '<button class="qty-minus" data-id="' + p.id + '" aria-label="Decrease quantity">−</button>' +
                '<span>' + item.qty + '</span>' +
                '<button class="qty-plus" data-id="' + p.id + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<button class="remove-item" data-id="' + p.id + '">Remove</button>' +
            '</div>' +
          '</div>'
        );
      }).join("");

      if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);
    }

    if (cartItemsEl) {
      cartItemsEl.addEventListener("click", function (e) {
        const minus = e.target.closest(".qty-minus");
        const plus = e.target.closest(".qty-plus");
        const remove = e.target.closest(".remove-item");
        if (minus) updateQty(Number(minus.getAttribute("data-id")), -1);
        if (plus) updateQty(Number(plus.getAttribute("data-id")), 1);
        if (remove) removeFromCart(Number(remove.getAttribute("data-id")));
      });
    }

    /* ---- Add to cart / Buy now button clicks (event delegation) ---- */
    productGrid.addEventListener("click", function (e) {
      const addBtn = e.target.closest(".add-to-cart");
      const buyBtn = e.target.closest(".buy-now");

      if (addBtn) {
        const id = Number(addBtn.getAttribute("data-id"));
        addToCart(id, 1);
        showToast("Added to cart");
      }

      if (buyBtn) {
        openBuyModal(Number(buyBtn.getAttribute("data-id")));
      }
    });

    /* =========================================================
       CART DRAWER open/close
       ========================================================= */
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartBtn = document.getElementById("cartBtn");
    const cartClose = document.getElementById("cartClose");

    function openCart() {
      if (cartDrawer) cartDrawer.classList.add("is-open");
      if (cartOverlay) cartOverlay.classList.add("is-open");
    }
    function closeCart() {
      if (cartDrawer) cartDrawer.classList.remove("is-open");
      if (cartOverlay) cartOverlay.classList.remove("is-open");
    }
    if (cartBtn) cartBtn.addEventListener("click", openCart);
    if (cartClose) cartClose.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    /* =========================================================
       BUY NOW MODAL
       ========================================================= */
    const buyModal = document.getElementById("buyModal");
    const buyModalText = document.getElementById("buyModalText");
    const buyCancel = document.getElementById("buyCancel");
    const buyConfirm = document.getElementById("buyConfirm");
    let pendingBuyId = null;

    function openBuyModal(id) {
      const p = getProduct(id);
      if (!p) return;
      pendingBuyId = id;
      if (buyModalText) buyModalText.textContent = 'Order the "' + p.name + '" (' + p.size + ') for ' + formatPrice(p.price) + ' now?';
      if (buyModal) buyModal.classList.add("is-open");
    }
    function closeBuyModal() {
      pendingBuyId = null;
      if (buyModal) buyModal.classList.remove("is-open");
    }
    if (buyCancel) buyCancel.addEventListener("click", closeBuyModal);
    if (buyModal) {
      buyModal.addEventListener("click", function (e) {
        if (e.target === buyModal) closeBuyModal();
      });
    }
    if (buyConfirm) {
      buyConfirm.addEventListener("click", function () {
        if (pendingBuyId == null) return;
        const p = getProduct(pendingBuyId);
        closeBuyModal();
        showToast('Order placed for "' + (p ? p.name : "bouquet") + '" — thank you!');
      });
    }

    /* ---- Checkout button (clears cart with confirmation toast) ---- */
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        const cart = getCart();
        if (cart.length === 0) {
          showToast("Your cart is empty");
          return;
        }
        clearCart();
        closeCart();
        showToast("Order placed! Thank you for shopping with Flowers Sayf");
      });
    }

    /* =========================================================
       TOAST
       ========================================================= */
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");
    let toastTimer = null;
    function showToast(message) {
      if (!toast) return;
      if (toastText) toastText.textContent = message;
      toast.classList.add("is-visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 2400);
    }

    /* =========================================================
       LOGOUT
       ========================================================= */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearSession();
        window.location.href = "login.html";
      });
    }

    /* =========================================================
       MOBILE NAV TOGGLE
       ========================================================= */
    const navToggle = document.getElementById("navToggle");
    const mainNav = document.getElementById("mainNav");
    if (navToggle && mainNav) {
      navToggle.addEventListener("click", function () {
        mainNav.classList.toggle("is-open");
      });
      mainNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mainNav.classList.remove("is-open");
        });
      });
    }

    /* =========================================================
       CONTACT FORM (front-end only — no backend)
       ========================================================= */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        contactForm.reset();
        showToast("Message sent! We'll get back to you shortly.");
      });
    }

    /* ---- Initial render ---- */
    renderProducts();
    renderCart();
  }
})();
