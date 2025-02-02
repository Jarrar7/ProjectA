"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";

export default function AddIndividualUser() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [human_id, setHumanID] = useState("");
    const [role, setRole] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photoFile) {
            toast.error("Please upload a photo for the student.");
            return;
        }
        try {
            setLoading(true);

            // Rename the photo to match the human_id
            const fileExtension = photoFile.name.split('.').pop(); // Get file extension
            const renamedFile = new File(
                [photoFile],
                `${human_id}.${fileExtension}`,
                { type: photoFile.type }
            );

            // Define the file path
            const filePath = `${human_id}/${renamedFile.name}`;
            console.log("Uploading photo with path:", filePath); // Log the file path for debugging

            // Upload the renamed photo to Supabase storage
            const { data: photoData, error: photoError } = await supabase.storage
                .from("student-photos")
                .upload(filePath, renamedFile);

            if (photoError) {
                console.error("Photo Upload Error:", photoError);
                toast.error("Failed to upload photo. Please check permissions and try again.");
                return; // Stop further execution
            }

            console.log("Photo uploaded successfully:", photoData);

            // Proceed with user creation if photo upload succeeds
            const photo_url = `${filePath}`;

            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    human_id,
                    role,
                    email,
                    password,
                    photo_url,
                }),
            });

            if (res.ok) {
                toast.success("User created successfully!");
                setEmail("");
                setPassword("");
                setFirstName("");
                setLastName("");
                setHumanID("");
                setRole("");
                setPhotoFile(null);
            } else {
                const errorData = await res.json();
                console.error("API Error Response:", errorData);
                toast.error(errorData.message || "Failed to create user");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Sign Up Individual User
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid Layout for Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                        </label>
                        <input
                            id="firstname"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                        </label>
                        <input
                            id="lastname"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                    </div>

                    {/* ID */}
                    <div>
                        <label htmlFor="human_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            User ID
                        </label>
                        <input
                            id="human_id"
                            type="text"
                            value={human_id}
                            onChange={(e) => setHumanID(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Role
                        </label>
                        <input
                            id="role"
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                </div>

                {/* Photo Upload */}
                <div>
                    <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Profile Photo
                    </label>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                        className="mt-1 w-full rounded-lg border-gray-300 dark:border-gray-600 py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-lg py-2 px-4 text-white font-semibold shadow-md focus:ring-2 focus:ring-indigo-500 transition-all duration-200 
                  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"}`}
                    >
                        {loading ? "Creating User..." : "Create Account"}
                    </button>
                </div>
            </form>
        </div>
    );


}