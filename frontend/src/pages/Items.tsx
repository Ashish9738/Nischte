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

interface Item {
  _id: string;
  itemName: string;
  itemDescription: string;
  price: number;
  picture: string;
}

interface ItemResponse {
  items: Item[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const Items: FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [charLimit, _setCharLimit] = useState(70);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const fetchItems = useCallback(async (currentPage: number, search: string = "") => {
    try {
      setLoading(true);
      const res = await axios.get<ItemResponse>(
        `${API}/api/v1/shop/menu?page=${currentPage}&limit=${itemsPerPage}&search=${search}`
      );

      if (currentPage === 1) {
        setItems(res.data.items);
      } else {
        setItems(prev => [...prev, ...res.data.items]);
      }

      setTotal(res.data.pagination.totalItems);
      setHasMore(res.data.pagination.hasNextPage);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch items", error);
      setLoading(false);
    }
  }, [itemsPerPage]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setPage(1);
      fetchItems(1, searchQuery);
    }, 300),
    [fetchItems]
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
      fetchItems(nextPage, searchTerm);
    }
  };

  const handleItemDetailsClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  useEffect(() => {
    fetchItems(1); // Fetch items on component mount
  }, [fetchItems]);

  const shouldShowViewMore = !searchTerm && hasMore && items.length < total;

  return (
    <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <div className="my-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-extrabold text-black text-2xl">Items</h1>
            <div className="w-1/3">
              <Input
                type="text"
                placeholder="Search by items..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
          </div>

          {items.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <SkeletonGrid count={items.length} />
                ) : (
                  items.map((item) => (
                    <Card
                      key={item._id}
                      className="cursor-pointer mb-4 flex hover:shadow-lg transition-shadow"
                      onClick={() => handleItemDetailsClick(item._id)}
                    >
                      <div className="w-[40%] h-[230px] sm:h-[300px]">
                        <div className="relative w-full h-full">
                          <img
                            src={item?.picture}
                            alt={`${item?.itemName}`}
                            className="absolute inset-0 w-full h-full object-cover rounded-tl-md rounded-bl-md"
                          />
                        </div>
                      </div>
                      <div className="w-[60%]">
                        <CardHeader>
                          <CardTitle className="text-2xl">
                            {item.itemName}
                          </CardTitle>
                          <CardDescription>
                            <p>
                              <span className="text-sm">
                                {item.itemDescription.length > charLimit
                                  ? `${item.itemDescription.substring(0, charLimit)}...`
                                  : item.itemDescription}
                              </span>
                            </p>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>
                            <span className="font-bold text-[10px] sm:text-lg sm:font-semibold">
                              Price
                            </span>
                            :
                            <span className="pl-1 text-[10px] sm:text-sm">
                              ${item.price}
                            </span>
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {shouldShowViewMore && (
                <div className="flex justify-center my-4">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-xs sm:text-base"
                  >
                    {loading ? "Loading..." : "View More"}
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
