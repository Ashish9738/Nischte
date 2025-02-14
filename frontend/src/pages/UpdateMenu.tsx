import { FC, useEffect, useState } from "react";
import { ItemFields } from "@/data/ItemFields";
import { useParams } from "react-router-dom";
import Form from "@/components/Form";
import { API } from "@/utils/api";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Item {
  _id: string;
  itemName: string;
  itemDescription: string;
  offerId?: string;
  picture?: string;
  price: number;
}

export const UpdateMenu: FC = () => {
  const [item, setItem] = useState<Item>();
  const { shopId, menuId } = useParams();
  const { getToken } = useAuth();

  const { user } = useUser();

  const navigate = useNavigate();

  const fetchItemDetails = async () => {
    try {
      const res = await axios.get(
        `${API}/api/v1/shop/${shopId}/menu/${menuId}`
      );
      setItem(res?.data);
      console.log("resooo: ", res.data);
    } catch (error) {
      toast.error("Failed to fetch shop details.");
    }
  };

  const handleUpdateItem = async (
    data: Record<string, any>,
    resetForm: () => void
  ) => {
    const ownerId = user?.id;

    const formData = new FormData();

    if (ownerId) {
      formData.append("ownerId", ownerId);
    }

    Object.keys(data).forEach((key) => {
      if (
        key === "picture" &&
        data[key] instanceof FileList &&
        data[key].length > 0
      ) {
        formData.append(key, data[key][0]);
      } else {
        formData.append(key, String(data[key]));
      }
    });

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const token = await getToken();
      const res = await axios.patch(
        `${API}/api/v1/shop/${shopId}/menu/${menuId}`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );
      console.log("resff:", res.data.items);
      toast.success("Item details updated successfully!");
      resetForm();
      navigate(`/shop/manage/${shopId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          `Failed to update Item details: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, []);
  return (
    <>
      <div className="flex flex-col px-6 md:px-[200px] min-h-screen">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Update Item Details
            </h2>
            {item && (
              <Form
                fields={ItemFields}
                onSubmit={handleUpdateItem}
                initialData={item}
                submitButtonText="Update Item"
              />
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
