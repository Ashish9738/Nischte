import type React from "react"
import { Link } from "react-router-dom"
import { FaHome, FaShoppingBag } from "react-icons/fa"
import { FaShop } from "react-icons/fa6";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const NotFound: React.FC = () => {


  return (
   <div className="px-6 md:px-[200px] flex flex-col min-h-screen">
    <Navbar/>
    <div className="flex-grow flex justify-center items-center">
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Oops! Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          It seems you've wandered off the loyalty path. Don't worry, your points are safe!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/"
            className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FaHome className="mr-2 h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/shops"
            className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FaShop className="mr-2 h-5 w-5" />
            <span>Shops</span>
          </Link>
          <Link
            to="/items"
            className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FaShoppingBag className="mr-2 h-5 w-5" />
            <span>Items</span>
          </Link>
        </div>

        <p className="text-sm text-gray-500">If you believe this is an error, please contact our support team.</p>
      </div>
    </div>
    <Footer />
   </div>
  )
}

export default NotFound;

