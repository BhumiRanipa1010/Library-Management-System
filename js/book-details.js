const bgColors = ['#2d6a4f','#1d3557','#5e4b8b','#b5452a','#2a6496','#5a7a3a','#7b3f00','#4a4e69'];

const params = new URLSearchParams(window.location.search);
const bookId = params.get('id');
let currentUser = null;
let currentBook = null;
let existingRequest = null;

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;

  if (!bookId) {
    window.location.href = '../index.html';
    return;
  }

  firebase.firestore().collection('books').doc(bookId).get()
    .then(function(doc) {
      if (!doc.exists) {
        window.location.href = '../index.html';
        return;
      }

      currentBook = { id: doc.id, ...doc.data() };
      renderBookDetails(currentBook);
      checkExistingRequest();
    })
    .catch(function() {
      window.location.href = '../index.html';
    });
});

function renderBookDetails(book) {
  const letter = book.title ? book.title.charAt(0).toUpperCase() : '?';
  const color = bgColors[letter.charCodeAt(0) % bgColors.length];

  document.getElementById('bookCoverLarge').style.background = color;
  document.getElementById('bookCoverLarge').textContent = letter;
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookAuthor').textContent = book.author;
  document.getElementById('bookGenre').textContent = book.genre;
  document.getElementById('bookGenre2').textContent = book.genre;
  document.getElementById('bookISBN').textContent = book.isbn || '-';
  document.getElementById('bookQty').textContent = book.quantity > 0 ? book.quantity + ' copies' : 'Not Available';

  const desc = book.description || '';
  if (desc.trim() !== '') {
    document.getElementById('bookDescription').textContent = desc;
    document.getElementById('bookDescriptionBox').style.display = 'block';
  } else {
    document.getElementById('bookDescriptionBox').style.display = 'none';
  }

  document.title = book.title + ' | LibraryHub';
  document.getElementById('detailsSection').style.display = 'block';
}

function checkExistingRequest() {
  firebase.firestore().collection('borrowRequests')
    .where('userId', '==', currentUser.uid)
    .where('bookId', '==', bookId)
    .get()
    .then(function(snapshot) {
      const btn = document.getElementById('borrowBtn');
      const statusBox = document.getElementById('borrowStatusBox');

      if (!snapshot.empty) {
        existingRequest = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        const status = existingRequest.status;

        if (status === 'pending') {
          btn.disabled = true;
          btn.textContent = 'Request Pending...';
          btn.style.background = '#e0a800';
          statusBox.style.display = 'block';
          statusBox.className = 'borrow-status status-pending';
          statusBox.textContent = '⏳ Your borrow request is pending admin approval.';

        } else if (status === 'accepted') {
          btn.disabled = true;
          btn.textContent = 'Already Borrowed';
          btn.style.background = '#2d6a4f';

          const now = new Date().getTime();
          const isOverdue = existingRequest.dueDateTimestamp && now > existingRequest.dueDateTimestamp;

          statusBox.style.display = 'block';

          if (isOverdue) {
            statusBox.className = 'borrow-status status-rejected';
            statusBox.textContent = '⚠️ Overdue! You were supposed to return this book by ' + existingRequest.dueDate + '. Please return it immediately.';
          } else {
            statusBox.className = 'borrow-status status-accepted';
            statusBox.textContent = '✅ Borrowed on: ' + existingRequest.borrowedAt + ' · Due by: ' + existingRequest.dueDate;
          }

          document.getElementById('returnBtn').style.display = 'inline-block';

        } else if (status === 'rejected') {
          btn.disabled = false;
          btn.textContent = 'Borrow Book';
          btn.style.background = '';
          statusBox.style.display = 'block';
          statusBox.className = 'borrow-status status-rejected';
          statusBox.textContent = '❌ Your request was rejected. You can request again.';

        } else if (status === 'return_pending') {
          btn.disabled = true;
          btn.textContent = 'Return Pending...';
          statusBox.style.display = 'block';
          statusBox.className = 'borrow-status status-pending';
          statusBox.textContent = '⏳ Your return request is pending admin approval.';
          document.getElementById('returnBtn').style.display = 'none';

        } else if (status === 'returned') {
          btn.disabled = false;
          btn.textContent = 'Borrow Again';
          btn.style.background = '';
          statusBox.style.display = 'block';
          statusBox.className = 'borrow-status status-accepted';
          statusBox.textContent = '✅ You have returned this book on ' + existingRequest.returnedAt + '.';
        }

      } else {
        if (currentBook.quantity <= 0) {
          btn.disabled = true;
          btn.textContent = 'Not Available';
        }
      }
    });
}

