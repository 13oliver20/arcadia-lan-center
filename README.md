# Arcadia LAN Center App

A modern Single Page Application (SPA) designed for the management and public display of **Arcadia Gaming Center**. Built with **React** and **Vite**, this application features a futuristic cyberpunk aesthetic with interactive visual effects.

## 🚀 Features

- **Public Display (`/display`)**:
  - Interactive particle background.
  - Animated digital clock and date.
  - Promotional carousel.
  - QR Code toggle for WiFi and WhatsApp community.
- **Admin Panel (`/admin`)**:
  - Secure dashboard for LAN center management.
  - User and Time management.
  - Monthly payments tracking.
  - Giveaway system.
  - Real-time content updates for the display page.

## 🛠️ Technologies Used

- **Core**: React, Vite
- **Styling**: TailwindCSS, Vanilla CSS (for custom animations)
- **State Management**: React Hooks (`useState`, `useEffect`) + `localStorage` for persistence
- **Icons**: Lucide React, React Icons

## 📂 Project Structure

```
d:\Proyect Local\arcadia-lan-center\
├── public/              # Static assets (images, logos)
├── src/
│   ├── components/      # Reusable UI components (Modal, ParticleBackground, etc.)
│   ├── pages/           # Main route pages (AdminPage, DisplayPage, etc.)
│   ├── utils/           # Helper functions (imageHandler, etc.)
│   ├── App.jsx          # Main application component and routing
│   └── main.jsx         # Entry point
├── .gitignore           # Git ignore configuration
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd arcadia-lan-center
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    -   **Display**: `http://localhost:5173/display`
    -   **Admin**: `http://localhost:5173/admin`

## 📝 Usage

- Access the **Admin Panel** to manage users, update announcements, and configure system settings.
- The **Display Page** is designed to be shown on a dedicated screen in the LAN center.

## 📄 License

This project is licensed under the MIT License.
