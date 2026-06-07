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

document.getElementById('password').addEventListener('blur', function() {
  const password = this.value;

  if (password.length < 8) {
    showError('❌ Password must be at least 8 characters.');
    this.focus();
    return;
  }
  if (!/[A-Z]/.test(password)) {
    showError('❌ Must include at least one uppercase letter (A-Z).');
    this.focus();
    return;
  }
  if (!/[a-z]/.test(password)) {
    showError('❌ Must include at least one lowercase letter (a-z).');
    this.focus();
    return;
  }
  if (!/[0-9]/.test(password)) {
    showError('❌ Must include at least one number (0-9).');
    this.focus();
    return;
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    showError('❌ Must include at least one symbol (e.g. @, #, !, $).');
    this.focus();
    return;
  }

  document.getElementById('message').textContent = '';
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password.length < 8) {
    showError('❌ Password must be at least 8 characters.');
    document.getElementById('password').focus();
    return;
  }
  if (!/[A-Z]/.test(password)) {
    showError('❌ Must include at least one uppercase letter (A-Z).');
    document.getElementById('password').focus();
    return;
  }
  if (!/[a-z]/.test(password)) {
    showError('❌ Must include at least one lowercase letter (a-z).');
    document.getElementById('password').focus();
    return;
  }
  if (!/[0-9]/.test(password)) {
    showError('❌ Must include at least one number (0-9).');
    document.getElementById('password').focus();
    return;
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    showError('❌ Must include at least one symbol (e.g. @, #, !, $).');
    document.getElementById('password').focus();
    return;
  }
  if (password !== confirmPassword) {
    showError('❌ Passwords do not match.');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      return userCredential.user.updateProfile({ displayName: name });
    })
    .then(function() {
      showSuccess('✅ Account created! Redirecting to login...');
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 500);
    })
    .catch(function(error) {
      if (error.code === 'auth/email-already-in-use') {
        showError('❌ This email is already registered. Please login.');
      } else {
        showError('❌ ' + error.message);
      }
    });
});

// Google Sign up
document.getElementById('googleBtn').addEventListener('click', function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function() {
      showSuccess('✅ Account created! Redirecting...');
      setTimeout(function() {
        window.location.href = '../index.html';
      }, 500);
    })
    .catch(function(error) {
      showError('❌ ' + error.message);
    });
});