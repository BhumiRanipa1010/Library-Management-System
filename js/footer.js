(function () {
  const isPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  const root = isPages ? '../' : './';

  const footerHTML = `
<footer class="footer">

  <div class="footer-top">

    <div class="footer-brand">
      <h2>📚 LibraryHub</h2>
      <p>Your digital space to discover, explore and manage books with ease.</p>
    </div>

    <div class="footer-col">
      <h4>Quick Links</h4>
      <a href="${root}index.html">Home</a>
      <a href="${root}pages/books.html">All Books</a>
      <a href="${root}pages/contact.html">Contact Us</a>
    </div>

    <div class="footer-col">
      <h4>Account</h4>
      <a href="${root}pages/login.html">Login</a>
      <a href="${root}pages/signup.html">Sign Up</a>
      <a href="${root}pages/profile.html">My Profile</a>
    </div>

    <div class="footer-col">
      <h4>Get In Touch</h4>
      <p class="footer-contact-item">📧 libraryhub@gmail.com</p>
      <p class="footer-contact-item">📞 +91 799087847</p>
      <p class="footer-contact-item">🕐 Mon – Fri, 9am – 6pm</p>
    </div>

  </div>

  <div class="footer-divider"></div>

  <div class="footer-bottom">
    <p>© 2026 LibraryHub. All rights reserved.</p>
    <div class="footer-bottom-links">
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>
    </div>
  </div>

</footer>`;

  const container = document.getElementById('footer-container');
  if (container) container.innerHTML = footerHTML;
})();