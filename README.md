<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cloud-lightning.svg" width="80" height="80" alt="SkyCast Logo">
  <h1>SkyCast</h1>
  <p><strong>A High-Performance, Visually Immersive Weather Dashboard</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

SkyCast is a modern, responsive, and dynamic weather dashboard that delivers real-time weather data with a premium glassmorphic UI. It goes beyond simple forecasting by featuring advanced US EPA standard air quality monitoring, a dynamic solar cycle tracker, and immersive visual effects that react to local weather conditions.

## 📖 About

SkyCast was built to provide an immersive and highly accurate weather monitoring experience. By combining real-time API data with a hyper-glassmorphic UI, it aims to deliver not just numbers, but a visual representation of the sky right on your screen. Whether you are tracking a storm or checking the air quality, SkyCast makes meteorological data beautiful and accessible.

## ✨ Key Features

- **Real-Time Data**: Instant access to temperature, humidity, wind, and pressure via OpenWeatherMap.
- **Advanced AQI Monitor**: Calculates and visualizes the Air Quality Index (US EPA 0-500 scale) with granular pollutant breakdowns (PM2.5, PM10, CO, SO2).
- **Hyper-Glassmorphic UI**: Premium aesthetics using dynamic gradients, glass-like translucency, and modern typography (`Outfit` font).
- **Dynamic Visuals**: Immersive, CSS-driven background effects (rain, snow, clouds, sun rays) that adapt to live weather.
- **Precision Solar Arc**: Real-time SVG visualization of the sun's trajectory based on precise sunrise and sunset times.
- **7-Day Forecast**: Quick-glance, scrollable forecast for the week ahead.
- **Demo Mode**: Fully functional simulation mode for UI evaluation without requiring an API key.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Source**: [OpenWeatherMap API](https://openweathermap.org/api)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhranilsingharoy-cloud/SkyCast.git
   cd SkyCast
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

## 🔑 API Configuration

SkyCast runs in **Demo Mode** by default, generating realistic mock data. To connect real-time data:

1. Obtain a free API key from [OpenWeatherMap](https://openweathermap.org/api).
2. Click the **Settings (Gear Icon)** in the dashboard.
3. Switch the "API Source" to **Live API**.
4. Paste your API key and click "Save Changes". The key is stored securely in your browser's local storage.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/abhranilsingharoy-cloud/SkyCast/issues).

## 🏷️ Recommended GitHub Topics

To increase the visibility of this project, consider adding the following topics in your GitHub repository settings:
`react` `vite` `tailwind-css` `weather-app` `weather-dashboard` `glassmorphism` `ui-ux` `openweathermap-api` `recharts` `frontend-development`

---

<div align="center">
  <p><strong>Developed by Abhranil Singha Roy</strong></p>
</div>
