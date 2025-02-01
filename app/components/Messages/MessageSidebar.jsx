import React from 'react';

const MessageSidebar = ({ selectedSection, setSelectedSection, setActiveMessage }) => {
  const sections = ['Inbox', 'Sent', 'New Message'];

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setActiveMessage(null); // Reset the active message
  };

  return (
    <div className="w-1/4 bg-white dark:bg-gray-900 shadow-lg h-full border-r border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Messages</h2>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li
            key={section}
            className={`py-3 px-5 cursor-pointer rounded-md transition duration-200 ease-in-out ${selectedSection === section
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-gray-200"
              }`}
            onClick={() => handleSectionClick(section)}
          >
            {section}
          </li>
        ))}
      </ul>
    </div>
  );

};

export default MessageSidebar;
