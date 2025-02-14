import OfferForm from "@/components/OfferForm";
import { FC, useEffect, useState } from "react";
import { OfferFields } from "@/data/OfferField";
import { Offer } from "./Offer";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@clerk/clerk-react";

interface OfferType {
  name: string;
}

interface OfferDescription {
  minOrder?: number;
  numberOfVisits?: number;
  description: string;
  discountRate?: number;
  plusOffers?: number;
  specialOccasionDate?: string;
}

interface Offer {
  offerType: OfferType;
  _isActive: boolean;
  offerDescription: OfferDescription;
  _id: string;
}

export const UpdateOffer: FC = () => {
  const { offerId, shopId, menuId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);

  const fetchOfferDetails = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/offer/${offerId}`);
      if (res.data.offer && res.data.offer.length > 0) {
        setOffer(res.data.offer[0].offers[0]);
      }
    } catch (error) {
      console.log("Failed to get the offer details");
    }
  };

  const handleUpdateOffer = async (
    data: Record<string, any>,
    resetForm: () => void
  ) => {
    try {
      const token = await getToken();
      const payload = {
        offerType: {
          name: data["offerType.name"],
        },
        _isActive: data._isActive,
        offerDescription: {
          minOrder: data["offerDescription.minOrder"],
          discountRate: data["offerDescription.discountRate"],
          plusOffers: data["offerDescription.plusOffers"],
          specialOccasionDate: data["offerDescription.specialOccasionDate"],
          description: data["offerDescription.description"],
          numberOfVisits: data["offerDescription.numberOfVisits"],
        },
      };

      await axios.patch(`${API}/api/v1/offer/${offerId}`, payload, {
        headers : {
          "Authorization": `Bearer ${token}`
        }
      });

      toast.success("Offer updated successfully!");
      resetForm();
      navigate(`/shop/${shopId}/menu/${menuId}/offer`);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchOfferDetails();
  }, []);
  return (
    <>
     <div className="flex flex-col px-6 md:px-[200px] min-h-screen">
      <Navbar />
      <div className="flex-grow justify-center items-center flex">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Update offer
          </h2>
          {offer && (
            <OfferForm
              fields={OfferFields}
              onSubmit={handleUpdateOffer}
              isUpdate={true}
              initialData={{
                "offerType.name": offer.offerType.name,
                _isActive: offer._isActive,
                "offerDescription.minOrder": offer.offerDescription.minOrder,
                "offerDescription.discountRate":
                  offer.offerDescription.discountRate,
                "offerDescription.plusOffers":
                  offer.offerDescription.plusOffers,
                "offerDescription.specialOccasionDate":
                  offer.offerDescription.specialOccasionDate,
                "offerDescription.description":
                  offer.offerDescription.description,
                "offerDescription.numberOfVisits":
                  offer.offerDescription.numberOfVisits,
              }}
            />
          )}
        </div>
      </div>
      <Footer />
     </div>
    </>
  );
};
