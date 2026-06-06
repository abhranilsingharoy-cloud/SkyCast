import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Wind, 
  Droplets, 
  Sunrise, 
  Sunset, 
  MapPin, 
  RefreshCw, 
  Settings, 
  Zap, 
  CloudRain, 
  Cloud, 
  Sun, 
  CloudLightning, 
  Snowflake,
  Navigation,
  Activity,
  ExternalLink,
  Crosshair,
  Calendar,
  Eye,
  ThermometerSun,
  FlaskConical,
  Gauge,
  SunDim,
  Bike,
  Star,
  Thermometer,
  Bug,
  Droplet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import WeatherEffects3D from './components/WeatherEffects3D';

// --- Constants & Utilities ---

const WEATHER_API_KEY_STORAGE = 'tech_weather_api_key';

const calculateUSAQI = (pm25) => {
  const c = Math.floor(10 * pm25) / 10;
  if (c < 0) return 0;
  
  let lowConc = 0, highConc = 0;
  let lowAQI = 0, highAQI = 0;

  if (c <= 12.0) { lowConc = 0; highConc = 12.0; lowAQI = 0; highAQI = 50; }
  else if (c <= 35.4) { lowConc = 12.1; highConc = 35.4; lowAQI = 51; highAQI = 100; }
  else if (c <= 55.4) { lowConc = 35.5; highConc = 55.4; lowAQI = 101; highAQI = 150; }
  else if (c <= 150.4) { lowConc = 55.5; highConc = 150.4; lowAQI = 151; highAQI = 200; }
  else if (c <= 250.4) { lowConc = 150.5; highConc = 250.4; lowAQI = 201; highAQI = 300; }
  else { lowConc = 250.5; highConc = 500.4; lowAQI = 301; highAQI = 500; }

  return Math.round(((highAQI - lowAQI) / (highConc - lowConc)) * (c - lowConc) + lowAQI);
};

const getAQIInfo = (aqi) => {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400', hex: '#34d399' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', hex: '#facc15' };
  if (aqi <= 150) return { label: 'Lightly polluted', color: 'text-orange-400', hex: '#fb923c' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-rose-500', hex: '#f43f5e' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-500', hex: '#9333ea' };
  return { label: 'Hazardous', color: 'text-red-800', hex: '#991b1b' };
};

const generateMockData = (query, type, units) => {
  const now = new Date();
  const isCoords = type === 'coords';
  const cityName = isCoords ? `Unknown Location` : query;
  const randomOffset = Math.floor(Math.random() * 7200) - 3600;

  const data = {
    city: {
      name: cityName,
      country: "XX",
      coord: isCoords ? { lat: query.lat, lon: query.lon } : { lat: 35.6762, lon: 139.6503 },
      population: 1000000,
      timezone: 0,
      sunrise: Math.floor(now.getTime() / 1000) - 21600 + randomOffset, 
      sunset: Math.floor(now.getTime() / 1000) + 21600 + randomOffset,  
    },
    list: []
  };

  for (let i = 0; i < 60; i++) {
    const time = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    const baseTemp = units === 'metric' ? 22 : 72;
    const fluctuation = Math.sin(i / 4) * 5;
    
    let mainWeather = "Clear";
    let desc = "clear sky";
    if (i % 20 >= 15) { mainWeather = "Snow"; desc = "light snow"; }
    else if (i % 20 >= 10) { mainWeather = "Rain"; desc = "moderate rain"; }
    else if (i % 20 >= 5) { mainWeather = "Clouds"; desc = "scattered clouds"; }

    data.list.push({
      dt: Math.floor(time.getTime() / 1000),
      main: {
        temp: baseTemp + fluctuation + (Math.random() * 2 - 1),
        feels_like: baseTemp + fluctuation - 1,
        temp_min: baseTemp + fluctuation - 2,
        temp_max: baseTemp + fluctuation + 2,
        pressure: 1012 + Math.floor(Math.random() * 10),
        humidity: 45 + Math.floor(Math.random() * 20),
        uvi: Math.random() * 10,
      },
      weather: [{ 
        id: 800, 
        main: mainWeather, 
        description: desc, 
        icon: mainWeather === "Clear" ? "01d" : "10d" 
      }],
      clouds: { all: Math.floor(Math.random() * 100) },
      wind: { speed: 3 + Math.random() * 5, deg: Math.floor(Math.random() * 360) },
      pop: mainWeather === "Rain" ? 0.7 : 0,
      visibility: 10000,
      dt_txt: time.toISOString()
    });
  }
  return data;
};

const generateMockAQI = () => {
  const isBadDay = Math.random() > 0.6;
  const pm25 = isBadDay ? Math.random() * 150 + 50 : Math.random() * 40 + 5;
  const pm10 = pm25 * (1.2 + Math.random() * 0.5);
  
  return {
    list: [{
      main: { aq: 1 }, 
      components: {
        co: 200 + Math.random() * 200,
        no: 0.5,
        no2: 10 + Math.random() * 20,
        o3: 60 + Math.random() * 40,
        so2: 5 + Math.random() * 15,
        pm2_5: pm25,
        pm10: pm10,
        nh3: 0.5
      },
      dt: Math.floor(Date.now() / 1000)
    }]
  };
};

const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getDayName = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'short' });
};

