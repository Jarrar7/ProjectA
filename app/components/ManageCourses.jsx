"use client";
import { useState } from "react";

import YearSemesterFilter from './YearSemesterFilter';

export default function ManageUsers() {
    const [items, setItems] = useState([
        'Algorithms', 
        'Object-Oriented Programming', 
        'Web Development', 
        'Human-Computer Interaction', 
        'Cloud Computing', 
        'Database Systems'
    ]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for the search input

    const handleCourseClick = (item) => {
        setSelectedCourse(item);
    };

    const handleBackClick = () => {
        setSelectedCourse(null);
    };

    const handleAddCourse = () => {
        const newCourse = prompt("Enter the new course name:");
        if (newCourse) {
            setItems([...items, newCourse]);  // Add new course to the list
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);  // Update search term
    };

    // Filter courses based on the search term
    const filteredItems = items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manage Courses</h1>
            <YearSemesterFilter/>
            {/* Search input */}
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search courses..."
                    className="border p-2 rounded w-full"
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* "+" button to add a new course */}
                <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center">
                    <button 
                        onClick={handleAddCourse} 
                        className="text-3xl font-bold text-black"
                    >
                        +
                    </button>
                </div>

                {/* Displaying filtered courses */}
                {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-6">
                            <button onClick={() => handleCourseClick(item)}>
                                {item}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">
                        No courses found.
                    </div>
                )}
            </div>

            {/* Optional: Show selected course */}
            {selectedCourse && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">Selected Course: {selectedCourse}</h2>
                    <button onClick={handleBackClick} className="text-blue-500">Back</button>
                </div>
            )}
        </div>
    );
}
