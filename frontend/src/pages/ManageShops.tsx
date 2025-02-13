import { FC, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { API } from "@/utils/api";
import { SkeletonGrid } from "@/components/SkeletonGrid";

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  contactNo: string;
  picture: string;
}

export const ManageShops: FC = () => {
  const { user } = useUser();
  const userId = user?.id;

  const userRole =  user?.publicMetadata.role;

  const [shopDetails, setShopDetails] = useState<Shop[]>([]);
  const [charLimit, setCharLimit] = useState(70);
  const [loading, setLoading] = useState<Boolean>(false);

  const navigate = useNavigate();

  const fetchUserShopDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/v1/shop/own/${userId}`);
      setShopDetails(res.data);
    } catch (error) {
      console.log("Failed to get shop details");
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = async (shopId: string) => {
    navigate(`/shop/manage/${shopId}`);
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
    fetchUserShopDetails();
    console.log("user role: ", userRole)
  }, []);

  useEffect(() => {
    updateCharLimit();
    window.addEventListener("resize", updateCharLimit);

    return () => {
      window.removeEventListener("resize", updateCharLimit);
    };
  }, []);
  return (
    <>
      <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <nav className="flex justify-between items-center mb-4">
            <h1 className="font-extrabold text-black flex justify-center text-xl sm:text-4xl mb-2">
              Hey {user?.fullName},
            </h1>
          </nav>

          {shopDetails.map((shop) =>
            // TODO : fix if the word is big it is overflowing
            loading ? (
              <SkeletonGrid count={shopDetails.length} />
            ) : (
              <Card
                key={shop._id}
                className="cursor-pointer mb-6 flex"
                onClick={() => handleShopClick(shop._id)}
              >
                <div className="w-[40%] h-[250px] sm:h-[300px]">
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
                    <CardTitle className="text-2xl">{shop.shopName}</CardTitle>
                    <span className="text-[10px] sm:text-sm">{shop._id}</span>
                    <CardDescription>
                      <p>
                        <span className="text-sm">
                          {shop.address.length > charLimit
                            ? `${shop.address.substring(0, charLimit)}...`
                            : shop?.address}
                        </span>
                      </p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      <span className="font-bold text-[10px] sm:text-lg  sm:font-semibold ">
                        Contact
                      </span>
                      :
                      <span className=" pl-1 text-[10px] sm:text-sm">
                        {shop.contactNo}
                      </span>
                    </p>
                  </CardContent>
                </div>
              </Card>
            )
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};
