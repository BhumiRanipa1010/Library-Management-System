let allBooks = [];
let allRequests = [];
let editingBookId = null;

firebase.auth().onAuthStateChanged(function(user) {
  if (user && user.email === ADMIN_EMAIL) {
    document.getElementById('adminSection').style.display = 'block';
    document.getElementById('accessPopup').classList.remove('show');
    loadBooks();
    loadRequests();
  } else {
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('accessPopup').classList.add('show');
  }
});

// ADD BOOK
document.getElementById('addBookForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title       = document.getElementById('title').value.trim();
  const author      = document.getElementById('author').value.trim();
  const genre       = document.getElementById('genre').value.trim();
  const quantity    = parseInt(document.getElementById('quantity').value);
  const isbn        = document.getElementById('isbn').value.trim();
  const description = document.getElementById('description').value.trim();
  const msg         = document.getElementById('addMsg');
  const btn         = document.querySelector('.admin-btn');

  btn.disabled = true;
  btn.textContent = 'Adding...';

  firebase.firestore().collection('books').add({
    title, author, genre, quantity, isbn, description,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(function() {
    msg.style.color = 'green';
    msg.textContent = '✅ Book added successfully!';
    document.getElementById('addBookForm').reset();
    btn.disabled = false;
    btn.textContent = 'Add Book';
    setTimeout(function() { msg.textContent = ''; }, 3000);
  })
  .catch(function(error) {
    msg.style.color = 'red';
    msg.textContent = '❌ Error: ' + error.message;
    btn.disabled = false;
    btn.textContent = 'Add Book';
  });
});

// LOAD BOOKS
function loadBooks() {
  firebase.firestore().collection('books')
    .orderBy('createdAt', 'desc')
    .onSnapshot(function(snapshot) {
      allBooks = [];
      snapshot.forEach(function(doc) {
        allBooks.push({ id: doc.id, ...doc.data() });
      });
      updateStats();
      renderTable(allBooks);
    });
}

// RENDER BOOKS TABLE
function renderTable(books) {
  const tbody = document.getElementById('booksTableBody');

  if (books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No books found.</td></tr>';
    return;
  }

  tbody.innerHTML = books.map(function(book, index) {
    return `<tr>
      <td>${index + 1}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.genre}</td>
      <td>${book.quantity}</td>
      <td>${book.isbn}</td>
      <td>
        <button class="edit-btn" onclick="openEditPopup('${book.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteBook('${book.id}')">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

// UPDATE STATS
function updateStats() {
  document.getElementById('totalBooks').textContent = allBooks.length;
  const genres = new Set(allBooks.map(function(b) { return b.genre; }));
  document.getElementById('totalGenres').textContent = genres.size;
  const totalQty = allBooks.reduce(function(sum, b) { return sum + (b.quantity || 0); }, 0);
  document.getElementById('totalQuantity').textContent = totalQty;
}

// SEARCH BOOKS
function searchBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allBooks.filter(function(book) {
    return book.title.toLowerCase().includes(query) ||
           book.author.toLowerCase().includes(query);
  });
  renderTable(filtered);
}

// DELETE BOOK
function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  firebase.firestore().collection('books').doc(id).delete()
    .catch(function(error) {
      alert('Error deleting: ' + error.message);
    });
}

// OPEN EDIT POPUP
function openEditPopup(id) {
  const book = allBooks.find(function(b) { return b.id === id; });
  if (!book) return;

  editingBookId = id;
  document.getElementById('editTitle').value       = book.title || '';
  document.getElementById('editAuthor').value      = book.author || '';
  document.getElementById('editGenre').value       = book.genre || '';
  document.getElementById('editQuantity').value    = book.quantity || '';
  document.getElementById('editISBN').value        = book.isbn || '';
  document.getElementById('editDescription').value = book.description || '';
  document.getElementById('editMsg').textContent   = '';

  document.getElementById('editPopup').classList.add('show');
}

// CLOSE EDIT POPUP
function closeEditPopup() {
  document.getElementById('editPopup').classList.remove('show');
  editingBookId = null;
}

// SAVE EDIT
function saveEdit() {
  if (!editingBookId) return;

  const title       = document.getElementById('editTitle').value.trim();
  const author      = document.getElementById('editAuthor').value.trim();
  const genre       = document.getElementById('editGenre').value.trim();
  const quantity    = parseInt(document.getElementById('editQuantity').value);
  const isbn        = document.getElementById('editISBN').value.trim();
  const description = document.getElementById('editDescription').value.trim();
  const msg         = document.getElementById('editMsg');

  if (!title || !author || !genre || !quantity || !isbn) {
    msg.style.color = 'red';
    msg.textContent = '❌ Please fill all required fields.';
    return;
  }

  firebase.firestore().collection('books').doc(editingBookId).update({
    title, author, genre, quantity, isbn, description
  })
  .then(function() {
    closeEditPopup();
  })
  .catch(function(error) {
    msg.style.color = 'red';
    msg.textContent = '❌ Error: ' + error.message;
  });
}

// LOAD BORROW REQUESTS
function loadRequests() {
  firebase.firestore().collection('borrowRequests')
    .orderBy('createdAt', 'desc')
    .onSnapshot(function(snapshot) {
      allRequests = [];
      snapshot.forEach(function(doc) {
        allRequests.push({ id: doc.id, ...doc.data() });
      });
      renderRequests(allRequests);
    });
}

// FILTER REQUESTS
function filterRequests() {
  const filter = document.getElementById('requestFilter').value;
  if (filter === 'all') {
    renderRequests(allRequests);
  } else {
    renderRequests(allRequests.filter(function(r) { return r.status === filter; }));
  }
}

// RENDER REQUESTS TABLE
function renderRequests(requests) {
  const tbody = document.getElementById('requestsTableBody');

  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="no-data">No requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(function(req, index) {

    let statusBadge = '';
    if (req.status === 'pending')        statusBadge = '<span class="badge badge-pending">Pending</span>';
    if (req.status === 'accepted')       statusBadge = '<span class="badge badge-accepted">Accepted</span>';
    if (req.status === 'rejected')       statusBadge = '<span class="badge badge-rejected">Rejected</span>';
    if (req.status === 'return_pending') statusBadge = '<span class="badge badge-pending">Return Pending</span>';
    if (req.status === 'returned')       statusBadge = '<span class="badge badge-returned">Returned</span>';

    const isOverdue = req.status === 'accepted' &&
                      req.dueDateTimestamp &&
                      new Date().getTime() > req.dueDateTimestamp;

    const overdueWarning = isOverdue
      ? '<br><span style="color:red;font-size:0.78rem;font-weight:600;">⚠️ Overdue!</span>'
      : '';

    let actions = '';
    if (req.status === 'pending') {
      actions = `
        <button class="edit-btn" onclick="acceptRequest('${req.id}', '${req.bookId}')">Accept</button>
        <button class="delete-btn" onclick="rejectRequest('${req.id}')">Reject</button>`;
    } else if (req.status === 'return_pending') {
      actions = `
        <button class="edit-btn" onclick="confirmReturn('${req.id}', '${req.bookId}')">Confirm Return</button>`;
    } else {
      actions = '<span style="opacity:.4;font-size:0.85rem;">No action</span>';
    }

    return `<tr ${isOverdue ? 'style="background:rgba(255,0,0,0.05);"' : ''}>
      <td>${index + 1}</td>
      <td>${req.userName || '-'}</td>
      <td>${req.userEmail || '-'}</td>
      <td>${req.bookTitle || '-'}</td>
      <td>${req.bookAuthor || '-'}</td>
      <td>${req.requestedAt || '-'}</td>
      <td>${req.borrowedAt || '-'}</td>
      <td>${req.dueDate || '-'}${overdueWarning}</td>
      <td>${req.returnedAt || '-'}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

// ACCEPT REQUEST
function acceptRequest(requestId, bookId) {
  const db = firebase.firestore();
  const now = new Date();
  const borrowedAt = now.toLocaleString();

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateStr = dueDate.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  db.collection('borrowRequests').doc(requestId).update({
    status: 'accepted',
    borrowedAt: borrowedAt,
    dueDate: dueDateStr,
    dueDateTimestamp: dueDate.getTime()
  })
  .then(function() {
    return db.collection('books').doc(bookId).update({
      quantity: firebase.firestore.FieldValue.increment(-1)
    });
  })
  .catch(function(error) {
    alert('Error accepting request: ' + error.message); // ✅ added catch
  });
}

// REJECT REQUEST
function rejectRequest(requestId) {
  firebase.firestore().collection('borrowRequests').doc(requestId).update({
    status: 'rejected'
  })
  .catch(function(error) {
    alert('Error: ' + error.message);
  });
}

// CONFIRM RETURN
function confirmReturn(requestId, bookId) {
  const db = firebase.firestore();
  const returnedAt = new Date().toLocaleString();

  db.collection('borrowRequests').doc(requestId).update({
    status: 'returned',
    returnedAt: returnedAt
  })
  .then(function() {
    return db.collection('books').doc(bookId).update({
      quantity: firebase.firestore.FieldValue.increment(1)
    });
  })
  .catch(function(error) {
    alert('Error confirming return: ' + error.message); // ✅ added catch
  });
}