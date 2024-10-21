import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Navbar } from "@/components/Navbar";

export const Cart = () => {
  const { state, dispatch } = useCart();
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});

  const handleQuantityChange = (itemId: string, value: string) => {
    setQuantities({ ...quantities, [itemId]: value });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: "REMOVE_FROM_CART", payload: itemId });
      toast.success("Item removed from cart");
      return;
    }

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { _id: itemId, quantity: newQuantity },
    });
  };

  const handleQuantityBlur = (itemId: string, currentQuantity: number) => {
    const inputValue = quantities[itemId];
    if (!inputValue) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: currentQuantity.toString(),
      }));
      return;
    }

    const newQuantity = parseInt(inputValue);
    if (isNaN(newQuantity) || newQuantity < 1) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: currentQuantity.toString(),
      }));
      toast.error("Please enter a valid quantity");
      return;
    }

    handleUpdateQuantity(itemId, newQuantity);
  };

  return (
    <div className="px-6 md:px-[200px] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow">
            {state.items.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {state.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 p-4 border rounded"
                  >
                    <img
                      src={item.picture}
                      alt={item.itemName}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{item.itemName}</h3>
                      <p className="text-lg">${item.price}</p>
                    </div>
                    <div className="flex justify-between items-center sm:flex-row  sm:items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          <FaMinus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="text"
                          value={quantities[item._id] || item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item._id, e.target.value)
                          }
                          onBlur={() =>
                            handleQuantityBlur(item._id, item.quantity)
                          }
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          <FaPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto  sm:mt-0"
                        onClick={() =>
                          dispatch({
                            type: "REMOVE_FROM_CART",
                            payload: item._id,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* TODO: Fix display items with their details */}
          <div className="lg:w-1/3">
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold">Total Items:</p>
                <p>
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl font-bold">Total:</p>
                <p className="text-xl font-bold">${state.total.toFixed(2)}</p>
              </div>
              <Button className="w-full">Proceed to Checkout</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
