import React, { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabaseClient"; // Import supabase client
import MessageSidebar from '../components/Messages/MessageSidebar';
import MessageListWithDetails from '../components/Messages/MessageListWithDetails';
import ComposeMessage from '../components/Messages/ComposeMessage';

const MessagesPage = () => {
  const [selectedSection, setSelectedSection] = useState('Inbox');
  const [activeMessage, setActiveMessage] = useState(null);

  // State to hold messages from Supabase
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [draftMessages, setDraftMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*');
    
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const userId = '059f65c5-a0a4-4d33-8d14-817d82045621';  // Replace with the actual user ID

      // Filter inbox, sent, and draft messages based on the 'is_sent' flag
      const inbox = data.filter(
        (message) => message.receiver_id === userId && message.is_sent
      );
      const sent = data.filter(
        (message) => message.sender_id === userId && message.is_sent
      );
      const drafts = data.filter(
        (message) => message.sender_id === userId && !message.is_sent
      );

      // Get sender and receiver IDs to fetch profiles
      const senderIds = [...new Set(data.map((message) => message.sender_id))];
      const receiverIds = [...new Set(data.map((message) => message.receiver_id))];

      const { data: sendersProfiles, error: sendersError } = await supabase
        .from('profiles')
        .select('id, firstName, lastName')
        .in('id', senderIds);

      const { data: receiversProfiles, error: receiversError } = await supabase
        .from('profiles')
        .select('id, firstName, lastName')
        .in('id', receiverIds);

      if (sendersError || receiversError) {
        console.error('Error fetching profiles:', sendersError || receiversError);
        return;
      }

      // Map profile data to the messages
      const mappedMessages = data.map((message) => {
        const senderProfile = sendersProfiles.find(
          (profile) => profile.id === message.sender_id
        );
        const receiverProfile = receiversProfiles.find(
          (profile) => profile.id === message.receiver_id
        );

        return {
          ...message,
          senderName: senderProfile ? `${senderProfile.firstName} ${senderProfile.lastName}` : 'Unknown Sender',
          receiverName: receiverProfile ? `${receiverProfile.firstName} ${receiverProfile.lastName}` : 'Unknown Receiver',
        };
      });

      // Set messages for each section
      setInboxMessages(mappedMessages.filter((message) => message.receiver_id === userId && message.is_sent));
      setSentMessages(mappedMessages.filter((message) => message.sender_id === userId && message.is_sent));
      setDraftMessages(mappedMessages.filter((message) => message.sender_id === userId && !message.is_sent));
    };

    fetchMessages();
  }, []);

  const handleSend = (message) => {
    setSentMessages((prev) => [
      ...prev,
      { ...message, id: Date.now(), sender: 'You', date: new Date().toLocaleDateString() },
    ]);
    setSelectedSection('Sent');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MessageSidebar
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        setActiveMessage={setActiveMessage} // Reset active message on section change
      />
      <div className="flex-1 p-6 bg-white rounded-lg shadow-lg overflow-y-auto">
        {selectedSection === 'Inbox' && (
          <MessageListWithDetails
            messages={inboxMessages} // or sentMessages, draftMessages based on section
            activeMessage={activeMessage}
            setActiveMessage={setActiveMessage}
            selectedSection={selectedSection} // Pass selectedSection here
          />
        )}
        {selectedSection === 'Sent' && (
          <MessageListWithDetails
            messages={sentMessages}
            activeMessage={activeMessage}
            setActiveMessage={setActiveMessage}
          />
        )}
        {selectedSection === 'Drafts' && (
          <MessageListWithDetails
            messages={draftMessages}
            activeMessage={activeMessage}
            setActiveMessage={setActiveMessage}
          />
        )}
        {selectedSection === 'New Message' && <ComposeMessage onSend={handleSend} />}
      </div>
    </div>
  );
};

export default MessagesPage;
