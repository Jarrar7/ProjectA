import React from 'react';

const MessageListWithDetails = ({ messages, activeMessage, setActiveMessage }) => {
  return (
    <div className="flex-1 h-full p-4 overflow-y-auto">
      <table className="w-full table-auto border-collapse mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left px-4 py-2">Sender</th>
            <th className="text-left px-4 py-2">Subject</th>
            <th className="text-left px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr
              key={message.id}
              className={`hover:bg-gray-100 cursor-pointer ${
                activeMessage?.id === message.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setActiveMessage(message)}
            >
              <td className="px-4 py-2">{message.sender}</td>
              <td className="px-4 py-2">{message.subject}</td>
              <td className="px-4 py-2">{message.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeMessage && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold">{activeMessage.subject}</h2>
          <p className="text-gray-500 text-sm">
            From: {activeMessage.sender} | Date: {activeMessage.date}
          </p>
          <div className="mt-4">{activeMessage.body}</div>
        </div>
      )}
    </div>
  );
};

export default MessageListWithDetails;
