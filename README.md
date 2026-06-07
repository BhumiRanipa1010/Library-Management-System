# 📚 LibraryHub - Library Management System

A modern web-based Library Management System built using **HTML, CSS, JavaScript, Firebase Authentication, and Firestore Database**. The platform allows users to browse books, request borrowing, manage profiles, and enables administrators to manage books and borrowing requests efficiently.

---

## 🚀 Features

### 👤 User Features

- User Registration & Login
- Google Authentication
- Secure Password Validation
- Browse Available Books
- Search Books by Title, Author, or Genre
- Filter Books by Genre
- Sort Books Alphabetically or by Date
- View Detailed Book Information
- Request Book Borrowing
- Track Borrow Requests Status
- Return Borrowed Books
- User Profile Dashboard
- View Borrowed, Returned, Pending, and Rejected Requests
- Overdue Book Tracking

### 🛠️ Admin Features

- Admin Authentication
- Add New Books
- Edit Existing Books
- Delete Books
- Manage Book Inventory
- View Borrow Requests
- Approve Borrow Requests
- Reject Borrow Requests
- Approve Return Requests
- Dashboard Statistics
  - Total Books
  - Total Genres
  - Total Quantity

### 🎨 UI Features

- Responsive Design
- Modern Dashboard Interface
- Dark/Light Theme Support
- Dynamic Book Cards
- Real-time Data Updates using Firestore
- Reusable Navbar and Footer Components

---

## 🏗️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### Backend & Database

- Firebase Authentication
- Firebase Firestore

### Authentication

- Email & Password Login
- Google Sign-In

---

## 📂 Project Structure

```bash
Library Management System/
│
├── components/
│   ├── navbar.html
│   └── footer.html
│
├── css/
│   ├── admin.css
│   ├── books.css
│   ├── contact.css
│   ├── login.css
│   ├── profile.css
│   ├── signup.css
│   ├── style.css
│   └── theme.css
│
├── js/
│   ├── firebase-config.js
│   ├── admin.js
│   ├── books.js
│   ├── book-details.js
│   ├── login.js
│   ├── signup.js
│   ├── profile.js
│   ├── navbar.js
│   ├── footer.js
│   └── theme.js
│
├── pages/
│   ├── admin.html
│   ├── books.html
│   ├── book-details.html
│   ├── contact.html
│   ├── login.html
│   ├── profile.html
│   └── signup.html
│
└── index.html
```

---

## 🔥 Firebase Configuration

Create a Firebase project and enable:

### Authentication

Enable:

- Email/Password Authentication
- Google Authentication

### Firestore Database

Create Firestore Database in Production/Test Mode.

Replace the configuration inside:

```javascript
js/firebase-config.js
```

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🗄️ Firestore Collections

### books

```javascript
{
  title: "Atomic Habits",
  author: "James Clear",
  genre: "Self Help",
  quantity: 10,
  isbn: "1234567890",
  description: "Book description",
  createdAt: Timestamp
}
```

### borrowRequests

```javascript
{
  userId: "uid",
  userName: "John Doe",
  userEmail: "john@example.com",

  bookId: "bookId",
  bookTitle: "Atomic Habits",

  status: "pending",

  borrowedAt: "",
  dueDate: "",
  dueDateTimestamp: 0,

  returnedAt: ""
}
```

---

## 🔐 Admin Access

Admin privileges are controlled through a predefined admin email.

Example:

```javascript
const ADMIN_EMAIL = "admin@example.com";
```

Only the configured admin can:

- Add Books
- Edit Books
- Delete Books
- Approve Borrow Requests
- Reject Borrow Requests
- Manage Returns

---

## 📖 Borrowing Workflow

### User

1. Login
2. Browse Books
3. Open Book Details
4. Request Borrow

### Admin

1. Review Request
2. Approve or Reject

### Approved Request

- Due date is assigned
- Book quantity decreases

### Return Process

1. User requests return
2. Admin approves return
3. Quantity increases automatically
4. Request status changes to Returned

---

## 🧪 Running Locally

### Option 1: VS Code Live Server

1. Clone repository

```bash
git clone https://github.com/yourusername/library-management-system.git
```

2. Open project in VS Code

3. Install Live Server extension

4. Start Live Server

### Option 2: Any Static Hosting

Deploy on:

- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages (Frontend only)

---

## 📸 Screens Included

- Home Page
- Books Listing
- Book Details
- Login Page
- Signup Page
- Profile Dashboard
- Admin Dashboard
- Contact Page

---

## 🔮 Future Improvements

- Book Cover Upload
- Fine Calculation System
- Email Notifications
- QR Code Based Borrowing
- Multi-Admin Support
- Book Reservation System
- Advanced Analytics Dashboard
- User Reviews & Ratings
- PDF Export Reports

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed as a Library Management System project using Firebase and JavaScript.

If you found this project helpful, consider giving it a ⭐ on GitHub.