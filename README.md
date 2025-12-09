# SkyCast

SkyCast is a high-performance, visually immersive weather dashboard built with React. It features real-time weather tracking, a precision solar cycle arc, advanced air quality monitoring (US EPA standard), and a dynamic background system that adapts to current weather conditions.

# 🚀 Features

• Real-Time Weather Data: Fetches live temperature, humidity, wind speed, pressure, and visibility from OpenWeatherMap.

• Advanced AQI Monitor: Calculates and displays the Air Quality Index using the official US EPA standard (0-500 scale) with a detailed breakdown of pollutants (PM2.5, PM10, CO, SO2).

• Precision Solar Arc: A custom SVG-based visualization tracking the sun's exact position based on local sunrise/sunset times.

• Dynamic Visuals: Immersive background effects (rain, snow, clouds, sun rays) that react to live weather conditions.

• 7-Day Forecast: Horizontal scrollable forecast for the upcoming week.

• Geolocation Support: Automatically detects user location on startup.

• Demo Mode: Fully functional simulation mode for testing UI features without an API key.

# 🛠️ Tech Stack

• Framework: React (Vite)

• Styling: Tailwind CSS

• Icons: Lucide React

• Charts: Recharts

• Data Source: OpenWeatherMap API (Forecast & Air Pollution endpoints)

# 📦 Installation & Setup

Follow these steps to get SkyCast running on your local machine.

Prerequisites

• Node.js (v16 or higher)

• npm or yarn

1. Clone the Repository

git clone [https://github.com/abhranilsingharoy-cloud/SkyCast/tree/main](https://github.com/abhranilsingharoy-cloud/SkyCast/tree/main)
cd skycast


2. Install Dependencies

npm install
# Ensures the specific icon and chart libraries are added
npm install lucide-react recharts


3. Tailwind Configuration

Ensure your tailwind.config.js is set up to scan your source files:

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


4. Run the Development Server

npm run dev


Open your browser and navigate to http://localhost:5173.

# 🔑 API Configuration

By default, the app runs in Demo Mode. To access real-time data:

1. Get a free API key from OpenWeatherMap.

2. Click the Settings (Gear Icon) in the SkyCast dashboard.

3. Toggle "API Source" to Live API.

4. Paste your API key. The app will save it locally in your browser.

# 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request
  
 Made by Abhranil Singha Roy.
