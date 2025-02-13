import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API } from '@/utils/api';

export const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
  
    useEffect(() => {
      const handleCallback = async () => {
        try {
          const txnId = localStorage.getItem('currentTransactionId');
          
          if (!txnId) {
            throw new Error('Transaction ID not found');
          }
  
          window.location.href = `${API}/api/v1/payment/validate/${txnId}`;
          
        } catch (error) {
          console.error('Error in payment callback:', error);
          navigate('/payment/failure');
        }
      };
  
      handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
            <p>Please wait while we confirm your payment...</p>
        </div>
        </div>
    );
};


export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false); 

  useEffect(() => {
    const txnId = searchParams.get('txnId');
    if (!txnId) {
      navigate('/payment/failure');
      return;
    }

    localStorage.removeItem('orderSummary');
    localStorage.removeItem('currentTransactionId');
    
    toast.success('Payment completed successfully!');
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
        <p className="mb-4">Thank you for your purchase.</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Orders
        </button>
      </div>
    </div>
  );
};


  export const PaymentFailure = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
      toast.error('Payment failed. Please try again or contact support.');
  
      localStorage.removeItem('currentTransactionId');
      localStorage.removeItem('orderSummary');
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
          <p className="mb-4">Oops! Something went wrong with your payment.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Payment
          </button>
        </div>
      </div>
    );
  };