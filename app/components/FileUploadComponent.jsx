import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const FileUploadComponent = ({ sessionId, onFilesUploaded }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [processedFiles, setProcessedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [enlargedImage, setEnlargedImage] = useState(null);

    const TARGET_SIZE = 1024; // Target dimensions for resizing

    const resetState = () => {
        setSelectedFiles([]);
        setProcessedFiles([]);
        setUploading(false);
        setError("");
        setEnlargedImage(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => resetState();
    }, []);

    // Fetch processed files from `processed-attendance-photos`
    const fetchProcessedFiles = async () => {
        try {
            const { data, error } = await supabase.storage
                .from("processed-attendance-photos")
                .list(`processed/${sessionId}`, { limit: 100 });

            if (error) {
                console.error("Error fetching processed files:", error.message);
                return;
            }

            console.log("Fetched processed files:", data);

            // Map the file paths
            const processedPaths = data.map((file) => ({
                name: file.name,
            }));

            setProcessedFiles(processedPaths || []);
        } catch (fetchError) {
            console.error("Error fetching processed files:", fetchError.message);
        }
    };

    // Resize image using a canvas
    const resizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const scale = Math.min(
                    TARGET_SIZE / img.width,
                    TARGET_SIZE / img.height
                );
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                        });
                        resolve(resizedFile);
                    } else {
                        reject(new Error("Failed to resize image"));
                    }
                }, file.type);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = URL.createObjectURL(file);
        });
    };

    // Handle file selection
    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);

        const validFiles = files.filter(
            (file) =>
                file.type.startsWith("image/") &&
                !selectedFiles.some((f) => f.name === file.name)
        );

        if (validFiles.length + selectedFiles.length > 3) {
            setError("You can only upload up to 3 images.");
            return;
        }

        setError("Resizing images... Please wait.");
        try {
            const resizedFiles = await Promise.all(
                validFiles.map((file) => resizeImage(file))
            );
            setSelectedFiles((prev) => [...prev, ...resizedFiles]);
            setError("");
        } catch (resizeError) {
            console.error("Error resizing images:", resizeError);
            setError("Failed to resize images. Please try again.");
        }
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

                uploadedPaths.push(data.path);
            }

            await onFilesUploaded(uploadedPaths);

            setSelectedFiles([]);
            setError("");
            await fetchProcessedFiles(); // Fetch processed photos after upload
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
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/processed-attendance-photos/processed/${sessionId}/${filePath}`
        );
    };

    // Close the modal
    const handleCloseModal = () => {
        setEnlargedImage(null);
    };

    // Fetch processed files on component mount
    useEffect(() => {
        fetchProcessedFiles();
    }, [sessionId]);

    return (
        <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                Upload Attendance Photos
            </h3>
            {error && <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>}

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="mb-4 text-gray-700 dark:text-gray-200"
                disabled={uploading || selectedFiles.length >= 3}
            />

            <div className="flex flex-wrap mb-4">
                {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 mr-4 mb-4">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border dark:border-gray-700"
                        />
                        <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500 dark:text-red-400"
                            disabled={uploading}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleUpload}
                className={`bg-blue-500 text-white py-2 px-4 rounded ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                    }`}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>

            <h3 className="text-lg font-bold mt-6 text-gray-800 dark:text-gray-100">
                Processed Attendance Photos
            </h3>
            <div className="flex flex-wrap">
                {processedFiles.length > 0 ? (
                    processedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="mr-4 mb-4 cursor-pointer"
                            onClick={() => handleImageClick(file.name)}
                        >
                            <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/processed-attendance-photos/processed/${sessionId}/${file.name}`}
                                alt={`Processed File ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border dark:border-gray-700"
                            />
                            <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                                Photo {index + 1}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                        No processed photos available yet.
                    </p>
                )}
            </div>

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
