import React from 'react';

const UserSidebar = ({ selectedSection, setSelectedSection }) => {
  const sections = ['Add Individual', 'Bulk Signup', 'Edit User'];
  return (
    <div className="w-1/4 bg-white dark:bg-gray-800 shadow-lg h-full border-r p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Manage Users</h2>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li
            key={section}
            className={`py-3 px-5 cursor-pointer rounded-md transition duration-200 ease-in-out 
                        ${selectedSection === section
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400'
              }`}
            onClick={() => setSelectedSection(section)}
          >
            {section}
          </li>
        ))}
      </ul>
    </div>
  );

};

export default UserSidebar;

