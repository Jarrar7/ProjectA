"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

function BulkSignup() {
    const [users, setUsers] = useState([]); // For bulk upload
    const [zipFile, setZipFile] = useState(null); // State to store the ZIP file
    const [loading, setLoading] = useState(false); // Loading state

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            setUsers(data); // This will hold the users as an array of objects
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkSignup = async () => {
        if (users.length === 0) {
            toast.error("No users to sign up. Please upload a valid Excel file.");
            return;
        }

        if (!zipFile) {
            toast.error("Please upload a ZIP file containing student photos.");
            return;
        }

        try {
            setLoading(true); // Set loading to true before the request starts
            const formData = new FormData();
            formData.append("users", JSON.stringify(users)); // Attach users JSON
            formData.append("zipFile", zipFile); // Attach ZIP file

            const res = await fetch("/api/auth/bulk-signup", {
                method: "POST",
                body: formData, // Send form data
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Bulk signup completed successfully!");
                setUsers([]); // Clear users list
                setZipFile(null); // Clear ZIP file
            } else {
                toast.error(result.message || "Bulk signup failed.");
            }
        } catch (error) {
            console.error("Bulk Signup Error:", error);
            toast.error("An unexpected error occurred during bulk signup.");
        } finally {
            setLoading(false); // Set loading to false after the request finishes
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Bulk Signup</h2>

            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                    Upload Excel File
                </label>
                <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="mt-1 block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300 ease-in-out"
                />
            </div>

            {/* ZIP Upload Field */}
            <div>
                <label htmlFor="zip-upload" className="block text-sm font-medium text-gray-700">
                    Upload Photos (ZIP File)
                </label>
                <input
                    id="zip-upload"
                    name="zip-upload"
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFile(e.target.files[0])} // State to store ZIP file
                    className="mt-1 block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300 ease-in-out"
                />
            </div>

            {users.length > 0 && (
                <div className="flex flex-col mt-6">
                    <p className="text-sm text-gray-600">Loaded {users.length} users.</p>
                    <button
                        onClick={handleBulkSignup}
                        disabled={loading} // Disable button while loading
                        className={`mt-4 w-full rounded-md py-3 px-6 text-white font-medium shadow-sm transition-all duration-200 ease-in-out ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 focus:ring-green-500"
                            }`}
                    >
                        {loading ? "Signing up..." : "Signup Users"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default BulkSignup;
