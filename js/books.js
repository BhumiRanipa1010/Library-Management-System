const bgColors = ['#2d6a4f','#1d3557','#5e4b8b','#b5452a','#2a6496','#5a7a3a','#7b3f00','#4a4e69'];

let allBooks    = [];
let currentUser = null;

/* ── Auth ── */
firebase.auth().onAuthStateChanged(function(user) {
  currentUser = user;
});

/* ── Fetch all books (real-time) ── */
firebase.firestore().collection('books')
  .orderBy('createdAt', 'desc')
  .onSnapshot(function(snapshot) {
    allBooks = [];
    snapshot.forEach(function(doc) {
      allBooks.push({ id: doc.id, ...doc.data() });
    });
    buildGenreFilter(allBooks);
    applyFilters();
  }, function() {
    document.getElementById('bookGrid').innerHTML =
      '<p style="text-align:center;color:var(--text);opacity:.6;width:100%;">Could not load books. Please try again.</p>';
  });

/* ── Populate genre dropdown ── */
function buildGenreFilter(books) {
  const select  = document.getElementById('genreFilter');
  const current = select.value;
  const genres  = [...new Set(books.map(b => b.genre).filter(Boolean))].sort();

  select.innerHTML = '<option value="">All Genres</option>' +
    genres.map(g =>
      `<option value="${g}"${g === current ? ' selected' : ''}>${g}</option>`
    ).join('');
}

/* ── Filter + sort + render ── */
function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const genre = document.getElementById('genreFilter').value;
  const sort  = document.getElementById('sortFilter').value;

  let filtered = allBooks.filter(function(book) {
    const matchSearch =
      !query ||
      (book.title  && book.title.toLowerCase().includes(query))  ||
      (book.author && book.author.toLowerCase().includes(query)) ||
      (book.genre  && book.genre.toLowerCase().includes(query));
    const matchGenre = !genre || book.genre === genre;
    return matchSearch && matchGenre;
  });

  if (sort === 'oldest') {
    filtered = filtered.slice().reverse();
  } else if (sort === 'az') {
    filtered = filtered.slice().sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sort === 'za') {
    filtered = filtered.slice().sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  }
  // 'newest' = default Firestore order (createdAt desc)

  renderBooks(filtered);
}

/* ── Render ── */
function renderBooks(books) {
  const grid = document.getElementById('bookGrid');
  const info = document.getElementById('resultsInfo');

  info.textContent = books.length
    ? `Showing ${books.length} book${books.length !== 1 ? 's' : ''}`
    : '';

  if (books.length === 0) {
    grid.innerHTML =
      '<p style="text-align:center;color:var(--text);opacity:.6;width:100%;">No books found.</p>';
    return;
  }

  grid.innerHTML = books.map(function(book) {
    const letter = book.title ? book.title.charAt(0).toUpperCase() : '?';
    const color  = bgColors[letter.charCodeAt(0) % bgColors.length];

    return `<div class="book-card">
      <div class="book-cover" style="background:${color};">${letter}</div>
      <h3>${book.title || 'Untitled'}</h3>
      <p class="book-author">${book.author || 'Unknown Author'}</p>
      <p class="book-meta">${book.genre || '—'} &nbsp;·&nbsp; Qty: ${book.quantity ?? '—'}</p>
      <button onclick="handleViewDetails('${book.id}')">View Details</button>
    </div>`;
  }).join('');
}

/* ── View details (login guard) ── */
function handleViewDetails(bookId) {
  if (currentUser) {
    window.location.href = 'book-details.html?id=' + bookId;
  } else {
    document.getElementById('loginPopup').classList.add('show');
  }
}

/* ── Popup ── */
function closeLoginPopup() {
  document.getElementById('loginPopup').classList.remove('show');
}

document.getElementById('loginPopup').addEventListener('click', function(e) {
  if (e.target === this) closeLoginPopup();
});