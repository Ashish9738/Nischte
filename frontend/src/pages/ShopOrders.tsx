import { FC, useCallback, useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { debounce } from "lodash";
import axios from "axios";
import { API } from "@/utils/api";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  _id: string;
  itemName: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  appliedOffer?: {
    offerId: string;
    offerName: string;
    description: string;
  };
}

interface OrderDetails {
  _id: string;
  transactionId: string;
  createdAt?: string;
  status: string;
  cartTotal: number;
  totalItems: number;
  totalSavings: number;
  items: OrderItem[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasMore: boolean;
}

export const ShopOrders: FC = () => {
  const { shopId } = useParams();
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { getToken } = useAuth();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination?.hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, pagination?.hasMore]
  );

  const handlePickupStatus = async (orderId: string) => {
    try {
      const token = await getToken();
      await axios.patch(`${API}/api/v1/order/${orderId}/update-status`, {
        status: 'collected',
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  
      // Update the order status in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'collected' }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to update pickup status:", error);
    }
  }


  const fetchOrders = useCallback(async (search = "", pageNum = 1, append = false) => {
    try {
      setLoading(pageNum === 1);
      setIsLoadingMore(pageNum > 1);
      
      const token = await getToken();
      const { data } = await axios.get(
        `${API}/api/v1/order/shop/view/${shopId}?search=${search}&page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sortedOrders = data.orders.sort(
        (a: OrderDetails, b: OrderDetails) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );

      setOrders(prev => append ? [...prev, ...sortedOrders] : sortedOrders);
      setPagination(data.pagination);
    } catch (error) {
      setError("Failed to fetch shop orders. Please try again later.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [shopId, getToken]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(1);
      fetchOrders(query, 1, false);
    }, 300),
    [fetchOrders]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  useEffect(() => {
    if (shopId && page > 1) {
      fetchOrders(searchQuery, page, true);
    }
  }, [page, shopId, fetchOrders, searchQuery]);

  useEffect(() => {
    if (shopId) {
      fetchOrders("", 1, false);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [shopId, fetchOrders, debouncedSearch]);

  return (
    <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shop Orders</h1>
          <div className="w-1/3">
            <Input
              type="text"
              placeholder="Search by Order ID..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {loading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : orders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Orders Found</CardTitle>
              <CardDescription>
                {searchQuery 
                  ? "No orders match your search criteria."
                  : "Your shop has no orders yet."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Card 
                key={order._id} 
                ref={index === orders.length - 1 ? lastOrderRef : null}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order._id.slice(-8)}
                      </CardTitle>
                      <CardDescription>
                        Transaction ID: {order.transactionId}
                        <br />
                        Date: {new Date(order.createdAt || "").toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      disabled={order.status === "collected"}
                      onClick={() => handlePickupStatus(order._id)}
                      variant={order.status === "collected" ? "secondary" : "default"}
                      className="capitalize"
                    >
                      {order.status || "pending"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="items">
                      <AccordionTrigger>
                        Order Details ({order.totalItems} items)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mt-2">
                          {order.items.map((item) => (
                            <div key={item._id} className="flex justify-between border-b pb-3">
                              <div>
                                <p className="font-medium">{item.itemName}</p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × ₹{item.basePrice}
                                </p>
                                {item.appliedOffer && (
                                  <Badge variant="default" className="mt-1">
                                    {item.appliedOffer.description}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{item.finalPrice}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
            {isLoadingMore && (
              <Skeleton className="h-32 w-full" />
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ShopOrders;