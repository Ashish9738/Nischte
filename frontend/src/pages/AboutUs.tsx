import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MdOutlineEmail } from "react-icons/md";
import { CiGlobe } from "react-icons/ci";

export const AboutUs: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          About Us
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Our Mission</DialogTitle>
        <DialogDescription>
          At Nischte, we believe in rewarding loyalty and nurturing relationships between businesses and their customers. Our mission is to empower shop owners with the tools to offer meaningful rewards and promotions to their loyal customers. We bridge the gap between businesses and their most valued patrons, fostering a sense of community and appreciation.
        </DialogDescription>

        <DialogTitle>What We Do</DialogTitle>
        <DialogDescription>
          Our loyalty platform enables shop owners to:
          <ul>
            <li>Design promotions that resonate with their loyal customers, encouraging them to return and engage more deeply with their brand.</li>
            <li>Build a loyal customer base that feels valued and recognized, strengthening the bond between the business and its patrons.</li>
            <li>Utilize our innovative tools and insights to boost sales and enhance customer retention, ensuring long-term success.</li>
          </ul>
          Join us on our journey to revolutionize customer loyalty, one rewarding experience at a time!
        </DialogDescription>

        <DialogTitle>Contact Us</DialogTitle>
        <DialogDescription>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MdOutlineEmail className="text-xl" />
              <span className="text-base md:text-lg">communities.atria@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <CiGlobe className="text-xl" />
              <span className="text-base md:text-lg">cialabs.org</span>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
