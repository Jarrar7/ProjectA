"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";
import axios from "axios";

export default function EditUser() {
    const [searchHumanId, setSearchHumanId] = useState("");
    const [userId, setUserId] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [humanId, setHumanID] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleSearch = async () => {
        if (!searchHumanId.trim()) {
            toast.error("Please enter a valid Human ID.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("human_id", searchHumanId)
                .single();

            if (error || !data) {
                toast.error("User not found.");
                return;
            }

            setUserId(data.id);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setHumanID(data.human_id);
            setRole(data.role);
            setEmail(data.email);
        } catch (error) {
            toast.error("Failed to fetch user data.");
            console.error(error);
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare updated data
            const updatedData = {};
            if (firstName) updatedData.firstName = firstName;
            if (lastName) updatedData.lastName = lastName;
            if (humanId) updatedData.human_id = humanId;
            if (role) updatedData.role = role;

            // ✅ Update profile fields (Only send changed fields)
            if (Object.keys(updatedData).length > 0) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .update(updatedData)
                    .eq("id", userId);

                if (profileError) throw profileError;
            }

            // ✅ Update Email & Password in Supabase Auth
            if (email || password) {
                const authData = {};
                if (email) authData.email = email;
                if (password) authData.password = password;

                const { error: authError } = await supabase.auth.updateUser(authData);
                if (authError) throw authError;
            }

            // ✅ If a new photo is selected, call `update-photo` API
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile); // Correct field name
                formData.append("userId", userId);
                formData.append("humanId", humanId);

                const response = await axios.post(
                    "/api/auth/update-photo",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                if (response.status !== 200) {
                    throw new Error(response.data.error || "Failed to update profile photo.");
                }

                toast.success("Profile photo updated successfully!");
            }

            toast.success("User updated successfully!");
        } catch (error) {
            toast.error("Failed to update user.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Search & Edit User</h2>

            {/* Search Bar */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Enter Human ID"
                    value={searchHumanId}
                    onChange={(e) => setSearchHumanId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                    Search
                </button>
            </div>

            {userId && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit User</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Email & Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm"
                        />
                    </div>

                    {/* Profile Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-md ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-500"} py-2 px-4 text-white`}
                    >
                        {loading ? "Updating User..." : "Update User"}
                    </button>
                </form>
            )}
        </div>
    );
}
