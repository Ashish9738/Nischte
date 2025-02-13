import { User } from "../models/user.models.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from 'dotenv';
dotenv.config();

export const updateUserRole = async (req, res) => {
  try {
    console.log("here");
    const { userId } = req.params;
    const role = 'owner';

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role }
    });

    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      error: 'Failed to update role',
      details: error.message 
    });
  }
};


// TODO: Implement webhook for this!
export const createOrUpdateUser = async (clerkUserId) => {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const userData = {
      clerkId: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      email: clerkUser.primaryEmailAddress,
      profileImage: clerkUser.profileImageUrl,
      mobileNo: clerkUser.phoneNumbers.length > 0 ? clerkUser.phoneNumbers[0].phoneNumber : null
    };

    const user = await User.findOneAndUpdate({ clerkId: clerkUser.id }, userData, {
      new: true,
      upsert: true,
    });

  } catch (error) {
    console.error("Error saving/updating user in DB:", error);
  }
};

