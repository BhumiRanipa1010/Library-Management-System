firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const name = user.displayName || 'User';
  const email = user.email;
  const initial = name.charAt(0).toUpperCase();

  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = email;

  const avatar = document.getElementById('profileAvatar');
  if (user.photoURL) {
    avatar.innerHTML = `<img src="${user.photoURL}" alt="profile">`;
  } else {
    avatar.textContent = initial;
  }

  document.getElementById('profileSection').style.display = 'block';

  loadUserBooks(user.uid);
});

function loadUserBooks(uid) {
  firebase.firestore().collection('borrowRequests')
    .where('userId', '==', uid)
    .onSnapshot(function(snapshot) {
      const all = [];
      snapshot.forEach(function(doc) {
        all.push({ id: doc.id, ...doc.data() });
      });

      const borrowed = all.filter(function(r) { return r.status === 'accepted' || r.status === 'return_pending'; });
      const returned = all.filter(function(r) { return r.status === 'returned'; });
      const pending  = all.filter(function(r) { return r.status === 'pending'; });
      const rejected = all.filter(function(r) { return r.status === 'rejected'; });
      const now      = new Date().getTime();
      const overdue  = borrowed.filter(function(r) { return r.dueDateTimestamp && now > r.dueDateTimestamp; });

      document.getElementById('statBorrowed').textContent = borrowed.length;
      document.getElementById('statReturned').textContent = returned.length;
      document.getElementById('statOverdue').textContent  = overdue.length;
      document.getElementById('statPending').textContent  = pending.length;

      renderList('borrowedList', borrowed, 'borrowed');
      renderList('returnedList', returned, 'returned');
      renderList('pendingList',  pending,  'pending');
      renderList('rejectedList', rejected, 'rejected');
    });
}

function renderList(containerId, items, type) {
  const container = document.getElementById(containerId);
  const now = new Date().getTime();

  if (items.length === 0) {
    container.innerHTML = '<p class="no-data-text">Nothing here yet.</p>';
    return;
  }

  container.innerHTML = items.map(function(item) {
    const isOverdue = item.dueDateTimestamp && now > item.dueDateTimestamp && item.status === 'accepted';

    let extraInfo = '';
    let returnBtn = '';

    if (type === 'borrowed') {
      // Show Return button only if not already return_pending
      if (item.status === 'accepted') {
        returnBtn = `<button class="return-btn" onclick="openReturnPopup('${item.id}')">↩ Return Book</button>`;
      }

      extraInfo = `
        <div class="book-row-meta">
          <span>Borrowed: ${item.borrowedAt || '-'}</span>
          <span>Due: <strong ${isOverdue ? 'style="color:red;"' : ''}>${item.dueDate || '-'}</strong></span>
          ${isOverdue ? '<span class="overdue-tag">⚠️ Overdue</span>' : ''}
          ${item.status === 'return_pending' ? '<span class="return-pending-tag">⏳ Return Pending</span>' : ''}
        </div>
        ${returnBtn}`;

    } else if (type === 'returned') {
      extraInfo = `
        <div class="book-row-meta">
          <span>Borrowed: ${item.borrowedAt || '-'}</span>
          <span>Returned: ${item.returnedAt || '-'}</span>
        </div>`;
    } else if (type === 'pending') {
      extraInfo = `
        <div class="book-row-meta">
          <span>Requested: ${item.requestedAt || '-'}</span>
        </div>`;
    } else if (type === 'rejected') {
      extraInfo = `
        <div class="book-row-meta">
          <span>Requested: ${item.requestedAt || '-'}</span>
        </div>`;
    }

    return `
      <div class="book-row ${isOverdue ? 'book-row-overdue' : ''}">
        <div class="book-row-cover">${item.bookTitle ? item.bookTitle.charAt(0).toUpperCase() : '?'}</div>
        <div class="book-row-info">
          <h3>${item.bookTitle || '-'}</h3>
          <p>${item.bookAuthor || '-'}</p>
          ${extraInfo}
        </div>
      </div>`;
  }).join('');
}

// ── Return Confirmation Popup ──────────────────────────────────────────────

let pendingReturnId = null;

function openReturnPopup(requestId) {
  pendingReturnId = requestId;
  document.getElementById('returnConfirmPopup').classList.add('show');
}

function closeReturnPopup() {
  pendingReturnId = null;
  document.getElementById('returnConfirmPopup').classList.remove('show');
}

function confirmReturnRequest() {
  if (!pendingReturnId) return;

  firebase.firestore().collection('borrowRequests').doc(pendingReturnId).update({
    status: 'return_pending'
  })
  .then(function() {
    closeReturnPopup();
    showToast('✅ Return request sent! Waiting for admin approval.');
  })
  .catch(function(error) {
    closeReturnPopup();
    showToast('❌ Error: ' + error.message, true);
  });
}

function showToast(message, isError) {
  const toast = document.getElementById('profileToast');
  toast.textContent = message;
  toast.style.background = isError ? '#c0392b' : '#2d6a4f';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ── Tab Switching ──────────────────────────────────────────────────────────

function switchTab(tab) {
  const tabs = ['borrowed', 'returned', 'pending', 'rejected'];
  tabs.forEach(function(t) {
    document.getElementById('tab-' + t).style.display = t === tab ? 'block' : 'none';
  });

  document.querySelectorAll('.tab-btn').forEach(function(btn, i) {
    btn.classList.toggle('active', tabs[i] === tab);
  });
}