import Form from "@/components/Form";
import { FC, useEffect, useState } from "react";
import { ShopFields } from "@/data/ShopField";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "@/utils/api";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  contactNo: string;
  picture?: string;
  ownerId: string;
}

export const UpdateShop: FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shopDetails, setShopDetails] = useState<Shop>();

  const fetchShopDetails = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/shop/${shopId}`);
      setShopDetails(res?.data);
    } catch (error) {
      toast.error("Failed to fetch shop details.");
    }
  };

  const handleUpdateShop = async (
    data: Record<string, any>,
    resetForm: () => void
  ) => {
    const ownerId = user?.id;
    const formData = new FormData();

    if (data.picture instanceof FileList && data.picture.length > 0) {
      formData.append('picture', data.picture[0]);
    }

    formData.append('shopName', data.shopName);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('contactNo', data.contactNo);
    if (ownerId) {
      formData.append('ownerId', ownerId);
    }

    try {
      const token = await getToken();
      const response = await axios.patch(`${API}/api/v1/shop/${shopId}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success("Shop details updated successfully!");
        resetForm();
        navigate(`/shop/manage/${shopId}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          `Failed to update shop details: ${
            error.response?.data?.message || error.message
          }`
        );
        console.error('Error response:', error.response);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
        console.error('Error:', error);
      }
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [shopId]);

  return (
    <div className="flex flex-col px-6 md:px-[200px] min-h-screen">
      <Navbar />
      <div className="flex-grow items-center flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Update Your Shop
          </h2>
          {shopDetails && (
            <Form
              fields={ShopFields}
              onSubmit={handleUpdateShop}
              initialData={shopDetails}
              submitButtonText="Update Shop"
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};