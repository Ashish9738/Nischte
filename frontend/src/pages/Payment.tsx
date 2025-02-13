import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API } from '@/utils/api';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

export const PaymentCallback = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            const { getToken } = useAuth();
            try {

                const token = await getToken();
                const txnId = localStorage.getItem('currentTransactionId');
                if (!txnId) throw new Error('Transaction ID not found');

                const response = await axios.get(`${API}/api/v1/payment/validate/${txnId}`);
                if (!response.data.success) throw new Error('Payment validation failed');

                const orderSummary = localStorage.getItem('orderSummary');
                if (!orderSummary) throw new Error('Order summary not found');

                const parsedOrderSummary = JSON.parse(orderSummary);

                const orderData = {
                    ...parsedOrderSummary,
                    transactionId: txnId,
                };

                const orderResponse = await axios.post(`${API}/api/v1/order/create`, orderData, {
                    headers: {

                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!orderResponse.data.success) throw new Error('Order creation failed');

                localStorage.removeItem('orderSummary');
                localStorage.removeItem('currentTransactionId');
                const userId = orderResponse.data.order.userId;
                navigate(`/${userId}/order`);
            } catch (error) {
                console.error('Error in payment processing:', error);
                toast.error(error instanceof Error ? error.message : 'Payment processing failed.');
                navigate('/payment/failure');
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                    {isProcessing ? 'Processing Payment...' : 'Payment Processed'}
                </h2>
                <p>{isProcessing ? 'Please wait while we confirm your payment...' : 'You can now check your orders.'}</p>
                {!isProcessing && (
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        View Orders
                    </button>
                )}
            </div>
        </div>
    );
};
