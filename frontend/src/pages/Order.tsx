import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import { API } from "@/utils/api";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery } from "@/Hooks/useQuery";

interface OrderDetails {
  _id: string;
  transactionId: string;
  cartTotal: number;
  totalItems: number;
  totalSavings: number;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    basePrice: number;
    finalPrice: number;
    appliedOffer?: {
      offerId: string;
      offerName: string;
      description: string;
      discountRate?: number;
      plusOffer?: number;
    };
  }>;
  createdAt: string;
}

export const Order = () => {
  const query = useQuery();
  const reference = query.get("reference");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { user, isLoaded } = useUser();

  const userId = user?.id;

  useEffect(() => {
    const createOrder = async (paymentId: string) => {
      const { getToken } = useAuth();
      try {

        const token = await getToken();
        if (!isLoaded) {
          return;
        }

        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const orderSummaryStr = localStorage.getItem("orderSummary");
        if (!orderSummaryStr) {
          throw new Error("Order summary not found in local storage");
        }

        const orderSummary = JSON.parse(orderSummaryStr);

        const orderData = {
          userId: user.id,
          items: orderSummary.items,
          cartTotal: orderSummary.cartTotal,
          transactionId: paymentId,
          originalQuantity: orderSummary.originalQuantity,
          totalItems: orderSummary.totalItems,
          totalSavings: orderSummary.totalSavings,
        };

        const response = await axios.post(`${API}/api/v1/order`, orderData, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to create order");
        }

        setOrderDetails(response.data.order);
        dispatch({ type: "CLEAR_CART" });
        toast.success("Order placed successfully!");
      } catch (err) {
        console.log("here", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create order";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const queryParams = new URLSearchParams(location.search);
      const paymentReference = queryParams.get("reference");

      if (!paymentReference) {
        setError("No payment reference found");
        setLoading(false);
        setTimeout(() => navigate("/cart"), 3000);
        return;
      }

      if (isLoaded) {
        await createOrder(paymentReference);
      }
    };

    init();
  }, [location, navigate, dispatch, user, isLoaded]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg">Processing your order...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              Order Error
            </h1>
            <p className="mb-3">
              Don't worry your money is safe, we'll reach back to you within
              5hr. Submit the report with your payment id.
            </p>
            <p className="mb-3">
              Payment id: <span className="font-semibold">{reference}</span>
            </p>
            <Button
              onClick={() => navigate(`/support/${userId}`)}
              className="w-full"
            >
              Support
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-yellow-600">
              Order Not Found
            </h1>
            <p className="mb-4">
              Unable to find order details. Please try refreshing the page.
            </p>
            <p>
              Don't worry your money is safe, we'll reach back to you within
              5hr. Submit the report with your payment id.
            </p>
            <Button
              onClick={() => navigate(`/support/${userId}`)}
              className="w-full"
            >
              Support
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 md:px-[200px]">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Order Successful!
            </h1>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-extrabold mb-2">Transaction Details</h2>
              <div className="grid grid-rows-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Transaction ID</p>
                  <p className="font-medium">{orderDetails.transactionId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-medium">{orderDetails._id}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-3">Order Summary</h2>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex justify-between items-start border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{item.basePrice}
                      </p>
                      {item.appliedOffer && (
                        <p className="text-sm text-green-600 mt-1">
                          {item.appliedOffer.description}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">₹{item.finalPrice}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Subtotal ({orderDetails.totalItems} items)</p>
                <p>₹{orderDetails.cartTotal}</p>
              </div>
              {orderDetails.totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <p>Total Savings</p>
                  <p>-₹{orderDetails.totalSavings}</p>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2">
                <p>Total</p>
                <p>₹{orderDetails.cartTotal}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => navigate("/shops")}
                className="flex-1"
                variant="outline"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => navigate(`/${userId}/order`)}
                className="flex-1"
              >
                View All Orders
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};
