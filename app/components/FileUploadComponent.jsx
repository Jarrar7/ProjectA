import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const FileUploadComponent = ({ sessionId, onFilesUploaded }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]); // State to hold already uploaded files
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image

    // Fetch uploaded images when the component mounts
    useEffect(() => {
        const fetchUploadedFiles = async () => {
            try {
                const { data, error } = await supabase
                    .from("uploaded_images")
                    .select("*")
                    .eq("session_id", sessionId);

                if (error) throw error;
                setUploadedFiles(data || []);
            } catch (fetchError) {
                console.error("Error fetching uploaded files:", fetchError.message);
            }
        };

        fetchUploadedFiles();
    }, [sessionId]);

    // Handle file selection
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);

        // Validate file type and prevent duplicates
        const validFiles = files.filter(
            (file) => file.type.startsWith("image/") && !selectedFiles.some((f) => f.name === file.name)
        );

        if (validFiles.length + selectedFiles.length > 3) {
            setError("You can only upload up to 3 images.");
            return;
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setError(""); // Clear any previous error
    };

    // Handle file upload
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setUploading(true);
        try {
            const uploadedPaths = [];

            for (const file of selectedFiles) {
                const filePath = `${sessionId}/${file.name}`;
                const { data, error } = await supabase.storage
                    .from("attendance-photos")
                    .upload(filePath, file);

                if (error) {
                    throw error;
                }

                uploadedPaths.push(data.path); // Collect uploaded file paths
            }

            // Save uploaded file paths to the database
            await onFilesUploaded(uploadedPaths);

            // Clear state and refresh uploaded files
            setSelectedFiles([]);
            setError("");
            setUploadedFiles((prev) => [
                ...prev,
                ...uploadedPaths.map((path) => ({ file_path: path })),
            ]);
        } catch (uploadError) {
            console.error("Error uploading files:", uploadError.message);
            setError("Failed to upload files. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Handle removing a file from the preview list
    const handleRemoveFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Open modal for enlarged image
    const handleImageClick = (filePath) => {
        setEnlargedImage(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attendance-photos/${filePath}`
        );
    };

    // Close the modal
    const handleCloseModal = () => {
        setEnlargedImage(null);
    };

    // Handle delete photo
    const handleDeletePhoto = async (imageId, filePath) => {
        if (!confirm("Are you sure you want to delete this photo?")) return;

        try {
            // Ensure the file path is sanitized
            const sanitizedFilePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

            // Delete the file from the Supabase storage bucket
            const { error: storageError } = await supabase.storage
                .from("attendance-photos")
                .remove([sanitizedFilePath]);

            if (storageError) {
                throw new Error("Failed to delete the photo from storage.");
            }

            // Delete the record from the uploaded_images table
            const { error: dbError } = await supabase
                .from("uploaded_images")
                .delete()
                .eq("id", imageId);

            if (dbError) {
                throw new Error("Failed to delete the photo record from the database.");
            }

            // Remove the photo from the UI
            setUploadedFiles((prev) => prev.filter((file) => file.id !== imageId));
            alert("Photo deleted successfully!");
        } catch (err) {
            console.error("Error deleting photo:", err.message);
            setError(err.message);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-4">Upload Attendance Photos</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="mb-4"
                disabled={uploading || selectedFiles.length >= 3}
            />

            <div className="flex flex-wrap mb-4">
                {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 mr-4 mb-4">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                        />
                        <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500"
                            disabled={uploading}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleUpload}
                className={`bg-blue-500 text-white py-2 px-4 rounded ${uploading ? "opacity-50" : ""
                    }`}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>

            <h3 className="text-lg font-bold mt-6">Uploaded Files</h3>
            <div className="flex flex-wrap">
                {uploadedFiles.map((file, index) => (
                    <div
                        key={index}
                        className="mr-4 mb-4 cursor-pointer"
                        onClick={() => handleImageClick(file.file_path)}
                    >
                        <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attendance-photos/${file.file_path}`}
                            alt={`Uploaded File ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                        />
                        <button
                            onClick={() => handleDeletePhoto(file.id, file.file_path)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for Enlarged Image */}
            {enlargedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative">
                        <img
                            src={enlargedImage}
                            alt="Enlarged"
                            className="max-w-full max-h-screen rounded"
                        />
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-2 right-2 text-white text-xl bg-black bg-opacity-50 px-2 py-1 rounded"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;
