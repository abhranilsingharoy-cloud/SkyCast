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
  SunDim
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Constants & Utilities ---

const WEATHER_API_KEY_STORAGE = 'tech_weather_api_key';

// --- US EPA AQI Calculation Standard ---
const calculateUSAQI = (pm25) => {
  const c = Math.floor(10 * pm25) / 10;
  if (c < 0) return 0;
  
  let lowConc = 0, highConc = 0;
  let lowAQI = 0, highAQI = 0;

  if (c <= 12.0) {
    lowConc = 0; highConc = 12.0; lowAQI = 0; highAQI = 50;
  } else if (c <= 35.4) {
    lowConc = 12.1; highConc = 35.4; lowAQI = 51; highAQI = 100;
  } else if (c <= 55.4) {
    lowConc = 35.5; highConc = 55.4; lowAQI = 101; highAQI = 150;
  } else if (c <= 150.4) {
    lowConc = 55.5; highConc = 150.4; lowAQI = 151; highAQI = 200;
  } else if (c <= 250.4) {
    lowConc = 150.5; highConc = 250.4; lowAQI = 201; highAQI = 300;
  } else {
    lowConc = 250.5; highConc = 500.4; lowAQI = 301; highAQI = 500;
  }

  return Math.round(((highAQI - lowAQI) / (highConc - lowConc)) * (c - lowConc) + lowAQI);
};

const getAQIInfo = (aqi) => {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400', barColor: 'bg-emerald-400' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', barColor: 'bg-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400', barColor: 'bg-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-rose-500', barColor: 'bg-rose-500' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-500', barColor: 'bg-purple-500' };
  return { label: 'Hazardous', color: 'text-red-800', barColor: 'bg-red-800' };
};

