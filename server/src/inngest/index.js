// inngest/index.js
import { Inngest } from "inngest";
import { User } from "../models/user.models.js";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "social-app",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      let username = email_addresses[0].email_address.split("@")[0];

      // Check availability of username
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }

      // In syncUserCreation (userData section):
        const userData = {
        _id: id, // Clerk ID goes here
        clerkUserId: id, // Alias for safety
        email: email_addresses[0].email_address,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        profile_picture: image_url,
        username,
        };

      await User.create(userData);
      return { success: true, userId: id };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error; // Re-throw to trigger Inngest retry
    }
  }
);

// Inngest Function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const updatedUserData = {
        email: email_addresses[0].email_address,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        profile_picture: image_url,
      };

      // Use findOneAndUpdate with clerkUserId field
    await User.findByIdAndUpdate(id, updatedUserData);
      return { success: true, userId: id };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
);

// Inngest Function to delete user data from the database
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    try {
      const { id } = event.data;
        await User.findByIdAndDelete(id); // ✅ Now works with string _id
      return { success: true, userId: id };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);

// Export all Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
