import { Navbar } from "../components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaMinus, FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/utils/api";

import HeroImage from "../assets/HeroImage.png";
import HeroImage2 from "../assets/HeroImage2.jpg";
import HeroImage3 from "../assets/HeroImage3.jpg";
import HeroImage4 from "../assets/HeroImage4.jpg";

const HeroImages = [
  { name: "Banner1", path: HeroImage, id: 1 },
  { name: "Banner2", path: HeroImage2, id: 2 },
  { name: "Banner3", path: HeroImage3, id: 3 },
  { name: "Banner4", path: HeroImage4, id: 4 },
];

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  contactNo: string;
  picture: string;
}

interface Item {
  _id: string;
  itemName: string;
  itemDescription: string;
  picture: string;
  offerId?: string;
  price: number;
  shopId: string;
}

export const Home = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();
  const { dispatch } = useCart();

  const fetchShopDetails = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/shop?limit=4`);
      setShops(res.data);
    } catch (error) {
      console.log("Failed to fetch the shop details", error);
    }
  };

  const fetchItemsDetails = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/shop/menu?limit=4`);
      setItems(res.data);
    } catch (error) {
      console.log("Failed to fetch the shop details", error);
    }
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    setQuantities({ ...quantities, [itemId]: value });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantities((prev) => ({ ...prev, [itemId]: "1" }));
      return;
    }
    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity.toString() }));
  };

  const handleQuantityBlur = (itemId: string) => {
    const inputValue = quantities[itemId];
    if (!inputValue) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: "1",
      }));
      return;
    }

    const newQuantity = parseInt(inputValue);
    if (isNaN(newQuantity) || newQuantity < 1) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: "1",
      }));
      toast.error("Please enter a valid quantity");
      return;
    }

    handleUpdateQuantity(itemId, newQuantity);
  };

  const handleAddToCart = (item: Item) => {
    const quantity = parseInt(quantities[item._id] || "1");
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_TO_CART", payload: item });
    }

    toast.success(`${quantity} x ${item.itemName} added to your cart`, {
      duration: 2000,
    });
  };

  const handleShopDetailsClick = (shopId: string) => {
    try {
      navigate(`/shop/${shopId}`);
    } catch (error) {
      console.log("Failed to get shop details");
    }
  };

  const handleItemClick = (itemId: string, shopId: string) => {
    try {
      navigate(`/shop/${shopId}/menu/${itemId}`);
    } catch (error) {
      console.log("Failed to get item details");
    }
  };

  const handleShopViewMore = () => {
    navigate("/shops");
  };

  useEffect(() => {
    fetchShopDetails();
    fetchItemsDetails();
  }, []);

  return (
    <>
      <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          {/* Hero section */}
          <div className="h-[500px] w-full relative overflow-hidden mb-5">
            <Carousel
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
            >
              <CarouselContent>
                {HeroImages.map(({ name, id, path }) => (
                  <CarouselItem key={id}>
                    <img src={path} alt={name} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Display shop details */}
          <div className="flex justify-between">
            <h1 className="font-extrabold text-black mb-4 text-2xl">Shops</h1>
            <p
              className="text-blue-700 cursor-pointer"
              onClick={handleShopViewMore}
            >
              View more
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
            {shops.map((shop) => (
              <Card
                key={shop._id}
                className="cursor-pointer"
                onClick={() => handleShopDetailsClick(shop._id)}
              >
                <img
                  src={shop.picture}
                  alt={shop.shopName}
                  className="h-48 w-full object-cover rounded-t-md"
                />
                <CardHeader>
                  <CardTitle className="text-2xl">{shop.shopName}</CardTitle>
                  <CardDescription>{shop.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    <span className="font-bold">Contact</span>: {shop.contactNo}
                  </p>
                </CardContent>
                <CardFooter>
                  <p>
                    <span className="font-bold">Shop ID</span>: {shop._id}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Display menu items */}
          <div className="mt-6">
            <div className="flex justify-between">
              <h1 className="font-extrabold text-black mb-4 text-2xl">
                New In Store
              </h1>
              <p className="text-blue-700">View more</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
              {items.map((item) => (
                <Card
                  key={item._id}
                  className="cursor-pointer w-full flex flex-col h-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item._id, item.shopId);
                  }}
                >
                  <img
                    src={item.picture}
                    alt={item.itemName}
                    className="h-48 w-full object-cover rounded-t-md"
                  />

                  <div className="flex flex-col flex-grow">
                    <CardHeader>
                      <CardTitle className="text-xl">{item.itemName}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <p className="text-sm">{item.itemDescription}</p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <div className="w-full">
                        <p className="font-bold mb-2">&#8377;{item.price}</p>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(
                                  item._id,
                                  parseInt(quantities[item._id] || "1") - 1
                                );
                              }}
                            >
                              <FaMinus className="h-4 w-4" />
                            </Button>

                            <Input
                              type="text"
                              value={quantities[item._id] || "1"}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item._id, e.target.value);
                              }}
                              onBlur={(e) => {
                                e.stopPropagation();
                                handleQuantityBlur(item._id);
                              }}
                              className="w-12 text-center h-8 px-1"
                              onClick={(e) => e.stopPropagation()}
                            />

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(
                                  item._id,
                                  parseInt(quantities[item._id] || "1") + 1
                                );
                              }}
                            >
                              <FaPlus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            className="h-8 text-sm"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
