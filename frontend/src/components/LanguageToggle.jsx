import { useLanguage } from '../i18n/LanguageContext';

function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage();
  const isEn = language === 'en';

  return (
    <button
      onClick={toggleLanguage}
      title="Toggle language"
      className={`flex items-center gap-0 rounded-full border border-base-300 bg-base-200 p-1 shadow-inner transition-all hover:shadow-md ${className}`}
    >
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${
          isEn
            ? 'bg-primary text-primary-content shadow-sm'
            : 'text-base-content/50'
        }`}
      >
        EN
      </span>
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${
          !isEn
            ? 'bg-primary text-primary-content shadow-sm'
            : 'text-base-content/50'
        }`}
      >
        বাং
      </span>
    </button>
  );
}

export default LanguageToggle;
