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
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Sign Up Individual User
            </h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                    </label>
                    <input
                        id="firstname"
                        name="firstname"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                    </label>
                    <input
                        id="lastname"
                        name="lastname"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="human_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Human ID
                    </label>
                    <input
                        id="human_id"
                        name="human_id"
                        type="text"
                        value={human_id}
                        onChange={(e) => setHumanID(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                    </label>
                    <input
                        id="role"
                        name="role"
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Photo Upload */}
            <div>
                <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Photo
                </label>
                <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 py-2 px-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-md ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-500"} 
                        dark:bg-indigo-700 dark:hover:bg-indigo-600 py-2 px-4 text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                    {loading ? "Creating User..." : "Create User"}
                </button>
            </div>
        </form>
    );

}