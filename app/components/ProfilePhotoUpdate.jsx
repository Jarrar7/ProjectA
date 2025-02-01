"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function ProfilePhotoUpdate({ user, onUpdate }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("userId", user.id);
        formData.append("humanId", user.human_id);
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/auth/update-photo", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error);
            }

            onUpdate(result.signedUrl);
            toast.success("Profile photo updated successfully!");
        } catch (error) {
            console.error("Profile Photo Update Error:", error);
            toast.error("Failed to update profile photo.");
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    return (
        <div className="flex flex-col items-center mt-4 space-y-2">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photoUpload"
            />
            <label
                htmlFor="photoUpload"
                className="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
                Choose File
            </label>

            {selectedFile && <p className="text-sm text-gray-600">{selectedFile.name}</p>}

            <button
                onClick={handlePhotoUpload}
                className={`px-6 py-2 rounded-md text-white shadow-md transition ${!selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
                disabled={!selectedFile || loading}
            >
                {loading ? "Uploading..." : "Update Photo"}
            </button>
        </div>
    );
}
