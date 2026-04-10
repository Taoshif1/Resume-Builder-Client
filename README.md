# 🚀 AI-Powered Resume Builder (MERN)

A next-generation resume assembly platform designed to move beyond static forms. This project focuses on **Atomic Content**, **Real-time ATS feedback**, and **Dynamic Canvas** editing using the **MERN** stack.

---

## 🏗️ Tech Stack & Dependencies

### Frontend
*   **React 19 (Vite)**: High-performance frontend library.
*   **React Router 7**: Declarative routing for seamless navigation.
*   **Axios**: Efficient API handling for backend communication.

### Styling & UI
*   **Tailwind CSS 4**: Utility-first styling engine.
*   **DaisyUI 5**: Accessible and customizable UI component library.

### Backend (MERN Architecture)
*   **MongoDB**: Flexible NoSQL database for polymorphic resume data.
*   **Express.js**: Minimalist web framework for the API layer.
*   **Node.js**: Scalable JavaScript runtime for server-side logic.

---

## 📏 Standards & Conventions

### 🌿 Branch Naming
We strictly follow **kebab-case** naming with descriptive prefixes:
*   `feat/` : New features (e.g., `feat/drag-and-drop-editor`)
*   `fix/` : Bug fixes (e.g., `fix/auth-token-expiry`)
*   `refactor/` : Code restructuring (e.g., `refactor/api-services`)
*   `chore/` : Tooling or dependency updates (e.g., `chore/update-tailwind`)

### ⚛️ Component Naming
All React components use **PascalCase**:
*   ✅ `Navbar.jsx`
*   ✅ `ResumeCard.jsx`
*   ❌ `navbar.jsx` or `resume_card.jsx`

### 📂 Folder Naming
Project directories use **lowercase single words**:
*   ✅ `components/`
*   ✅ `pages/`
*   ✅ `layouts/`

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Launch the development server:**
    ```bash
    npm run dev
    ```

---

## 💡 Innovation Roadmap
- **Atomic Data Siphon**: Automatically pull and format data from professional profiles.
- **Smart-Canvas Engine**: Interactive drag-and-drop assembly that replaces traditional forms.
- **Real-time ATS Shadowing**: Instant keyword density and readability analysis.
- **Semantic Versioning**: One master profile with the ability to toggle between multiple professional personas.

---

## 🛠️ Project Structure

```bash
cllient
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.svg
│  └─ icons.svg
├─ README.md
├─ src
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ components
│  │  └─ shared
│  │     └─ Navbar.jsx
│  ├─ index.css
│  ├─ layouts
│  │  └─ MainLayout.jsx
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ Dashboard.jsx
│  │  └─ Home.jsx
│  └─ routes
│     └─ router.jsx
└─ vite.config.js

```