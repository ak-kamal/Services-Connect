// frontend/src/pages/PaymentSuccess.jsx

import { useNavigate, useSearchParams } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const offerId = searchParams.get('offerId');

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Fixed Language Toggle at top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <LanguageToggle />
      </div>

      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold text-green-600 mb-4">{t('payment.success.title')}</h1>
          <p className="mb-4">
            {t('payment.success.message')}
          </p>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            {t('payment.success.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;