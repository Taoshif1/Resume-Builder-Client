# 🚀 AI-Powered Resume Builder (MERN)

A next-generation resume assembly platform designed to move beyond static forms. This project focuses on **Atomic Content**, **Real-time ATS feedback**, and **Dynamic Canvas** editing using the **MERN** stack.

---

## 🏗️ Tech Stack & Dependencies

### Frontend

- **React 19 (Vite)**: High-performance frontend library.
- **React Router 7**: Declarative routing for seamless navigation.
- **Axios**: Efficient API handling for backend communication.

### Styling & UI

- **Tailwind CSS 4**: Utility-first styling engine.
- **DaisyUI 5**: Accessible and customizable UI component library.

### Backend (MERN Architecture)

- **MongoDB**: Flexible NoSQL database for polymorphic resume data.
- **Express.js**: Minimalist web framework for the API layer.
- **Node.js**: Scalable JavaScript runtime for server-side logic.

---

## 📏 Standards & Conventions

### 🌿 Branch Naming

We strictly follow **kebab-case** naming with descriptive prefixes:

- `feat/` : New features (e.g., `feat/drag-and-drop-editor`)
- `fix/` : Bug fixes (e.g., `fix/auth-token-expiry`)
- `refactor/` : Code restructuring (e.g., `refactor/api-services`)
- `chore/` : Tooling or dependency updates (e.g., `chore/update-tailwind`)

### ⚛️ Component Naming

All React components use **PascalCase**:

- ✅ `Navbar.jsx`
- ✅ `ResumeCard.jsx`
- ❌ `navbar.jsx` or `resume_card.jsx`

### 📂 Folder Naming

Project directories use **lowercase single words**:

- ✅ `components/`
- ✅ `pages/`
- ✅ `layouts/`

---

## 🎨 Design & Theme Overview

The project is built using **Tailwind CSS v4** and **DaisyUI**, focusing on a high-end "Glassmorphism" and "Cyberpunk" aesthetic.

### 🌈 Color Palette (`personacv` theme)

- **Primary (`#00f5d4`):** A neon mint green used for the brand logo, active states, and call-to-action buttons.
- **Background (`#0b0f19`):** A deep "Midnight" navy used as the base to provide a premium dark-mode feel.
- **Glow Effect:** A custom `.glow` utility class provides a neon text-shadow tied to the primary color for high-visibility accents.

### 🧭 Navbar Features
*   **Sticky & Dynamic:** The navbar starts transparent. Upon scrolling, it transitions into a **floating glass-morphism island** using `backdrop-blur-xl`, subtle borders, and a centered max-width layout.
*   **Active States:** Built with `NavLink`, the current page automatically inherits the `.glow` effect and primary branding color.
*   **Responsive Design:** Fully optimized for all screen sizes, including a custom mobile dropdown menu with backdrop blurring.

### 🕸️ Get Started (Login & SignUp)
*  **Active States:** Active elements are indicated using selected tab highlights and focused input field styling. The current tab (Login or Signup) is clearly distinguished with a filled or accent style. Buttons and fields show subtle visual feedback on focus and click to guide user interaction.
*  **Responsive View:** The layout adapts across screen sizes to ensure a consistent and user-friendly experience. On smaller screens, content is stacked vertically with full-width inputs and buttons. Spacing and typography are adjusted for clarity and comfortable touch interaction.

## 🤖 PersonaCV AI

### 🎯 Actions

* Generates and improves resume content
* Answers career-related questions and guides users

### 🆘 Help

* Click the 💬 chat icon at the bottom-right
* Type your message and press **Enter** or **Send** to get a response

---

### 🚀 Firebase Authentication Integration

#### ✅ Features Added:
- Email & Password Authentication
- Google Sign-In
- Firebase configuration using .env
- Auth service layer (modular & scalable)

#### 🧠 Notes:
- No UI changes were made
- Integrated with existing Login & Register pages
- Ready for global auth state integration

#### 🔥 Next Steps:
- Global auth state (Zustand)
- Protected routes
- User session persistence

---

## 🚀 Pricing Page Implementation

### ✨ Features:
- GSAP animated pricing cards
- Draggable slider interaction
- Monthly / Yearly toggle (conversion focused)
- Highlighted "Most Popular" & "Best Value" plans
- Premium visual scaling effect

### 🎯 Business Value:
- Improves user decision making
- Encourages upgrade (highlight + UX psychology)
- Interactive UI increases engagement

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
client
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
│  │  ├─ aisistant.jpg
│  │  ├─ bg-started.png
│  │  ├─ Container.png
│  │  ├─ google.png
│  │  ├─ hero.png
│  │  ├─ heroIMG.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ components
│  │  ├─ dashboard
│  │  │  ├─ ActivityFeed.jsx
│  │  │  ├─ Sidebar.jsx
│  │  │  ├─ StatCard.jsx
│  │  │  └─ Topbar.jsx
│  │  └─ shared
│  │     ├─ FloatingChatbot.jsx
│  │     ├─ Footer.jsx
│  │     ├─ Logo.jsx
│  │     └─ Navbar.jsx
│  ├─ context
│  │  └─ AuthContext.jsx
│  ├─ index.css
│  ├─ layouts
│  │  ├─ DashboardLayout.jsx
│  │  └─ MainLayout.jsx
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ dashboard
│  │  │  ├─ Create.jsx
│  │  │  ├─ Overview.jsx
│  │  │  ├─ Profile.jsx
│  │  │  └─ Resumes.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ Features
│  │  │  ├─ AIHighlight.jsx
│  │  │  ├─ CoreFeatures.jsx
│  │  │  ├─ CTASection.jsx
│  │  │  ├─ HeroFeatures.jsx
│  │  │  └─ Workflow.jsx
│  │  ├─ Features.jsx
│  │  ├─ GetStarted.jsx
│  │  ├─ Home.jsx
│  │  ├─ HomePage
│  │  │  ├─ AssistantModes.jsx
│  │  │  ├─ CareerVault.jsx
│  │  │  ├─ HeroSection.jsx
│  │  │  ├─ PricingDemo.jsx
│  │  │  ├─ SocialProf.jsx
│  │  │  └─ Sponsors.jsx
│  │  ├─ Login.jsx
│  │  ├─ Pricing.jsx
│  │  └─ Register.jsx
│  ├─ routes
│  │  ├─ PrivateRouter.jsx
│  │  └─ router.jsx
│  └─ services
│     ├─ auth.js
│     └─ firebase.js
└─ vite.config.js

```