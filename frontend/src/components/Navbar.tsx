// src/components/Navbar.tsx
import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdCart, IoMdClose } from "react-icons/io";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { AboutUs } from "@/pages/AboutUs";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "./ui/button";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded  } = useUser();
  const userId = user?.id;
  const { state } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  
  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <div className="sticky top-0 z-50 bg-white ">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center pt-4 relative z-20 mb-5">
          {/* Left section */}
          <Link to="/">
            <h1 className="text-2xl font-bold cursor-pointer">Nischte</h1>
          </Link>

          {/* Right section */}
          <div className="flex items-center space-x-3 md:space-x-6 lg:space-x-7">
          <div>
              {!isSignedIn && (
                <Button className="ghost">
                  <SignedOut>
                    <SignInButton
                      fallbackRedirectUrl="/"
                      signUpFallbackRedirectUrl="/"
                    />
                  </SignedOut>
                </Button>
              )}
              {isLoaded ? (
                <SignedIn>
                  <UserButton />
                </SignedIn>
              ) : null}
            </div>

            {/* Cart Icon */}
            <div className="relative cursor-pointer" onClick={handleCartClick}>
              <IoMdCart size={29} />
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {state.items.length}
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            <div className="relative lg:m">
              <Popover>
               <PopoverTrigger onClick={() => setIsDropdownOpen((prev) => !prev)}>
                  <button className="p-2">
                    {isDropdownOpen ? <IoMdClose size={24} /> : <GiHamburgerMenu size={24} />}
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="bg-white md:mr-35"
                >
                  <Link
                    to="/shops"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Shops
                  </Link>
                  <Link
                    to="/items"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Items
                  </Link>
                  <Link
                    to={`/${userId}/order`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>

                  <AboutUs /> 

                  {/* <Link
                    to={`/support/${userId}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Support
                  </Link> */}

                  {/* Owner section */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900">Owners</div>
                    <Link
                      to="/shop/register"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Register shop
                    </Link>
                    <Link
                      to="/shop/manage"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Manage shops
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
