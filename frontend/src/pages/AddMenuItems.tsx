import Form from "@/components/Form";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FC } from "react";
import axios from "axios";
import { API } from "@/utils/api";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { ItemFields } from "@/data/ItemFields";
import { useAuth } from "@clerk/clerk-react";

export const AddMenuItem: FC = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleAddMenuItem = async (
    data: Record<string, any>,
    resetForm: () => void
  ) => {
    const formData = new FormData();

    if (shopId) {
      formData.append("shopId", shopId);
    }

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    if (data.picture) {
      formData.append("picture", data.picture[0]);
    }

    try {

      const token = await getToken();
      await axios.post(`${API}/api/v1/shop/${shopId}/menu`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
         },
      });
      toast.success("Menu item added successfully!");
      navigate(`/shop/manage/${shopId}`);
      resetForm();
    } catch (error: any) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item. Please try again.");
    }
  };

  return (
    <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Add Menu Item
          </h2>
          <Form
            fields={ItemFields}
            onSubmit={handleAddMenuItem}
            submitButtonText="Add Item"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};
