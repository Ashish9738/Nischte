import { FC, useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { debounce } from "lodash";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { SkeletonGrid } from "@/components/SkeletonGrid";

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  contactNo: string;
  picture: string;
}

interface ShopResponse {
  shops: Shop[];
  total: number;
  hasNextPage: boolean;
  currentPage: number;
  totalPages: number;
}

export const Shops: FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [charLimit, setCharLimit] = useState(70);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [loading, setLoading] = useState(false);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const fetchShops = useCallback(async (currentPage: number, search: string = "") => {
    try {
      setLoading(true);
      const res = await axios.get<ShopResponse>(
        `${API}/api/v1/shop?page=${currentPage}&limit=${itemsPerPage}&search=${search}`
      );

      if (currentPage === 1) {
        setShops(res.data.shops);
      } else {
        setShops(prev => [...prev, ...res.data.shops]);
      }

      setTotal(res.data.total);
      setHasMore(res.data.currentPage < res.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch shops", error);
      setLoading(false);
    }
  }, [itemsPerPage]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setPage(1); // Reset to first page for new search
      fetchShops(1, searchQuery);
    }, 300),
    [fetchShops]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShops(nextPage, searchTerm);
    }
  };

  const handleShopDetailsClick = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  const updateCharLimit = () => {
    const width = window.innerWidth;
    if (width < 640) {
      setCharLimit(70);
    } else if (width >= 640 && width < 1024) {
      setCharLimit(70);
    } else {
      setCharLimit(200);
    }
  };

  useEffect(() => {
    updateCharLimit();
    window.addEventListener("resize", updateCharLimit);
    return () => window.removeEventListener("resize", updateCharLimit);
  }, []);

  useEffect(() => {
    fetchShops(1);
    return () => {
      debouncedSearch.cancel();
    };
  }, [fetchShops]);
  const shouldShowViewMore = !searchTerm && hasMore && shops.length < total;

  return (
    <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <div className="my-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-extrabold text-black text-2xl">Shops</h1>
            <div className="w-1/3">
              <Input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
          </div>

          {shops.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No shops found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <SkeletonGrid count={shops.length} />
                ) : (
                  shops.map((shop) => (
                    <Card
                      key={shop._id}
                      className="cursor-pointer mb-4 flex hover:shadow-lg transition-shadow"
                      onClick={() => handleShopDetailsClick(shop._id)}
                    >
                      <div className="w-[40%] h-[230px] sm:h-[300px]">
                        <div className="relative w-full h-full">
                          <img
                            src={shop?.picture}
                            alt={`${shop?.shopName}`}
                            className="absolute inset-0 w-full h-full object-cover rounded-tl-md rounded-bl-md"
                          />
                        </div>
                      </div>
                      <div className="w-[60%]">
                        <CardHeader>
                          <CardTitle className="text-2xl">
                            {shop.shopName}
                          </CardTitle>
                          <span className="text-[10px] sm:text-sm text-gray-500">
                            {shop._id}
                          </span>
                          <CardDescription>
                            <p>
                              <span className="text-sm">
                                {shop.address.length > charLimit
                                  ? `${shop.address.substring(0, charLimit)}...`
                                  : shop.address}
                              </span>
                            </p>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>
                            <span className="font-bold text-[10px] sm:text-lg sm:font-semibold">
                              Contact
                            </span>
                            :
                            <span className="pl-1 text-[10px] sm:text-sm">
                              {shop.contactNo}
                            </span>
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {shouldShowViewMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="w-full max-w-xs"
                  >
                    {loading ? "Loading..." : "View More Shops"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shops;
