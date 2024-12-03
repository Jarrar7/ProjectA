import React, { useState } from 'react';
import MessageSidebar from '../components/Messages/MessageSidebar';
import MessageListWithDetails from '../components/Messages/MessageListWithDetails';
import ComposeMessage from '../components/Messages/ComposeMessage';

const MessagesPage = () => {
    const [selectedSection, setSelectedSection] = useState('Inbox');
    const [activeMessage, setActiveMessage] = useState(null);

    const [inboxMessages, setInboxMessages] = useState([
        { id: 1, sender: 'Teacher A', subject: 'Attendance Issue', date: '2024-11-29', body: 'You were marked absent.' },
        { id: 2, sender: 'Teacher B', subject: 'Lecture Reminder', date: '2024-11-28', body: 'Reminder for lecture.' },
    ]);

    const [sentMessages, setSentMessages] = useState([
        { id: 3, sender: 'You', subject: 'Attendance Clarification', date: '2024-11-27', body: 'I was present for this lecture.' },
        { id: 4, sender: 'You', subject: 'Follow-Up: Attendance Issue', date: '2024-11-26', body: 'Can you confirm my attendance?' },
    ]);

    const [draftMessages, setDraftMessages] = useState([
        { id: 5, sender: 'You', subject: 'Meeting Request', date: '2024-11-25', body: 'I would like to discuss my attendance records.' },
        { id: 6, sender: 'You', subject: 'Lecture Notes Request', date: '2024-11-24', body: 'Could you share the notes from today’s lecture?' },
    ]);

    const handleSend = (message) => {
        setSentMessages((prev) => [
            ...prev,
            { ...message, id: Date.now(), sender: 'You', date: new Date().toLocaleDateString() },
        ]);
        setSelectedSection('Sent');
    };

    return (
        <div className="flex h-screen">
            <MessageSidebar
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                setActiveMessage={setActiveMessage} // Reset active message on section change
            />
            {selectedSection === 'Inbox' && (
                <MessageListWithDetails
                    messages={inboxMessages}
                    activeMessage={activeMessage}
                    setActiveMessage={setActiveMessage}
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
    );
};

export default MessagesPage;
