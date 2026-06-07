(function () {
  const isPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  const root = isPages ? '../' : './';

  /* ── Build navbar HTML ── */
  function renderNavbar(user) {
    const authSection = user
      ? `<li class="profile-wrapper">
           <div class="profile-icon" onclick="toggleDropdown()">
             ${user.photoURL
               ? `<img src="${user.photoURL}" alt="profile">`
               : `<div class="profile-initials">${(user.displayName || user.email)[0].toUpperCase()}</div>`
             }
           </div>
           <div class="profile-dropdown" id="profileDropdown">
             <div class="profile-info">
               <strong>${user.displayName || 'User'}</strong>
               <span>${user.email}</span>
             </div>
             <hr>
             <a href="${root}pages/admin.html">🛠 Admin Panel</a>
             <a href="${root}pages/profile.html">👤 My Profile</a>
             <a href="javascript:void(0)" onclick="window.confirmLogout()">🚪 Logout</a>
           </div>
         </li>`
      : `<li><a href="${root}pages/login.html" class="auth-btn">Login / Signup</a></li>`;

    const navbarHTML = `
<!-- Backdrop for mobile menu -->
<div class="nav-backdrop" id="navBackdrop" onclick="closeMenu()"></div>

<nav class="navbar">
  <a href="${root}index.html" class="logo">📚 LibraryHub</a>

  <ul class="nav-links" id="navLinks">
    <li><a href="${root}index.html" onclick="closeMenu()">Home</a></li>
    <li><a href="${root}pages/books.html" onclick="closeMenu()">Books</a></li>
    <li><a href="${root}pages/contact.html" onclick="closeMenu()">Contact</a></li>
    <li><span class="theme-icon" onclick="toggleTheme()" id="themeIcon">🌙</span></li>
    ${authSection}
  </ul>

  <!-- Hamburger -->
  <button class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Toggle menu">
    <span></span>
    <span></span>
    <span></span>
  </button>
</nav>`;

    const container = document.getElementById('navbar-container');
    if (container) container.innerHTML = navbarHTML;
  }

  /* ── Hamburger toggle ── */
  function toggleMenu() {
    const nav      = document.getElementById('navLinks');
    const burger   = document.getElementById('hamburger');
    const backdrop = document.getElementById('navBackdrop');
    const isOpen   = nav && nav.classList.contains('open');

    if (isOpen) {
      closeMenu();
    } else {
      nav      && nav.classList.add('open');
      burger   && burger.classList.add('open');
      backdrop && backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMenu() {
    const nav      = document.getElementById('navLinks');
    const burger   = document.getElementById('hamburger');
    const backdrop = document.getElementById('navBackdrop');

    nav      && nav.classList.remove('open');
    burger   && burger.classList.remove('open');
    backdrop && backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  /* ── Profile dropdown (desktop only) ── */
  function toggleDropdown() {
    if (window.innerWidth > 768) {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.classList.toggle('show');
    }
  }

  /* ── Close dropdown when clicking outside ── */
  document.addEventListener('click', function (e) {
    if (window.innerWidth > 768) {
      const wrapper = document.querySelector('.profile-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.classList.remove('show');
      }
    }
  });

  /* ── Close menu on resize to desktop ── */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMenu();
  });

  /* ── Logout confirmation modal ── */
  function injectLogoutModal() {
    if (document.getElementById('logoutConfirmModal')) return;

    const modal = document.createElement('div');
    modal.id = 'logoutConfirmModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 99999;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(3px);
    `;

    modal.innerHTML = `
      <div style="
        background: var(--card, #fff);
        border-radius: 20px;
        padding: 36px 32px 28px;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        text-align: center;
      ">
        <div style="font-size: 2.8rem; margin-bottom: 12px;">🚪</div>
        <h3 style="margin: 0 0 10px; font-size: 1.2rem; font-weight: 700; color: var(--text, #222);">Logout?</h3>
        <p style="margin: 0 0 28px; font-size: .95rem; color: var(--text, #555); opacity:.7; line-height: 1.6;">Are you sure you want to logout?</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="logoutCancelBtn" style="
            padding: 11px 28px; border-radius: 12px; border: none;
            background: #6c757d; color: #fff; font-size: .95rem;
            font-weight: 600; cursor: pointer;">Cancel</button>
          <button id="logoutOkBtn" style="
            padding: 11px 28px; border-radius: 12px; border: none;
            background: #e63946; color: #fff; font-size: .95rem;
            font-weight: 600; cursor: pointer;">Yes, Logout</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    document.getElementById('logoutCancelBtn').addEventListener('click', function () {
      modal.style.display = 'none';
    });

    document.getElementById('logoutOkBtn').addEventListener('click', function () {
      modal.style.display = 'none';
      firebase.auth().signOut().then(function () {
        window.location.href = root + 'index.html';
      });
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function confirmLogout() {
    closeMenu();
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.remove('show');
    injectLogoutModal();
    document.getElementById('logoutConfirmModal').style.display = 'flex';
  }

  /* ── Expose globals ── */
  window.toggleMenu    = toggleMenu;
  window.closeMenu     = closeMenu;
  window.toggleDropdown = toggleDropdown;
  window.confirmLogout  = confirmLogout;

  /* ── Init ── */
  if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged(function (user) {
      renderNavbar(user);
    });
  } else {
    renderNavbar(null);
  }
})();