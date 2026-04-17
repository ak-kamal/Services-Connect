import { useLanguage } from '../i18n/LanguageContext';

function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className={`btn btn-sm btn-ghost ${className}`}
      onClick={toggleLanguage}
      title="Toggle language"
    >
      {language === 'en' ? 'বাংলা' : 'English'}
    </button>
  );
}

export default LanguageToggle;