const getAQIPosition = (aqi) => {
  const segment = 100 / 6;
  if (aqi <= 50) return (aqi / 50) * segment;
  if (aqi <= 100) return segment + ((aqi - 50) / 50) * segment;
  if (aqi <= 150) return segment * 2 + ((aqi - 100) / 50) * segment;
  if (aqi <= 200) return segment * 3 + ((aqi - 150) / 50) * segment;
  if (aqi <= 300) return segment * 4 + ((aqi - 200) / 100) * segment;
  return Math.min(segment * 5 + ((aqi - 300) / 200) * segment, 100);
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
      pop: 0.2,
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

const WeatherEffects = ({ weather, isDay = true }) => {
  const condition = weather?.main?.toLowerCase() || '';
  const styles = `
    @keyframes fall {
      0% { transform: translateY(-10vh) translateX(-10px); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateY(100vh) translateX(10px); opacity: 0; }
    }
    @keyframes drift {
      0% { transform: translateX(-100%); opacity: 0; }
      100% { transform: translateX(100vw); opacity: 0; }
    }
    @keyframes pulse-sun {
      0% { transform: scale(1); box-shadow: 0 0 40px rgba(255, 200, 0, 0.4); }
      50% { transform: scale(1.1); box-shadow: 0 0 80px rgba(255, 200, 0, 0.6); }
      100% { transform: scale(1); box-shadow: 0 0 40px rgba(255, 200, 0, 0.4); }
    }
    @keyframes rotate-rays {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes lightning {
      0%, 90%, 100% { opacity: 0; }
      92% { opacity: 0.8; background-color: white; }
      94% { opacity: 0; }
      96% { opacity: 0.4; background-color: white; }
    }
  `;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{styles}</style>
      {condition.includes('clear') && isDay && (
        <div className="absolute top-10 right-10 md:right-32 animate-in fade-in duration-1000">
          <div className="w-32 h-32 bg-yellow-300 rounded-full blur-md" style={{ animation: 'pulse-sun 4s infinite ease-in-out' }} />
          <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.2)_20deg,transparent_40deg,rgba(255,255,255,0.2)_60deg,transparent_80deg,rgba(255,255,255,0.2)_100deg,transparent_120deg,rgba(255,255,255,0.2)_140deg,transparent_160deg,rgba(255,255,255,0.2)_180deg,transparent_200deg,rgba(255,255,255,0.2)_220deg,transparent_240deg,rgba(255,255,255,0.2)_260deg,transparent_280deg,rgba(255,255,255,0.2)_300deg,transparent_320deg,rgba(255,255,255,0.2)_340deg,transparent_360deg)] opacity-30 rounded-full" style={{ animation: 'rotate-rays 20s linear infinite' }} />
        </div>
      )}
      {(condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')) && (
        <div className="absolute inset-0">
           {[...Array(50)].map((_, i) => (
             <div key={i} className="absolute bg-blue-200/40 w-[2px]" style={{ height: `${Math.random() * 20 + 10}px`, left: `${Math.random() * 100}%`, top: -50, animation: `fall ${Math.random() * 1 + 0.5}s linear infinite`, animationDelay: `${Math.random() * 2}s` }} />
           ))}
        </div>
      )}
      {condition.includes('snow') && (
        <div className="absolute inset-0">
           {[...Array(40)].map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full blur-[1px]" style={{ width: `${Math.random() * 6 + 2}px`, height: `${Math.random() * 6 + 2}px`, left: `${Math.random() * 100}%`, top: -20, animation: `fall ${Math.random() * 3 + 2}s linear infinite`, animationDelay: `${Math.random() * 5}s` }} />
           ))}
        </div>
      )}
      {(condition.includes('cloud') || condition.includes('overcast')) && (
        <div className="absolute inset-0">
           {[...Array(6)].map((_, i) => (
             <Cloud key={i} className="absolute text-white/20 blur-xl" style={{ width: `${Math.random() * 200 + 100}px`, height: 'auto', top: `${Math.random() * 40}%`, left: '-20%', animation: `drift ${Math.random() * 20 + 20}s linear infinite`, animationDelay: `${Math.random() * 10}s` }} />
           ))}
        </div>
      )}
      {condition.includes('thunder') && (
        <div className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none" style={{ animation: 'lightning 5s infinite' }} />
      )}
    </div>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`
    bg-black/20 backdrop-blur-md 
    border border-white/10 
    rounded-3xl p-6 
    shadow-lg
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

const SolarArc = ({ sunrise, sunset }) => {
  const now = Math.floor(Date.now() / 1000);
  const totalDay = sunset - sunrise;
  const elapsed = now - sunrise;
  
  let percent = elapsed / totalDay;
  const isDay = percent >= 0 && percent <= 1;
  const visualPercent = Math.max(0, Math.min(1, percent));
  
  const cx = 150;
  const cy = 130;
  const r = 110; 
  
  const angle = Math.PI - (visualPercent * Math.PI);
  
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle); 

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
       <svg className="w-full h-full" viewBox="0 0 300 150" style={{ overflow: 'visible' }}>
          <path 
            d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} 
            fill="none" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="2" 
            strokeDasharray="6,6" 
          />
          
          {isDay && (
             <>
               <defs>
                 <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="rgba(253, 224, 71, 0.2)" />
                   <stop offset="100%" stopColor="rgba(253, 224, 71, 0.8)" />
                 </linearGradient>
                 <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
               </defs>
               <path 
                 d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${x},${y}`} 
                 fill="none" 
                 stroke="url(#trailGradient)" 
                 strokeWidth="4" 
                 strokeLinecap="round"
               />
               <circle cx={x} cy={y} r="8" fill="#fde047" filter="url(#sunGlow)" />
               <circle cx={x} cy={y} r="14" fill="rgba(253, 224, 71, 0.2)" />
             </>
          )}

          <text x={cx - r} y={cy + 25} fill="rgba(255,255,255,0.7)" textAnchor="middle" fontSize="12" fontWeight="bold">
            {formatTime(sunrise)}
          </text>
          <text x={cx - r} y={cy + 40} fill="rgba(255,255,255,0.4)" textAnchor="middle" fontSize="10" style={{ textTransform: 'uppercase' }}>
            Sunrise
          </text>

          <text x={cx + r} y={cy + 25} fill="rgba(255,255,255,0.7)" textAnchor="middle" fontSize="12" fontWeight="bold">
            {formatTime(sunset)}
          </text>
          <text x={cx + r} y={cy + 40} fill="rgba(255,255,255,0.4)" textAnchor="middle" fontSize="10" style={{ textTransform: 'uppercase' }}>
            Sunset
          </text>
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
  const [error, setError] = useState(null);
  const [units, setUnits] = useState('metric'); 
  
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(WEATHER_API_KEY_STORAGE) || '';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState(() => {
    return !localStorage.getItem(WEATHER_API_KEY_STORAGE);
  });

  useEffect(() => {
    document.title = "SkyCast";
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({ 
            lat: position.coords.latitude, 
            lon: position.coords.longitude 
          }, 'coords');
        },
        (err) => {
          console.warn("Location access denied. Defaulting to San Francisco.");
          fetchWeather("San Francisco", 'city');
        }
      );
    } else {
      fetchWeather("San Francisco", 'city');
    }
  }, []);

  const fetchWeather = async (query, type = 'city') => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 600));

    try {
      if (useDemoMode || !apiKey) {
        const mockWeather = generateMockData(query, type, units);
        const mockAQI = generateMockAQI();
        setWeatherData(mockWeather);
        setAqiData(mockAQI);
        
        if (type === 'city') setCityInput(query);
        else setCityInput(mockWeather.city.name);

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
        
        if (aqResponse.ok) {
          const aqData = await aqResponse.json();
          setAqiData(aqData);
        } else {
          setAqiData(generateMockAQI());
        }

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) fetchWeather(cityInput, 'city');
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }, 'coords'),
      () => { setError("Location access denied."); setLoading(false); }
    );
  };

  const handleSaveSettings = () => {
    if (apiKey) localStorage.setItem(WEATHER_API_KEY_STORAGE, apiKey);
    fetchWeather(cityInput, 'city');
    setShowSettings(false);
  };

  const chartData = useMemo(() => {
    if (!weatherData) return [];
    return weatherData.list.slice(0, 9).map(item => ({
      time: new Date(item.dt * 1000).getHours() + ':00',
      temp: Math.round(item.main.temp),
    }));
  }, [weatherData]);

  const current = weatherData ? weatherData.list[0] : null;
  const currentAQI = aqiData ? aqiData.list[0] : null;
  
  const preciseAQI = currentAQI && currentAQI.components && currentAQI.components.pm2_5 
    ? calculateUSAQI(currentAQI.components.pm2_5) 
    : (currentAQI ? currentAQI.main.aq * 20 : 0);

  const aqiInfo = getAQIInfo(preciseAQI);
  const aqiPosition = getAQIPosition(preciseAQI);

  const getBgGradient = () => {
    if (!current) return "bg-gradient-to-br from-blue-400 to-blue-600";
    const condition = current.weather[0].main.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) return "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900";
    if (condition.includes('snow')) return "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600";
    if (condition.includes('cloud')) return "bg-gradient-to-br from-slate-500 to-gray-600";
    if (condition.includes('clear')) return "bg-gradient-to-br from-sky-400 to-blue-600";
    if (condition.includes('thunder')) return "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900";
    
    return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
  };

  return (
    <div className={`min-h-screen text-white font-sans transition-all duration-700 ease-in-out relative overflow-hidden ${getBgGradient()}`}>
      
      {current && (
        <WeatherEffects 
          weather={current.weather[0]} 
          isDay={current.sys?.pod === 'd' || true} 
        />
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        
        <header className="flex flex-col md:flex-row items-center mb-8 pt-2 gap-4 relative justify-center">
           
           <div className="flex items-center gap-2 md:absolute md:left-0 md:top-2">
              <div className="p-2 bg-white/10 rounded-full">
                <Cloud className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-xl font-bold tracking-wide">SkyCast</span>
           </div>

           <form onSubmit={handleSearch} className="w-full max-w-md relative group z-10">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
               <Search className="w-4 h-4 text-white/60" />
             </div>
             <input
               type="text"
               value={cityInput}
               onChange={(e) => setCityInput(e.target.value)}
               placeholder="Search City"
               className="w-full bg-white/10 border border-white/10 text-white placeholder-white/60 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all text-sm font-medium shadow-sm backdrop-blur-sm text-center md:text-left"
             />
           </form>

           <div className="flex items-center gap-3 md:absolute md:right-0 md:top-2">
              <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
           </div>
        </header>

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">Close</button>
              </div>
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
                   {!useDemoMode ? (
                     <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="OpenWeatherMap API Key" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
                   ) : (
                     <button onClick={() => setUseDemoMode(false)} className="text-sm text-blue-600 underline">Switch to Live Data</button>
                   )}
                   {!useDemoMode && <button onClick={() => setUseDemoMode(true)} className="text-xs text-slate-400 mt-2 hover:text-slate-600">Switch back to Demo Mode</button>}
                </div>
                <button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 animate-spin opacity-70 mb-4" />
            <p className="text-lg font-medium opacity-70">Updating Forecast...</p>
          </div>
        ) : error ? (
           <div className="h-[60vh] flex flex-col items-center justify-center text-center">
            <CloudLightning className="w-16 h-16 opacity-50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p className="opacity-80">{error}</p>
          </div>
        ) : weatherData && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md self-center lg:self-start">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-wide">{weatherData.city.name}</span>
                </div>
                <div className="relative mt-4">
                  <h1 className="text-[7rem] leading-none font-bold tracking-tighter drop-shadow-2xl">
                    {Math.round(current.main.temp)}°
                  </h1>
                  <p className="text-2xl font-medium capitalize opacity-90 pl-2">{current.weather[0].description}</p>
                  <div className="flex gap-4 text-white/70 font-medium pl-2 mt-2">
                    <span>H: {Math.round(current.main.temp_max)}°</span>
                    <span>L: {Math.round(current.main.temp_min)}°</span>
                  </div>
                </div>
              </div>

              <GlassCard className="h-[250px] w-full flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <Activity className="w-4 h-4" />
                  <h3 className="font-semibold text-xs uppercase tracking-wider">24h Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} dy={10} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="temp" stroke="#ffffff" strokeWidth={2} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>

            <GlassCard>
              <div className="grid grid-cols-3 divide-x divide-white/10 gap-y-6">
                <StatItem icon={ThermometerSun} label="Feels Like" value={`${Math.round(current.main.feels_like)}°`} color="text-orange-300" />
                <StatItem icon={Wind} label="Wind" value={getWindDirection(current.wind.deg)} subLabel={`Force ${Math.round(current.wind.speed)}`} color="text-blue-300" />
                <StatItem icon={Droplets} label="Humidity" value={`${current.main.humidity}%`} color="text-cyan-300" />
                
                <div className="col-span-3 h-px bg-white/10 my-2" />

                <StatItem icon={SunDim} label="UV Index" value={Math.round(current.main.uvi || 0) || "Low"} subLabel={current.main.uvi > 5 ? "High" : "Weak"} color="text-yellow-300" />
                <StatItem icon={Eye} label="Visibility" value={`${current.visibility / 1000} km`} color="text-teal-300" />
                <StatItem icon={Gauge} label="Pressure" value={`${current.main.pressure}`} subLabel="hPa" color="text-purple-300" />
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {currentAQI && aqiInfo && (
                <GlassCard className="flex flex-col justify-between">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <h1 className="text-5xl font-bold mb-1">{preciseAQI}</h1>
                       <span className={`text-sm font-bold uppercase tracking-wide ${aqiInfo.color}`}>{aqiInfo.label}</span>
                     </div>
                     <FlaskConical className={`w-8 h-8 ${aqiInfo.color}`} />
                   </div>

                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8 relative">
                      <div className="absolute top-0 bottom-0 left-0 w-[16.6%] bg-emerald-400" />
                      <div className="absolute top-0 bottom-0 left-[16.6%] w-[16.6%] bg-yellow-400" />
                      <div className="absolute top-0 bottom-0 left-[33.2%] w-[16.6%] bg-orange-400" />
                      <div className="absolute top-0 bottom-0 left-[49.8%] w-[16.6%] bg-rose-500" />
                      <div className="absolute top-0 bottom-0 left-[66.4%] w-[16.6%] bg-purple-500" />
                      <div className="absolute top-0 bottom-0 left-[83%] w-[17%] bg-red-800" />
                      
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_black] transition-all duration-1000 ease-out" 
                        style={{ left: `${Math.min(aqiPosition, 98)}%` }} 
                      />
                   </div>

                   <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/50">PM2.5</span>
                        <span className="font-bold text-lg">{Math.round(currentAQI.components.pm2_5)}</span>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${Math.min((currentAQI.components.pm2_5 / 250) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/50">PM10</span>
                        <span className="font-bold text-lg">{Math.round(currentAQI.components.pm10)}</span>
                         <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400" style={{ width: `${Math.min((currentAQI.components.pm10 / 150) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/50">CO</span>
                        <span className="font-bold text-lg">{Math.round(currentAQI.components.co / 100)}</span>
                         <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400" style={{ width: `${Math.min((currentAQI.components.co / 15000) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                       <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/50">SO2</span>
                        <span className="font-bold text-lg">{Math.round(currentAQI.components.so2)}</span>
                         <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${Math.min((currentAQI.components.so2 / 200) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                   </div>
                </GlassCard>
              )}

              <GlassCard className="flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-white/70">Solar Cycle</h3>
                </div>
                <SolarArc sunrise={weatherData.city.sunrise} sunset={weatherData.city.sunset} />
              </GlassCard>

            </div>

            <GlassCard>
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <Calendar className="w-4 h-4" />
                <h3 className="font-semibold text-xs uppercase tracking-wider">7-Day Forecast</h3>
              </div>
              <div className="flex overflow-x-auto pb-2 gap-4 scrollbar-hide">
                {[0, 8, 16, 24, 32, 40, 48].map((offset, i) => {
                  const dayData = weatherData.list[offset];
                  if (!dayData) return null;
                  return (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center justify-between p-4 min-w-[90px] bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                      <span className="text-xs font-medium opacity-80">{i === 0 ? 'Today' : getDayName(dayData.dt)}</span>
                      <WeatherIcon condition={dayData.weather[0].main} className="w-8 h-8 my-3" />
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">{Math.round(dayData.main.temp_max)}°</span>
                        <span className="text-xs opacity-60">{Math.round(dayData.main.temp_min)}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

          </div>
        )}
      </div>
    </div>
  );
}
