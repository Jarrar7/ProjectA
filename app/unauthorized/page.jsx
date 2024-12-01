"use client";

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600">Unauthorized Access</h1>
                <p className="mt-4 text-lg text-gray-700">
                    You do not have permission to view this page.
                </p>
                <a
                    href="/"
                    className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-md shadow hover:bg-blue-500"
                >
                    Go Back to Home
                </a>
            </div>
        </main>
    );
}
