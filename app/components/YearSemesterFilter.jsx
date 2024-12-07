const YearSemesterFilter = ({ selectedYear, setSelectedYear, selectedSemester, setSelectedSemester }) => (

    <div className="flex items-center space-x-4 mb-4">
        <div>
            <label htmlFor="year-select" className="block text-gray-700 font-medium">
                Year:
            </label>
            <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-300"
            >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
            </select>
        </div>
        <div>
            <label htmlFor="semester-select" className="block text-gray-700 font-medium">
                Semester:
            </label>
            <select
                id="semester-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-300"
            >
                <option value="1">1</option>
                <option value="2">2</option>
            </select>
        </div>
    </div>
);

export default YearSemesterFilter;
