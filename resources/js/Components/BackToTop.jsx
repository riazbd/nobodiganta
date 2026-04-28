import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button id="btt" className={visible ? 'show' : ''} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>▲</button>
  );
}
