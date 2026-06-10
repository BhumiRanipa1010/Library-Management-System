window.addEventListener('load', function() {

  function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
  }
  window.togglePassword = togglePassword;

  function showError(msg) {
    const el = document.getElementById('message');
    el.style.color = 'red';
    el.textContent = msg;
  }

  function showSuccess(msg) {
    const el = document.getElementById('message');
    el.style.color = 'green';
    el.textContent = msg;
  }

  function validatePassword(p) {
    if (p.length < 8)            return '❌ Password must be at least 8 characters.';
    if (!/[A-Z]/.test(p))        return '❌ Must include at least one uppercase letter.';
    if (!/[a-z]/.test(p))        return '❌ Must include at least one lowercase letter.';
    if (!/[0-9]/.test(p))        return '❌ Must include at least one number.';
    if (!/[^A-Za-z0-9]/.test(p)) return '❌ Must include at least one symbol (@, #, !, $).';
    return null;
  }

  document.getElementById('password').addEventListener('blur', function() {
    const err = validatePassword(this.value);
    if (err) { showError(err); this.focus(); }
    else document.getElementById('message').textContent = '';
  });

  // Check redirect result FIRST thing
  firebase.auth().getRedirectResult()
    .then(function(result) {
      if (result && result.user) {
        showSuccess('✅ Account created! Redirecting...');
        window.location.replace('../index.html');
      }
    })
    .catch(function(error) {
      if (error.code !== 'auth/no-auth-event') {
        showError('❌ ' + error.message);
      }
    });

  // Also check if user already signed in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.replace('../index.html');
    }
  });

  document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name            = document.getElementById('name').value.trim();
    const email           = document.getElementById('email').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const err = validatePassword(password);
    if (err) { showError(err); return; }
    if (password !== confirmPassword) { showError('❌ Passwords do not match.'); return; }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        return userCredential.user.updateProfile({ displayName: name });
      })
      .then(function() {
        showSuccess('✅ Account created! Redirecting...');
        setTimeout(function() { window.location.replace('login.html'); }, 500);
      })
      .catch(function(error) {
        if (error.code === 'auth/email-already-in-use') showError('❌ This email is already registered.');
        else showError('❌ ' + error.message);
      });
  });

  document.getElementById('googleBtn').addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    firebase.auth().signInWithRedirect(provider);
  });

});