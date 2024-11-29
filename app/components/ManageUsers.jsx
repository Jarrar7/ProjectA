"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx"; // Install this with `npm install xlsx`

export default function ManageUsers() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [human_id, setHumanID] = useState("");
    const [role, setRole] = useState("");
    const [users, setUsers] = useState([]); // For bulk upload

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

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, human_id, role, email, password }),
            });

            if (res.ok) {
                toast.success("User created successfully!");
                setEmail("");
                setPassword("");
                setFirstName("");
                setLastName("");
                setHumanID("");
                setRole("");
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to create user");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error(error);
        }
    };

    const handleBulkSignup = async () => {
        if (users.length === 0) {
            toast.error("No users to sign up. Please upload a valid Excel file.");
            return;
        }

        try {
            const res = await fetch("/api/auth/bulk-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Users signed up successfully!");
                setUsers([]); // Clear the users after successful signup
            } else {
                toast.error(result.message || "Failed to sign up users");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center">Manage Users</h1>

                {/* Individual Signup */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-700">Sign Up Individual User</h2>
                    <div className="grid grid-cols-2 gap-6">
                        {/* First Name */}
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
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* Last Name */}
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
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* Human ID */}
                        <div>
                            <label htmlFor="human_id" className="block text-sm font-medium text-gray-700">
                                Human ID
                            </label>
                            <input
                                id="human_id"
                                name="human_id"
                                type="text"
                                value={human_id}
                                onChange={(e) => setHumanID(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {/* Role */}
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
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    {/* Email */}
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
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white shadow-sm hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Create User
                        </button>
                    </div>
                </form>

                {/* Bulk Signup */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-700">Bulk Signup</h2>
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
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
