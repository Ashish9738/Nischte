import { API } from "@/utils/api";
import { Navbar } from "@/components/Navbar";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { SkeletonGrid } from "@/components/SkeletonGrid";
import ItemBanner from "@/components/ItemBanner";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";

interface Item {
  _id: string;
  itemName: string;
  itemDescription: string;
  picture: string;
  offerId?: string;
  price: number;
  shopId: string;
}

export const MenuDetails: FC = () => {
  const { shopId, menuId } = useParams();
  const [item, setItem] = useState<Item>();
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [otherItems, setOtherItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { dispatch } = useCart();

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/v1/shop/${shopId}/menu/${menuId}`
      );
      console.log("res for items: ", res.data);
      setItem(res.data);
    } catch (error) {
      console.log("Failed to get the item details");
    } finally {
      setLoading(false);
    }
  };

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/v1/shop/${shopId}/menu`);
      setShopItems(res.data[0].items);
    } catch (error) {
      console.log("Failed to fetch the items of shop");
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/v1/shop/menu?limit=4&page=1`);
      setOtherItems(res.data.items);
    } catch (error) {
      console.log("Failed to fetch other items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (itemData: any, quantity: number) => {
    try {
      for (let i = 0; i < quantity; i++) {
        dispatch({
          type: "ADD_TO_CART",
          payload: {
            ...itemData,
            itemName: itemData.name,
            _id: itemData.id,
            shopId: itemData.shopId,
          },
        });
      }
      toast.success(`${quantity} x ${itemData.name} added to your cart`, {
        duration: 2000,
      });
    } catch (error) {
      console.log("Failed to add item to cart", error);
      toast.error("Failed to add item to cart");
    }
  };

  const handleItemClick = (itemId: string, shopId: string): void => {
    try {
      navigate(`/shop/${shopId}/menu/${itemId}`);
    } catch (error) {
      console.log("Failed to get item details");
      toast.error("Failed to open item details");
    }
  };

  useEffect(() => {
    console.log("haha: ", shopId, "and", menuId);
    fetchItemDetails();
    fetchShopItems();
    fetchOtherItems();
  }, [menuId]);

  return (
    <div className="px-6 md:px-[200px]">
      <Navbar />

      {/* Item Banner */}
      <div className="my-4 w-full">
        {loading ? (
          <SkeletonGrid count={1} />
        ) : (
          item && (
            <ItemBanner
              id={item._id}
              shopId={shopId || ""}
              description={item.itemDescription}
              name={item.itemName}
              image={item.picture}
              price={item.price}
              currency="₹"
              onAddToCart={handleAddToCart}
            />
          )
        )}
      </div>

      {/* Shop Items Section */}
      <div className="mt-8">
        <div className="flex justify-between">
          <h1 className="font-extrabold text-black mb-4 text-2xl">
            More from this Shop
          </h1>
          <Button
            className="cursor-pointer"
            onClick={() => navigate(`/shop/${shopId}`)}
          >
            View all
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            shopItems
              .filter(item => item._id !== menuId)
              .slice(0, 4)
              .map((item) => (
                <ItemCard
                  key={item._id}
                  id={item._id}
                  shopId={shopId || ""}
                  name={item.itemName}
                  image={item.picture}
                  price={item.price}
                  currency="₹"
                  onItemClick={handleItemClick}
                  onAddToCart={handleAddToCart}
                />
              ))
          )}
        </div>
      </div>

      {/* Other Items Section */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between">
          <h1 className="font-extrabold text-black mb-4 text-2xl">
            You may also like
          </h1>
          <Button
            className="cursor-pointer"
            onClick={() => navigate("/items")}
          >
            View more
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            otherItems
              .filter(item => item._id !== menuId && item.shopId !== shopId)
              .slice(0, 4)
              .map((item) => (
                <ItemCard
                  key={item._id}
                  id={item._id}
                  shopId={item.shopId}
                  name={item.itemName}
                  image={item.picture}
                  price={item.price}
                  currency="₹"
                  onItemClick={handleItemClick}
                  onAddToCart={handleAddToCart}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};