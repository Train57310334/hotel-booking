import { useEffect, useState } from 'react'
import { getInitialTheme, applyTheme } from '@/lib/theme'

export default function ThemeToggle({ compact=false }){
  const [theme, setTheme] = useState('light');
  useEffect(()=>{
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };
  if (compact){
    return (
      <button onClick={toggle} className="text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">
        {theme === 'dark' ? '🌙 Dark' : '🌞 Light'}
      </button>
    )
  }
  return (
    <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/80 backdrop-blur border dark:border-gray-700 rounded-xl p-2">
      <button onClick={()=>{setTheme('light');applyTheme('light')}} className={`px-3 py-1.5 rounded-lg text-sm ${theme==='light'?'bg-green-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Light</button>
      <button onClick={()=>{setTheme('dark');applyTheme('dark')}} className={`px-3 py-1.5 rounded-lg text-sm ${theme==='dark'?'bg-green-600 text-white':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Dark</button>
    </div>
  )
}