const getWindDirection = (deg) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
};

const GlassCard = ({ children, className = "", noPadding=false }) => (
  <div className={`
    premium-glass ${noPadding ? '' : 'p-6 md:p-8'}
    z-10 relative
    ${className}
  `}>
    {children}
  </div>
);

const WeatherIcon = ({ condition, className = "w-6 h-6", color = "text-white" }) => {
  const lowerCond = condition?.toLowerCase() || "";
  if (lowerCond.includes("rain")) return <CloudRain className={`${className} ${color}`} />;
  if (lowerCond.includes("cloud")) return <Cloud className={`${className} ${color}`} />;
  if (lowerCond.includes("snow")) return <Snowflake className={`${className} ${color}`} />;
  if (lowerCond.includes("thunder")) return <CloudLightning className={`${className} ${color}`} />;
  return <Sun className={`${className} ${color}`} />;
};

const StatItem = ({ icon: Icon, label, value, subLabel, color="text-blue-400" }) => (
  <div className="flex flex-col items-center justify-center p-3">
    <Icon className={`w-6 h-6 mb-2 ${color}`} />
    <span className="text-xs font-medium text-white/60 mb-1">{label}</span>
    <span className="text-lg font-bold text-white">{value}</span>
    {subLabel && <span className="text-xs text-white/40">{subLabel}</span>}
  </div>
);

// --- New Components based on requirements ---

const AQIGauge = ({ aqi, info, components }) => {
  const normalized = Math.min(Math.max(aqi, 0), 300) / 300; 
  const angle = Math.PI * normalized;
  const cx = 100, cy = 100, r = 80;
  const x = cx - r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);

  const PollutantBar = ({ label, value, max, color }) => (
    <div className="flex flex-col gap-1 w-full max-w-[100px]">
      <div className="flex justify-between items-end">
        <span className="text-[10px] text-white/60 uppercase">{label}</span>
        <span className="text-sm font-bold">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-4">
      <div className="relative w-[200px] h-[120px] flex flex-col items-center justify-end flex-shrink-0">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 200 120" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="30%" stopColor="#facc15" />
              <stop offset="60%" stopColor="#fb923c" />
              <stop offset="85%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
          <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="url(#aqiGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${Math.PI * r}`} strokeDashoffset={`${Math.PI * r * (1 - normalized)}`} className="transition-all duration-1000 ease-out" />
          <circle cx={x} cy={y} r="8" fill="#fff" className="shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" />
        </svg>
        <div className="text-center z-10 -mt-6">
          <div className="text-xs font-semibold text-white/90 mb-1">{info.label}</div>
          <div className="text-4xl font-bold">{aqi}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
        <PollutantBar label="PM2.5" value={components.pm2_5} max={150} color="#facc15" />
        <PollutantBar label="PM10" value={components.pm10} max={150} color="#34d399" />
        <PollutantBar label="SO2" value={components.so2} max={100} color="#34d399" />
        <PollutantBar label="CO" value={components.co / 100} max={100} color="#facc15" />
      </div>
    </div>
  );
};

