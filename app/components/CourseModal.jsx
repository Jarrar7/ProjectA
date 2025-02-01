export default function CourseModal({ formData, setFormData, onSaveCourse, onClose, selectedCourse }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg z-10 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                    {selectedCourse ? "Edit Course" : "Add Course"}
                </h2>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
                    <input
                        type="text"
                        value={formData.course_name}
                        onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                        className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                    <input
                        type="text"
                        value={formData.course_code}
                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                        className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">Year</label>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                    <input
                        type="number"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">Teacher ID</label>
                    <input
                        type="text"
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                        className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSaveCourse}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );

}
