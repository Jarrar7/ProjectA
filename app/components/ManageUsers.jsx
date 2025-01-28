"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabaseClient";

export default function ManageUsers() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [human_id, setHumanID] = useState("");
    const [role, setRole] = useState("");
    const [photoFile, setPhotoFile] = useState(null); // File input for photo
    const [users, setUsers] = useState([]); // For bulk upload
    const [loading, setLoading] = useState(false);
    const [zipFile, setZipFile] = useState(null); // State to store the ZIP file


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



    const handleBulkSignup = async () => {
        if (users.length === 0) {
            toast.error("No users to sign up. Please upload a valid Excel file.");
            return;
        }

        if (!zipFile) {
            toast.error("Please upload a ZIP file containing student photos.");
            return;
        }


        console.log("ZIP file selected:", zipFile); // Log the zip file


        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("users", JSON.stringify(users)); // Attach users JSON
            formData.append("zipFile", zipFile); // Attach ZIP file

            console.log("ZIP file:", zipFile);


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
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-8 space-y-8">
                {/* Page Title */}
                <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>

                {/* Individual Signup Section */}
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Sign Up Individual User</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Human ID</label>
                                <input
                                    type="text"
                                    value={human_id}
                                    onChange={(e) => setHumanID(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Upload Photo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Upload Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhotoFile(e.target.files[0])}
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded-md py-2 px-4 text-white shadow-sm transition ${loading
                                    ? "bg-gray-400"
                                    : "bg-indigo-600 hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    }`}
                            >
                                {loading ? "Creating User..." : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Bulk Signup Section */}
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Bulk Signup</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Excel File</label>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* ZIP Upload Field */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Upload Photos (ZIP File)</label>
                        <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => setZipFile(e.target.files[0])}
                            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {users.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">Loaded {users.length} users.</p>
                            <button
                                onClick={handleBulkSignup}
                                className="mt-2 w-full rounded-md bg-green-600 py-2 px-4 text-white shadow-sm hover:bg-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Signup Users
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );

}
