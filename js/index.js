let allHomeBooks = [];
let currentUser = null;

const bgColors = ['#2d6a4f','#1d3557','#5e4b8b','#b5452a','#2a6496','#5a7a3a','#7b3f00','#4a4e69'];

firebase.auth().onAuthStateChanged(function(user) {
  currentUser = user;
});

firebase.firestore().collection('books')
  .orderBy('createdAt', 'desc')
  .onSnapshot(function(snapshot) {
    allHomeBooks = [];
    snapshot.forEach(function(doc) {
      allHomeBooks.push({ id: doc.id, ...doc.data() });
    });
    renderHomeBooks(allHomeBooks);
  }, function() {
    document.getElementById('bookGrid').innerHTML =
      '<p style="text-align:center;color:var(--text);opacity:.6;width:100%;">Could not load books. Please try again.</p>';
  });

function renderHomeBooks(books) {
  const grid = document.getElementById('bookGrid');

  if (books.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text);opacity:.6;width:100%;">No books available yet.</p>';
    return;
  }

  // Show only first 8 books
  const preview = books.slice(0, 8);

  grid.innerHTML = preview.map(function(book) {
    const letter = book.title ? book.title.charAt(0).toUpperCase() : '?';
    const color  = bgColors[letter.charCodeAt(0) % bgColors.length];

    return `<div class="book-card">
      <div class="book-cover" style="background:${color};">${letter}</div>
      <h3>${book.title}</h3>
      <p class="book-author">${book.author}</p>
      <p class="book-meta">${book.genre} &nbsp;·&nbsp; Qty: ${book.quantity}</p>
      <button onclick="handleViewDetails('${book.id}')">View Details</button>
    </div>`;
  }).join('');

  // Show "Explore All Books" button if there are more than 8
  const existing = document.getElementById('exploreBtn');
  if (existing) existing.remove();

  if (books.length > 0) {
    const btn = document.createElement('div');
    btn.id = 'exploreBtn';
    btn.innerHTML = `
      <a href="pages/books.html" class="explore-btn">
        Explore All Books ${books.length > 8 ? '(' + books.length + ')' : ''}  →
      </a>
    `;
    grid.parentElement.appendChild(btn);
  }
}

function handleViewDetails(bookId) {
  if (currentUser) {
    window.location.href = 'pages/book-details.html?id=' + bookId;
  } else {
    document.getElementById('loginPopup').classList.add('show');
  }
}

function handleSearch() {
  if (currentUser) {
    filterBooks();
  } else {
    document.getElementById('loginPopup').classList.add('show');
  }
}

function filterBooks() {
  const query = document.getElementById('homeSearch').value.toLowerCase().trim();
  if (!query) {
    renderHomeBooks(allHomeBooks);
    return;
  }
  const filtered = allHomeBooks.filter(function(book) {
    return book.title.toLowerCase().includes(query) ||
           book.author.toLowerCase().includes(query) ||
           (book.genre && book.genre.toLowerCase().includes(query));
  });
  renderHomeBooks(filtered);
}

function closeLoginPopup() {
  document.getElementById('loginPopup').classList.remove('show');
}

document.getElementById('loginPopup').addEventListener('click', function(e) {
  if (e.target === this) closeLoginPopup();
});