// ── Confirmation Modal Helper ──────────────────────────────────────────────
function showConfirmModal(options) {
  const modal     = document.getElementById('confirmModal');
  const okBtn     = document.getElementById('confirmOkBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');

  document.getElementById('confirmIcon').textContent    = options.icon    || '❓';
  document.getElementById('confirmTitle').textContent   = options.title   || 'Are you sure?';
  document.getElementById('confirmMessage').textContent = options.message || '';
  okBtn.textContent      = options.okText  || 'Yes';
  okBtn.style.background = options.okColor || '#1d3557';

  modal.style.display = 'flex';

  function close() {
    modal.style.display = 'none';
    okBtn.removeEventListener('click', onOk);
    cancelBtn.removeEventListener('click', onCancel);
    modal.removeEventListener('click', onBackdrop);
  }
  function onOk()        { close(); options.onConfirm(); }
  function onCancel()    { close(); }
  function onBackdrop(e) { if (e.target === modal) close(); }

  okBtn.addEventListener('click', onOk);
  cancelBtn.addEventListener('click', onCancel);
  modal.addEventListener('click', onBackdrop);
}

// ── Borrow Button ──────────────────────────────────────────────────────────
document.getElementById('borrowBtn').addEventListener('click', function() {
  if (!currentUser || !currentBook) return;

  showConfirmModal({
    icon:      '📚',
    title:     'Borrow this Book?',
    message:   'Are you sure you want to borrow "' + currentBook.title + '"? A request will be sent to the admin for approval.',
    okText:    'Yes, Borrow',
    okColor:   '#2a6496',
    onConfirm: function() {
      const msg = document.getElementById('borrowMsg');
      const btn = document.getElementById('borrowBtn');

      btn.disabled = true;
      btn.textContent = 'Sending...';

      firebase.firestore().collection('borrowRequests').add({
        userId:      currentUser.uid,
        userName:    currentUser.displayName || currentUser.email,
        userEmail:   currentUser.email,
        bookId:      bookId,
        bookTitle:   currentBook.title,
        bookAuthor:  currentBook.author,
        status:      'pending',
        requestedAt: new Date().toLocaleString(),
        createdAt:   firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function() {
        msg.style.color = 'green';
        msg.textContent = '✅ Borrow request sent! Waiting for admin approval.';
        btn.textContent = 'Request Pending...';
        btn.style.background = '#e0a800';

        const statusBox = document.getElementById('borrowStatusBox');
        statusBox.style.display = 'block';
        statusBox.className = 'borrow-status status-pending';
        statusBox.textContent = '⏳ Your borrow request is pending admin approval.';

        setTimeout(function() { msg.textContent = ''; }, 3000);
      })
      .catch(function(error) {
        msg.style.color = 'red';
        msg.textContent = '❌ Error: ' + error.message;
        btn.disabled = false;
        btn.textContent = 'Borrow Book';
      });
    }
  });
});

// ── Return Button ──────────────────────────────────────────────────────────
document.getElementById('returnBtn').addEventListener('click', function() {
  if (!existingRequest) return;

  showConfirmModal({
    icon:      '↩️',
    title:     'Return this Book?',
    message:   'Are you sure you want to return "' + currentBook.title + '"? A return request will be sent to the admin for approval.',
    okText:    'Yes, Return',
    okColor:   '#b5452a',
    onConfirm: function() {
      const msg = document.getElementById('borrowMsg');

      firebase.firestore().collection('borrowRequests').doc(existingRequest.id).update({
        status: 'return_pending'
      })
      .then(function() {
        msg.style.color = 'green';
        msg.textContent = '✅ Return request sent! Waiting for admin approval.';

        document.getElementById('returnBtn').style.display = 'none';

        const statusBox = document.getElementById('borrowStatusBox');
        statusBox.style.display = 'block';
        statusBox.className = 'borrow-status status-pending';
        statusBox.textContent = '⏳ Your return request is pending admin approval.';

        setTimeout(function() { msg.textContent = ''; }, 3000);
      })
      .catch(function(error) {
        msg.style.color = 'red';
        msg.textContent = '❌ Error: ' + error.message;
      });
    }
  });
});