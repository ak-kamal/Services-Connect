// frontend/src/pages/PaymentSuccess.jsx

import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const offerId = searchParams.get('offerId');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div className="bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Payment Successful</h1>
        <p className="mb-4">
          Your payment has been completed successfully.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Offer ID: {offerId}
        </p>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;