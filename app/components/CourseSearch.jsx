// components/CourseSearch.jsx
import React, { useState } from "react";

const CourseSearch = ({ courses, setFilteredCourses }) => {
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query); // Update the search query

        // Filter courses based on the search query
        const filteredCourses = courses.filter((course) =>
            course.course_name.toLowerCase().includes(query.toLowerCase())
        );

        setFilteredCourses(filteredCourses); // Update the filtered courses state
    };

    return (
        <div className="mb-4">
            <input
                type="text"
                className="p-2 border border-gray-300 rounded"
                placeholder="Search courses by name..."
                value={searchQuery}
                onChange={handleSearchChange} // Trigger search on input change
            />
        </div>
    );
};

export default CourseSearch;
