export function getLang(news, field, lang = 'bn') {
  if (lang === 'en') {
    return news[field + 'En'] || news[field];
  }
  return news[field];
}

export function toBengaliNum(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, d => bnDigits[d]);
}

export function toEnglishNum(num) {
  const bnMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
  return String(num).replace(/[০-৯]/g, d => bnMap[d] || d);
}
