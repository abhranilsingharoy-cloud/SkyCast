<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cloud-lightning.svg" width="80" height="80" alt="SkyCast Logo">
  <h1>SkyCast 3D</h1>
  <p><strong>A Next-Generation, 3D Immersive Weather Dashboard</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

SkyCast is a state-of-the-art weather web application designed with a premium, hyper-glassmorphic aesthetic. It utilizes React Three Fiber to render immersive, dynamic 3D weather environments that react to live meteorological data in real-time. 

## 📖 About

SkyCast was built to push the boundaries of what a weather dashboard can look like. By combining real-time API data with a 3D WebGL rendering engine, it delivers not just numbers, but a breathtaking visual representation of the sky right on your screen. Whether you are tracking a 3D thunderstorm, monitoring detailed air quality metrics, or checking the custom lifestyle indices, SkyCast makes meteorological data beautiful and highly interactive.

## ✨ Key Features

- **Dynamic 3D Weather Engine**: Powered by `three.js` and `@react-three/fiber`. Watch 3D rain fall, volumetric clouds drift, and dynamic lighting shift based on actual weather conditions.
- **Smart Auto-Geolocation & Google Maps**: Instantly detects and prompts for your exact GPS coordinates. The location badge serves as a direct, clickable link to your exact coordinates on Google Maps.
- **Hyper-Glassmorphic UI**: Premium dashboard aesthetics using dynamic gradients, frosted glass translucency, and modern typography.
- **Advanced AQI Gauge**: Features a custom-built SVG semi-circle gauge to visualize the Air Quality Index alongside granular pollutant breakdowns (PM2.5, PM10, CO, SO2).
- **Custom Lifestyle Indices**: A smart algorithm calculates your local suitability for Outdoor Activities, Stargazing, Fishing, Sailing, and more based on live temperature, wind, and humidity.
- **Precision Solar Arc**: Real-time visualization of the sun and moon trajectory based on precise local sunrise and sunset times.
- **Interactive Forecasts**: Seamlessly merged hourly temperature line charts and a clean vertical 7-day forecast.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
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

SkyCast runs in **Demo Mode** by default, generating highly realistic mock data so you can experience the 3D features immediately. To connect real-time data:

1. Obtain a free API key from [OpenWeatherMap](https://openweathermap.org/api).
2. Click the **Settings (Gear Icon)** in the dashboard.
3. Switch the "API Source" to **Live API**.
4. Paste your API key and click "Save Changes". The key is stored securely in your browser's local storage.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/abhranilsingharoy-cloud/SkyCast/issues).

---

<div align="center">
  <h3>👨‍💻 Developed by Abhranil Singha Roy</h3>
  <p>Building the future of web interfaces.</p>
</div>
