import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    firstName: { 
        type: String 
    },
    lastName: { 
        type: String 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    role: { 
        type: String, 
        default: "user" 
    },
    profileImage: { 
        type: String 
    },
    mobileNo: {
        type: String
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

