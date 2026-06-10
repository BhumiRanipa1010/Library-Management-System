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

  function clearMessage() {
    document.getElementById('message').textContent = '';
  }

  document.getElementById('email').addEventListener('input', clearMessage);
  document.getElementById('password').addEventListener('input', clearMessage);

  // Check redirect result FIRST thing
  firebase.auth().getRedirectResult()
    .then(function(result) {
      if (result && result.user) {
        showSuccess('✅ Login successful! Redirecting...');
        window.location.replace('../index.html');
      }
    })
    .catch(function(error) {
      if (error.code !== 'auth/no-auth-event') {
        showError('❌ ' + error.message);
      }
    });

  // Also check if user is already signed in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.replace('../index.html');
    }
  });

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email)    { showError('❌ Please enter your email.');    return; }
    if (!password) { showError('❌ Please enter your password.'); return; }
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function() {
        showSuccess('✅ Login successful! Redirecting...');
        setTimeout(function() { window.location.replace('../index.html'); }, 500);
      })
      .catch(function(error) {
        if (error.code === 'auth/user-not-found')          showError('❌ No account found with this email.');
        else if (error.code === 'auth/wrong-password')     showError('❌ Incorrect password.');
        else if (error.code === 'auth/invalid-email')      showError('❌ Invalid email format.');
        else if (error.code === 'auth/invalid-credential') showError('❌ Invalid email or password.');
        else showError('❌ ' + error.message);
      });
  });

  document.getElementById('googleBtn').addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    firebase.auth().signInWithRedirect(provider);
  });

});