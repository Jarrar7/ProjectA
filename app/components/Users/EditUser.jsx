"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";

export default function EditUser() {
    const [searchHumanId, setSearchHumanId] = useState("");
    const [userId, setUserId] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [humanId, setHumanID] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
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
            setPhotoUrl(data.photo_url || "");
        } catch (error) {
            toast.error("Failed to fetch user data.");
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const updatedData = {
                firstName: firstName,
                lastName: lastName,
                human_id: humanId,
                role,
                photo_url: photoUrl,
            };

            const { data, error } = await supabase
                .from("profiles")
                .update(updatedData)
                .eq("id", userId);

            if (error) {
                throw error;
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
                            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                id="firstname"
                                name="firstname"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                id="lastname"
                                name="lastname"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="human_id" className="block text-sm font-medium text-gray-700">
                                Human ID
                            </label>
                            <input
                                id="human_id"
                                name="human_id"
                                type="text"
                                value={humanId}
                                onChange={(e) => setHumanID(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <input
                                id="role"
                                name="role"
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            // value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700">
                            Upload Photo
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoUrl(e.target.files[0])}
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-md ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-500"
                                } py-2 px-4 text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                        >
                            {loading ? "Updating User..." : "Update User"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
