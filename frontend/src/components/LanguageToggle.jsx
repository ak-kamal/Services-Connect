import { useLanguage } from '../i18n/LanguageContext';

function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`btn btn-sm btn-outline ${className}`}
      title={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
    >
      {language === 'en' ? 'বাংলা' : 'English'}
    </button>
  );
}

export default LanguageToggle;
