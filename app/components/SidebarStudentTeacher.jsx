import { useState } from "react";
import { FaBars, FaTimes, FaHome, FaEnvelope, FaCalendarAlt, FaUser, FaSignOutAlt } from "react-icons/fa";

const SidebarStudentTeacher = ({ activeSection, setActiveSection, logout }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button - Fixed at Top Left */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg"
            >
                <FaBars size={20} />
            </button>

            {/* Backdrop when Sidebar is Open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar - Responsive and Smooth Animation */}
            <aside
                className={`fixed top-0 left-0 h-full bg-indigo-600 dark:bg-gray-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative md:w-64 w-64 shadow-lg`}
            >
                {/* Branding + Close Button */}
                <div className="flex items-center justify-between h-16 bg-indigo-700 dark:bg-gray-800 text-xl font-bold px-4">
                    AttendEase
                    {/* Close Button (Only on Mobile) */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-white">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 mt-4">
                    <ul>
                        {[
                            { section: "dashboard", label: "Dashboard", icon: <FaHome className="mr-4" /> },
                            { section: "messages", label: "Messages", icon: <FaEnvelope className="mr-4" /> },
                            { section: "calendar", label: "Calendar", icon: <FaCalendarAlt className="mr-4" /> },
                            { section: "profile", label: "Your Profile", icon: <FaUser className="mr-4" /> },
                        ].map(({ section, label, icon }) => (
                            <li
                                key={section}
                                className={`hover:bg-indigo-500 dark:hover:bg-gray-700 p-4 flex items-center cursor-pointer transition-all duration-200 ${activeSection === section ? "bg-indigo-500 dark:bg-gray-800" : ""
                                    }`}
                                onClick={() => {
                                    setActiveSection(section);
                                    setIsOpen(false);
                                }}
                            >
                                {icon}
                                {label}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button - Fixed at Bottom */}
                <button
                    onClick={logout}
                    className="hover:bg-red-600 dark:hover:bg-red-700 p-4 flex items-center cursor-pointer transition-all duration-200 w-full text-left mt-auto"
                >
                    <FaSignOutAlt className="mr-4" />
                    Logout
                </button>
            </aside>
        </>
    );
};

export default SidebarStudentTeacher;
