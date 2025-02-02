// components/CourseSearch.jsx
import React, { useState } from "react";

const CourseSearch = ({ courses, setFilteredCourses }) => {
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");

    const handleFilterChange = (year, semester) => {
        setSelectedYear(year);
        setSelectedSemester(semester);

        // Filter courses based on selected year and semester
        const filteredCourses = courses.filter((course) => {
            return (
                (year === "" || course.year.toString() === year) &&
                (semester === "" || course.semester.toString() === semester)
            );
        });

        setFilteredCourses(filteredCourses);
    };

    return (
        <div className="mb-4 flex gap-4">
            {/* Year Filter */}
            <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-200"
                value={selectedYear}
                onChange={(e) => handleFilterChange(e.target.value, selectedSemester)}
            >
                <option value="">All Years</option>
                {[...new Set(courses.map((course) => course.year))].map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>

            {/* Semester Filter */}
            <select
                className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-200"
                value={selectedSemester}
                onChange={(e) => handleFilterChange(selectedYear, e.target.value)}
            >
                <option value="">All Semesters</option>
                {[...new Set(courses.map((course) => course.semester))].map((semester) => (
                    <option key={semester} value={semester}>
                        {semester}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CourseSearch;
