const times = {"fajr":"04:30 AM","sunrise":"05:45 AM","dhuhr":"12:15 PM","asr":"04:00 PM","maghrib":"06:15 PM","sunset":"06:15 PM","isha":"07:30 PM","isha_end":"11:45 PM"};

function getNextPrayer(times) {
  if (!times) return null;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  for (const name of prayers) {
    if (!times[name]) continue;
    
    const match = times[name].match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';
      
      if (isPm && h !== 12) h += 12;
      if (!isPm && h === 12) h = 0;
      
      const pMin = h * 60 + m;
      if (pMin > nowMin) {
        const diff = pMin - nowMin;
        return { name, diff };
      }
    }
  }
  
  if (times.fajr) {
    const match = times.fajr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';
      
      if (isPm && h !== 12) h += 12;
      if (!isPm && h === 12) h = 0;
      
      const pMin = h * 60 + m + 24 * 60;
      const diff = pMin - nowMin;
      return { name: 'fajr', diff };
    }
  }
  
  return { name: 'fajr', diff: 0 };
}

console.log(getNextPrayer(times));
