"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileForm() {
  const { user, loading } = useUser(); // Access `user` and `loading` from UserContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
  
    if (!password) {
      alert("Please enter a new password.");
      return;
    }
  
    const { error } = await supabase.auth.updateUser({ password });
  
    if (error) {
      console.error("Error updating password:", error.message);
      alert("Failed to update password: " + error.message);
    } else {
      alert("Password updated successfully!");
      setPassword(""); // Clear the input field after successful update
    }
  };
  

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else if (data?.user) {
        setEmail(data.user.email);
      }
    };

    fetchUserEmail();
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center">
        <p>You are not logged in. Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <form className="space-y-8 bg-white p-6 rounded-lg shadow-lg">
      {/* Profile Header */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Your Profile</h2>
        <p className="mt-2 text-base text-gray-600">
          Update your information and profile picture.
        </p>
      </div>

      {/* Personal Information Section */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {/* First Name */}
        <div className="sm:col-span-3">
          <label htmlFor="first-name" className="block text-sm font-medium text-gray-900">
            First Name
          </label>
          <div className="mt-2">
            <input
              id="first-name"
              name="first-name"
              defaultValue={user.firstName}
              disabled={true}
              type="text"
              autoComplete="given-name"
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="sm:col-span-3">
          <label htmlFor="last-name" className="block text-sm font-medium text-gray-900">
            Last Name
          </label>
          <div className="mt-2">
            <input
              id="last-name"
              name="last-name"
              defaultValue={user.lastName}
              disabled={true}
              type="text"
              autoComplete="family-name"
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email Address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              disabled={true}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="sm:col-span-3">
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* ID Field */}
        <div className="sm:col-span-3">
          <label htmlFor="id" className="block text-sm font-medium text-gray-900">
            ID
          </label>
          <div className="mt-2">
            <input
              id="id"
              name="id"
              defaultValue={user.human_id}
              disabled={true}
              type="text"
              autoComplete="off"
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div className="col-span-full">
          <label htmlFor="photo" className="block text-sm font-medium text-gray-900">
            Profile Photo
          </label>
          <div className="mt-2 flex items-center gap-x-3">
            <button
              type="button"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 shadow-sm hover:bg-gray-200 focus:outline-none"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          onClick={handleUpdatePassword}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save
        </button>
      </div>
    </form>
  );
}
