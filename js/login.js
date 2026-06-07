function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showError(msg) {
  const message = document.getElementById('message');
  message.style.color = 'red';
  message.textContent = msg;
}

function showSuccess(msg) {
  const message = document.getElementById('message');
  message.style.color = 'green';
  message.textContent = msg;
}

function clearMessage() {
  document.getElementById('message').textContent = '';
}

document.getElementById('email').addEventListener('input', clearMessage);
document.getElementById('password').addEventListener('input', clearMessage);

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (email === '') {
    showError('❌ Please enter your email.');
    return;
  }
  if (password === '') {
    showError('❌ Please enter your password.');
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function() {
      showSuccess('✅ Login successful! Redirecting...');
      setTimeout(function() {
        window.location.href = '../index.html';
      }, 500);
    })
    .catch(function(error) {
      if (error.code === 'auth/user-not-found') {
        showError('❌ No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        showError('❌ Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        showError('❌ Invalid email format.');
      } else if (error.code === 'auth/invalid-credential') {
        showError('❌ Invalid email or password.');
      } else {
        showError('❌ ' + error.message);
      }
    });
});

// Google Sign in
document.getElementById('googleBtn').addEventListener('click', function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function() {
      showSuccess('✅ Login successful! Redirecting...');
      setTimeout(function() {
        window.location.href = '../index.html';
      }, 500);
    })
    .catch(function(error) {
      showError('❌ ' + error.message);
    });
});