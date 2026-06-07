function goBack() {
  window.history.back();
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById('contactSection').style.display = 'block';
    document.getElementById('popupOverlay').classList.remove('show');

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    if (user.displayName) nameInput.value = user.displayName;
    if (user.email) emailInput.value = user.email;

  } else {
    document.getElementById('contactSection').style.display = 'none';
    document.getElementById('popupOverlay').classList.add('show');
  }
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  const msg = document.getElementById('contactMsg');
  const btn = document.querySelector('.contact-btn');

  if (!name || !email || !subject || !message) {
    msg.style.color = 'red';
    msg.textContent = '❌ Please fill all fields.';
    return;
  }

  // Disable button while sending
  btn.disabled = true;
  btn.textContent = 'Sending...';

  const db = firebase.firestore();

  db.collection('users').doc(firebase.auth().currentUser.uid).collection('contacts').add({
    name: name,
    email: email,
    subject: subject,
    message: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(function() {
    msg.style.color = 'green';
    msg.textContent = '✅ Message sent successfully! We will get back to you soon.';

    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';

    btn.disabled = false;
    btn.textContent = 'Send Message';

    setTimeout(function() {
      msg.textContent = '';
    }, 4000);
  })
  .catch(function(error) {
    msg.style.color = 'red';
    msg.textContent = '❌ Failed to send message. Please try again.';

    btn.disabled = false;
    btn.textContent = 'Send Message';
  });
});