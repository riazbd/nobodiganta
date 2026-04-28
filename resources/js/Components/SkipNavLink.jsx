import { useApp } from '../contexts/AppContext';

export default function SkipNavLink() {
  const { lang } = useApp();
  return (
    <a href="#main-content" className="skip-nav-link">
      {lang === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
    </a>
  );
}
