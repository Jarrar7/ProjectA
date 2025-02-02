"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import ProfilePhotoUpdate from "../components/ProfilePhotoUpdate";

export default function Profile() {
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("/default-avatar.png");
  const [photoLoading, setPhotoLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else if (data?.user) {
        setEmail(data.user.email);
      }
    };

    const fetchSignedUrl = async () => {
      if (user?.photo_url) {
        setPhotoLoading(true);
        const { data, error } = await supabase.storage
          .from("student-photos")
          .createSignedUrl(user.photo_url, 3600);

        if (error) {
          console.error("Error fetching signed URL:", error.message);
        } else {
          setProfilePhoto(data.signedUrl);
        }
        setPhotoLoading(false);
      } else {
        setPhotoLoading(false);
      }
    };

    fetchUserData();
    fetchSignedUrl();
  }, [user]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      alert("Please enter a new password.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert("Failed to update password: " + error.message);
    } else {
      alert("Password updated successfully!");
      setPassword("");
    }
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    setProfilePhoto(newPhotoUrl);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen"><p>You are not logged in.</p></div>;
  }

  return (
    <div className="p-10 w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">Your Profile</h2>
      <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
        Update your information and profile picture.
      </p>

      <div className="flex mt-6 space-x-10">
        {/* Profile Photo */}
        <div className="flex flex-col items-center w-1/4">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
            Profile Photo
          </label>
          <div className="mt-4">
            {photoLoading ? (
              <p className="text-gray-700 dark:text-gray-300">Loading photo...</p>
            ) : (
              <img
                src={profilePhoto || "/default-avatar.png"}
                alt="Profile"
                className="h-40 w-40 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow-md transition-transform hover:scale-105"
              />
            )}
          </div>
          <ProfilePhotoUpdate user={user} onUpdate={handlePhotoUpdate} />
        </div>

        {/* Personal Information */}
        <div className="flex-grow">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                First Name
              </label>
              <input
                type="text"
                defaultValue={user.firstName}
                disabled
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-200 shadow-sm bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                Last Name
              </label>
              <input
                type="text"
                defaultValue={user.lastName}
                disabled
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-200 shadow-sm bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-200 shadow-sm bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-200 shadow-sm bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                ID
              </label>
              <input
                type="ID"
                value={user.human_id}
                disabled
                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-200 shadow-sm bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

}
