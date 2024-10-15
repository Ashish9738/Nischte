import { z } from "zod";
import Form from "@/components/Form";
import { FC } from "react";

export const RegisterShop: FC = () => {
  const fields = [
    {
      name: "name",
      label: "Shop Name",
      type: "text",
      validation: z.string().min(1, { message: "Shop name is required" }),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      validation: z.string().email({ message: "Invalid email address" }),
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      validation: z.string().min(1, { message: "Address is required" }),
    },
    {
      name: "contact",
      label: "Contact No",
      type: "tel",
      validation: z
        .string()
        .regex(/^\d{10}$/, { message: "Contact number must be 10 digits" }),
    },
    {
      name: "picture",
      label: "Picture",
      type: "file",
      validation: z.any().optional(),
    },
  ];

  const handleRegister = (data: object) => {
    console.log("Registering shop:", data);
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register Your Shop
        </h2>
        <Form
          fields={fields}
          onSubmit={handleRegister}
          submitButtonText="Register Shop"
        />
      </div>
    </div>
  );
};