# Student Portfolio - Meet Nakarani

Welcome to my personal student portfolio website. This single-page application is built with React and Vite, using a clean light-theme design, modular component structure, and custom SVGs to showcase my background, statistics, and technical skills.

---

## Features
*   **Modular Component Architecture:** Structured using independent React components: Header, About, Skills, and Footer.
*   **Light Theme Design:** Clean white and soft grey background palettes with high-contrast typography and subtle glassmorphic elements.
*   **High-Fidelity SVGs:** Integrated vector brand logos including the multi-color Figma logo and the detailed PostgreSQL Slonik logo.
*   **Performance Optimized:** Configured on Vite for instant Hot Module Replacement (HMR) and optimized production bundles.

---

## Technical Stack & Architecture

This application implements core React concepts:

*   **Vite Development Environment:** Scaffolded using Vite's React template for fast builds and optimized assets.
*   **Component-Based UI:** The page layout is composed of four modular components assembled in App.jsx. No JSX markup or rendering logic is duplicated.
*   **Props System:** Data is managed centrally in App.jsx and passed to child components via props.
    *   **Header Component:** Receives the name and title strings.
    *   **Skills Component:** Receives the array of technical skills, including names, progress levels, and SVGs.
    *   **Footer Component:** Receives the contact email and social links details.
*   **Embedded Expressions (JSX):** Evaluates JavaScript arrays and variables dynamically inside the markup using curly brace syntax.
*   **Map Method Rendering:** Skills and footer social link cards are mapped dynamically from data arrays to avoid manual replication.

---

## Project Structure
```
student-portfolio/
├── index.html
├── src/
│   ├── main.jsx              ← React entry point
│   ├── index.css             ← Global reset, theme variables, and keyframe animations
│   ├── App.jsx               ← Root component orchestrating data flow
│   └── components/
│       ├── Header.jsx + .css  ← Landing section, nav header
│       ├── About.jsx  + .css  ← Profile bio, quantitative statistics
│       ├── Skills.jsx + .css  ← Tech skills grid with level bars
│       └── Footer.jsx + .css  ← Email and social media directory
```

---

## Getting Started

### Prerequisites
Ensure you have Node.js installed on your system.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MeetKumar6789/student-portfolio.git
   cd student-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Production Build
To build the static application for production:
```bash
npm run build
```
This outputs optimized static assets in the `dist/` directory, ready to deploy.