const HourlyForecastMerged = ({ data }) => {
  if (!data || data.length === 0) return null;
  const hours = data.slice(0, 12);
  const minTemp = Math.min(...hours.map(h => h.main.temp));
  const maxTemp = Math.max(...hours.map(h => h.main.temp));
  const range = (maxTemp - minTemp) || 1;

  const pointSpacing = 72;
  const paddingY = 20;
  const height = 60;

  const points = hours.map((h, i) => {
    const x = i * pointSpacing + (pointSpacing / 2);
    const y = paddingY + height - ((h.main.temp - minTemp) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex relative" style={{ minWidth: `${hours.length * pointSpacing}px`, height: '240px' }}>
        <svg className="absolute top-8 left-0 w-full h-[100px] pointer-events-none" style={{ overflow: 'visible' }}>
           <polyline points={points} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
           {hours.map((h, i) => (
             <g key={i}>
               <circle 
                 cx={i * pointSpacing + (pointSpacing / 2)} 
                 cy={paddingY + height - ((h.main.temp - minTemp) / range) * height} 
                 r="4" 
                 fill="#34d399" 
               />
               <text 
                 x={i * pointSpacing + (pointSpacing / 2)} 
                 y={paddingY + height - ((h.main.temp - minTemp) / range) * height - 12} 
                 fill="white" 
                 fontSize="12" 
                 fontWeight="bold"
                 textAnchor="middle"
               >
                 {Math.round(h.main.temp)}°
               </text>
             </g>
           ))}
        </svg>

        {hours.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-end w-[72px] h-full flex-shrink-0 pb-2">
            <WeatherIcon condition={item.weather[0].main} className="w-7 h-7 mb-4 opacity-90" />
            
            <div className="flex flex-col items-center opacity-70 mb-3">
              <Wind className="w-4 h-4 mb-1" />
              <span className="text-[10px]">Force {Math.round(item.wind.speed)}</span>
            </div>
            
            <div className="flex flex-col items-center opacity-70 mb-4">
              <SunDim className="w-4 h-4 mb-1 text-purple-400" />
              <span className="text-[10px] text-purple-400">{item.main.uvi > 5 ? 'Strong' : 'Weak'}</span>
            </div>
            
            <span className="text-xs font-medium opacity-90">{i === 0 ? 'Now' : formatTime(item.dt).slice(0, 5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const VerticalForecastList = ({ data }) => {
  const daily = [0, 8, 16, 24, 32, 40, 48].map(offset => data[offset]).filter(Boolean);
  
  return (
    <div className="flex flex-col w-full p-2">
      {daily.map((day, i) => {
        const date = new Date(day.dt * 1000);
        const dateStr = `${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        let dayName = getDayName(day.dt);
        if (i === 0) dayName = 'Today';
        if (i === 1) dayName = 'Tomorrow';

        return (
          <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg px-2 transition-colors cursor-pointer">
            <div className="flex items-center gap-4 w-5/12">
              <span className="text-xs opacity-60 w-10">{dateStr}</span>
              <span className="text-sm font-semibold">{dayName}</span>
            </div>
            
            <div className="flex items-center gap-2 w-3/12 justify-center">
              <WeatherIcon condition={day.weather[0].main} className="w-6 h-6" />
              {day.pop > 0 && <span className="text-xs text-sky-400 font-bold">{Math.round(day.pop * 100)}%</span>}
            </div>
            
            <div className="flex items-center gap-4 w-4/12 justify-end text-sm">
              <span className="opacity-60 font-medium">{Math.round(day.main.temp_min)}°</span>
              <span className="font-bold text-white">{Math.round(day.main.temp_max)}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LifestyleGrid = ({ current }) => {
  const temp = current.main.temp;
  const wind = current.wind.speed;
  const isRain = current.weather[0].main.toLowerCase().includes('rain');

  const getOutdoor = () => isRain ? 'Poor' : (temp > 30 || temp < 5 ? 'Fair' : 'Excellent');
  const getStargazing = () => (current.clouds.all > 50 || isRain) ? 'Poor' : 'Excellent';
  const getFishing = () => (wind > 10 || isRain) ? 'Less suitable' : 'Good';
  const getSailing = () => (wind > 15 || isRain) ? 'Less suitable' : 'Good';
  const getCold = () => temp < 15 ? 'High risk' : 'Unlikely';
  const getMosquito = () => (temp > 20 && current.main.humidity > 60) ? 'Extremely high' : 'Low';

  const items = [
    { icon: Bike, label: 'Outdoor activities', value: getOutdoor() },
    { icon: Star, label: 'Stargazing', value: getStargazing() },
    { icon: Activity, label: 'Fishing', value: getFishing() },
    { icon: Navigation, label: 'Sailing', value: getSailing() },
    { icon: Thermometer, label: 'Cold Risk', value: getCold() },
    { icon: Bug, label: 'Mosquito activity', value: getMosquito() },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col items-center justify-center py-6 px-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5">
          <item.icon className="w-7 h-7 mb-3 text-sky-300" />
          <span className="text-xs text-white/70 mb-2 font-medium tracking-wide">{item.label}</span>
          <span className="text-sm font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const SolarArc = ({ sunrise, sunset }) => {
  const now = Math.floor(Date.now() / 1000);
  const totalDay = sunset - sunrise;
  const elapsed = now - sunrise;
  
  let percent = elapsed / totalDay;
  const isDay = percent >= 0 && percent <= 1;
  const visualPercent = Math.max(0, Math.min(1, percent));
  
  const cx = 150, cy = 130, r = 110; 
  const angle = Math.PI - (visualPercent * Math.PI);
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle); 

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
       <svg className="w-full h-full" viewBox="0 0 300 150" style={{ overflow: 'visible' }}>
          <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6,6" />
          
          {isDay && (
             <>
               <defs>
                 <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="rgba(253, 224, 71, 0.2)" />
                   <stop offset="100%" stopColor="rgba(253, 224, 71, 0.8)" />
                 </linearGradient>
                 <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
               </defs>
               <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${x},${y}`} fill="none" stroke="url(#trailGradient)" strokeWidth="4" strokeLinecap="round" />
               <circle cx={x} cy={y} r="8" fill="#fde047" filter="url(#sunGlow)" />
               <circle cx={x} cy={y} r="14" fill="rgba(253, 224, 71, 0.2)" />
             </>
          )}

          <text x={cx - r} y={cy + 25} fill="rgba(255,255,255,0.7)" textAnchor="middle" fontSize="12" fontWeight="bold">{formatTime(sunrise)}</text>
          <text x={cx - r} y={cy + 40} fill="rgba(255,255,255,0.4)" textAnchor="middle" fontSize="10" style={{ textTransform: 'uppercase' }}>Sunrise</text>
          <text x={cx + r} y={cy + 25} fill="rgba(255,255,255,0.7)" textAnchor="middle" fontSize="12" fontWeight="bold">{formatTime(sunset)}</text>
          <text x={cx + r} y={cy + 40} fill="rgba(255,255,255,0.4)" textAnchor="middle" fontSize="10" style={{ textTransform: 'uppercase' }}>Sunset</text>
       </svg>
       
       <div className="absolute top-[130px] w-full h-px bg-white/10" />

       {!isDay && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse">
           <SunDim className="w-8 h-8 text-indigo-300 mx-auto mb-2 opacity-50" />
           <span className="text-xs uppercase tracking-widest text-indigo-200/60 font-medium">
             {percent < 0 ? "Pre-Dawn" : "Night Time"}
           </span>
         </div>
       )}
    </div>
  );
};

export default function App() {
  const [cityInput, setCityInput] = useState("San Francisco");
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("Detecting your location...");
  const [error, setError] = useState(null);
  const [units, setUnits] = useState('metric'); 
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(WEATHER_API_KEY_STORAGE) || '');
  const [showSettings, setShowSettings] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState(() => !localStorage.getItem(WEATHER_API_KEY_STORAGE));

  useEffect(() => { document.title = "SkyCast"; }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }, 'coords'),
        (err) => {
          console.warn("Location access denied or timeout:", err);
          fetchWeather("San Francisco", 'city');
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather("San Francisco", 'city');
    }
  }, []);

  const fetchWeather = async (query, type = 'city') => {
    setLoading(true); setError(null); setLoadingMsg("Updating Forecast...");
    await new Promise(r => setTimeout(r, 600));

    try {
      if (useDemoMode || !apiKey) {
        const mockWeather = generateMockData(query, type, units);
        const mockAQI = generateMockAQI();
        setWeatherData(mockWeather);
        setAqiData(mockAQI);
        setCityInput(type === 'city' ? query : mockWeather.city.name);
      } else {
        let url = `https://api.openweathermap.org/data/2.5/forecast?units=${units}&appid=${apiKey}`;
        if (type === 'city') url += `&q=${query}`;
        else if (type === 'coords') url += `&lat=${query.lat}&lon=${query.lon}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Location not found');
        const data = await response.json();
        
        const { lat, lon } = data.city.coord;
        const aqUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const aqResponse = await fetch(aqUrl);
        
        if (aqResponse.ok) setAqiData(await aqResponse.json());
        else setAqiData(generateMockAQI());

        setWeatherData(data);
        setCityInput(data.city.name);
      }
    } catch (err) {
      setError("Could not fetch weather data.");
      if (!useDemoMode) fetchWeather(query, type);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); if (cityInput.trim()) fetchWeather(cityInput, 'city'); };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }, 'coords'),
      (err) => { setError("Location access denied. Please enable location permissions."); setLoading(false); }
    );
  };

  const handleSaveSettings = () => {
    if (apiKey) localStorage.setItem(WEATHER_API_KEY_STORAGE, apiKey);
    fetchWeather(cityInput, 'city');
    setShowSettings(false);
  };

  const current = weatherData ? weatherData.list[0] : null;
  const currentAQI = aqiData ? aqiData.list[0] : null;
  
  const preciseAQI = currentAQI && currentAQI.components && currentAQI.components.pm2_5 
    ? calculateUSAQI(currentAQI.components.pm2_5) 
    : (currentAQI ? currentAQI.main.aq * 20 : 0);

  const aqiInfo = getAQIInfo(preciseAQI);

  return (
    <div className="min-h-screen text-white font-sans transition-all duration-700 ease-in-out relative overflow-hidden bg-[#030712]">
      
      {current && (
        <WeatherEffects3D 
          condition={current.weather[0].main} 
          isDay={current.sys?.pod === 'd' || true} 
        />
      )}

      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        
        <header className="flex flex-col md:flex-row items-center mb-8 pt-2 gap-4 relative justify-center">
           <div className="flex items-center gap-2 md:absolute md:left-0 md:top-2">
              <div className="p-2 bg-white/10 rounded-full"><Cloud className="w-5 h-5 text-cyan-300" /></div>
              <span className="text-xl font-bold tracking-wide">SkyCast</span>
           </div>
           <form onSubmit={handleSearch} className="w-full max-w-md relative group z-10 flex gap-2">
             <div className="relative flex-1">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="w-4 h-4 text-white/60" /></div>
               <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="Search City" className="w-full bg-white/10 border border-white/10 text-white placeholder-white/60 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all text-sm font-medium shadow-sm backdrop-blur-sm text-center md:text-left" />
             </div>
             <button type="button" onClick={handleGeoLocation} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors text-sky-400 border border-white/10 flex items-center justify-center" title="Use Current Location">
               <Crosshair className="w-5 h-5" />
             </button>
           </form>
           <div className="flex items-center gap-3 md:absolute md:right-0 md:top-2">
              <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"><Settings className="w-5 h-5 text-white" /></button>
           </div>
        </header>

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Settings</h3><button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">Close</button></div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Units</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button onClick={() => setUnits('metric')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${units === 'metric' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Celsius (°C)</button>
                    <button onClick={() => setUnits('imperial')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${units === 'imperial' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Fahrenheit (°F)</button>
                  </div>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-sm font-medium text-slate-500">API Source</label>
                     <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{useDemoMode ? 'Demo Mode' : 'Live API'}</span>
                   </div>
                   {!useDemoMode ? <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="OpenWeatherMap API Key" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" /> : <button onClick={() => setUseDemoMode(false)} className="text-sm text-blue-600 underline">Switch to Live Data</button>}
                   {!useDemoMode && <button onClick={() => setUseDemoMode(true)} className="text-xs text-slate-400 mt-2 hover:text-slate-600">Switch back to Demo Mode</button>}
                </div>
                <button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center"><RefreshCw className="w-10 h-10 animate-spin opacity-70 mb-4" /><p className="text-lg font-medium opacity-70">{loadingMsg}</p></div>
        ) : error ? (
           <div className="h-[60vh] flex flex-col items-center justify-center text-center"><CloudLightning className="w-16 h-16 opacity-50 mb-4" /><h2 className="text-2xl font-bold mb-2">Oops!</h2><p className="opacity-80">{error}</p></div>
        ) : weatherData && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in pb-10">
            
            <div className="flex flex-col items-center mb-10 pt-4">
              <div className="flex items-center gap-2 mb-4 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg transition-all hover:bg-white/10">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-sky-100">{weatherData.city.name}</span>
              </div>
              <div className="relative mt-2 animate-float">
                <h1 className="text-[8rem] md:text-[10rem] leading-[0.85] font-extrabold tracking-tighter text-glow text-center">
                  {Math.round(current.main.temp)}°
                </h1>
                <p className="text-2xl md:text-3xl font-light capitalize opacity-90 mt-4 tracking-wide text-sky-200 text-center">{current.weather[0].description}</p>
              </div>
            </div>

            <GlassCard noPadding className="overflow-hidden">
               <HourlyForecastMerged data={weatherData.list} />
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-6">
                {currentAQI && aqiInfo && (
                  <GlassCard>
                    <div className="mb-4"><h3 className="font-semibold text-xs uppercase tracking-wider text-white/70">Air Quality</h3></div>
                    <AQIGauge aqi={preciseAQI} info={aqiInfo} components={currentAQI.components} />
                  </GlassCard>
                )}
                
                <GlassCard>
                  <div className="mb-4"><h3 className="font-semibold text-xs uppercase tracking-wider text-white/70">Sunrise & Sunset</h3></div>
                  <SolarArc sunrise={weatherData.city.sunrise} sunset={weatherData.city.sunset} />
                </GlassCard>

                <LifestyleGrid current={current} />
              </div>

              <div className="flex flex-col gap-6">
                <GlassCard>
                  <div className="grid grid-cols-2 gap-y-6 divide-x divide-white/10">
                    <StatItem icon={ThermometerSun} label="Feels Like" value={`${Math.round(current.main.feels_like)}°`} color="text-orange-300" />
                    <StatItem icon={Droplets} label="Humidity" value={`${current.main.humidity}%`} color="text-cyan-300" />
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="mb-2"><h3 className="font-semibold text-xs uppercase tracking-wider text-white/70">7-Day Forecast</h3></div>
                  <VerticalForecastList data={weatherData.list} />
                  <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-sm font-semibold">View more</button>
                </GlassCard>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
