import React, { useState } from 'react';

const ComposeMessage = ({ onSend }) => {
  const [formData, setFormData] = useState({ to: '', subject: '', body: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    onSend(formData);
    setFormData({ to: '', subject: '', body: '' });
  };

  return (
    <div className="flex-1 p-4">
      <h1 className="text-xl font-semibold">Compose New Message</h1>
      <div className="mt-4">
        <input
          name="to"
          type="text"
          placeholder="To"
          className="w-full p-2 mb-4 border"
          value={formData.to}
          onChange={handleInputChange}
        />
        <input
          name="subject"
          type="text"
          placeholder="Subject"
          className="w-full p-2 mb-4 border"
          value={formData.subject}
          onChange={handleInputChange}
        />
        <textarea
          name="body"
          placeholder="Message"
          className="w-full p-2 mb-4 border h-32"
          value={formData.body}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ComposeMessage;
