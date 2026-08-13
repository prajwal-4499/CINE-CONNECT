import { useState, useEffect, useRef } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";

function Messages() {
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [participantNames, setParticipantNames] = useState({});
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    // Initial auth setup
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Fetch user's chats
    useEffect(() => {
        if (!user) return;
        
        const q = query(
            collection(db, "chats"), 
            where("participants", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // sort by updatedAt
            fetchedChats.sort((a, b) => {
                const dateA = a.updatedAt ? a.updatedAt.toMillis() : 0;
                const dateB = b.updatedAt ? b.updatedAt.toMillis() : 0;
                return dateB - dateA;
            });
            setChats(fetchedChats);
            setLoading(false);

            // If there's a chat id in the URL, set it as active
            const chatIdFromUrl = searchParams.get("chat");
            if (chatIdFromUrl && fetchedChats.some(c => c.id === chatIdFromUrl)) {
                setActiveChatId(chatIdFromUrl);
            } else if (fetchedChats.length > 0 && !activeChatId) {
                setActiveChatId(fetchedChats[0].id);
            }
        });

        return () => unsubscribe();
    }, [user, searchParams, activeChatId]);

    // Fetch participant names
    useEffect(() => {
        const fetchNames = async () => {
            if (!user || chats.length === 0) return;
            const newNames = { ...participantNames };
            let updated = false;
            
            for (const chat of chats) {
                const otherId = chat.participants?.find(p => p !== user.uid);
                if (otherId && !newNames[otherId]) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", otherId));
                        if (userDoc.exists()) {
                            newNames[otherId] = userDoc.data().name || userDoc.data().email?.split('@')[0] || "Unknown User";
                            updated = true;
                        }
                    } catch (error) {
                        console.error("Error fetching user name:", error);
                    }
                }
            }
            if (updated) {
                setParticipantNames(newNames);
            }
        };
        fetchNames();
    }, [chats, user]);

    // Fetch messages for active chat
    useEffect(() => {
        if (!activeChatId) return;

        const q = query(
            collection(db, `chats/${activeChatId}/messages`),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMsgs);
            // scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        });

        return () => unsubscribe();
    }, [activeChatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatId || !user) return;

        const text = newMessage.trim();
        setNewMessage(""); // optimistic clear

        try {
            await addDoc(collection(db, `chats/${activeChatId}/messages`), {
                senderId: user.uid,
                text: text,
                timestamp: serverTimestamp()
            });
            
            // Note: Cloud functions or a separate write to update the `updatedAt` and `lastMessage` in the chat doc would be ideal.
            // But since this is client-side only, we can leave it or update it directly (requiring extra write).
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("Failed to send message.");
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading messages...</div>;
    }

    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div className="messages-container">
            
            {/* Sidebar (Chat List) */}
            <div className={`chat-sidebar ${activeChatId ? 'hidden-on-mobile' : ''}`}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--slate-200)' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--slate-900)' }}>Messages</h2>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {chats.length === 0 ? (
                        <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--slate-500)' }}>
                            No conversations yet.
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div 
                                key={chat.id} 
                                onClick={() => setActiveChatId(chat.id)}
                                style={{ 
                                    padding: '20px', borderBottom: '1px solid var(--slate-100)', cursor: 'pointer',
                                    backgroundColor: activeChatId === chat.id ? 'var(--slate-50)' : 'transparent',
                                    transition: 'background-color 0.2s',
                                    borderLeft: activeChatId === chat.id ? '4px solid var(--primary)' : '4px solid transparent'
                                }}
                            >
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'var(--slate-900)' }}>
                                    {chat.jobTitle || "Job Inquiry"}
                                </h3>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>
                                    With: {participantNames[chat.participants?.find(p => p !== user?.uid)] || "Loading..."}
                                </p>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {chat.lastMessage || "Start chatting..."}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`chat-main ${!activeChatId ? 'hidden-on-mobile' : ''}`}>
                {activeChat ? (
                    <>
                        <div style={{ padding: '15px 20px', backgroundColor: 'var(--white)', borderBottom: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button 
                                className="mobile-back-btn" 
                                onClick={() => setActiveChatId(null)}
                                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 5px', color: 'var(--slate-600)' }}
                            >
                                ←
                            </button>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--slate-900)' }}>{activeChat.jobTitle || "Job Inquiry"}</h2>
                                <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--slate-500)' }}>
                                    Chat securely with <strong>{participantNames[activeChat.participants?.find(p => p !== user?.uid)] || "the other party"}</strong>
                                </p>
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--slate-500)', marginTop: '50px' }}>
                                    Send a message to start the conversation!
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.senderId === user.uid;
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                            {!isMe && (
                                                <div style={{ fontSize: '12px', color: 'var(--slate-500)', marginBottom: '4px', marginLeft: '6px', fontWeight: '500' }}>
                                                    {participantNames[msg.senderId] || "User"}
                                                </div>
                                            )}
                                            <div style={{ 
                                                backgroundColor: isMe ? 'var(--primary)' : 'var(--white)',
                                                color: isMe ? 'white' : 'var(--slate-900)',
                                                padding: '12px 18px',
                                                borderRadius: '16px',
                                                borderBottomRightRadius: isMe ? '4px' : '16px',
                                                borderBottomLeftRadius: !isMe ? '4px' : '16px',
                                                boxShadow: 'var(--shadow-sm)',
                                                fontSize: '15px',
                                                lineHeight: '1.5'
                                            }}>
                                                {msg.text}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '5px', textAlign: isMe ? 'right' : 'left' }}>
                                                {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ padding: '20px 30px', backgroundColor: 'var(--white)', borderTop: '1px solid var(--slate-200)' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '15px' }}>
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    style={{ flex: 1, padding: '15px 20px', borderRadius: '30px', border: '1px solid var(--slate-200)', outline: 'none', fontSize: '15px', backgroundColor: 'var(--slate-50)' }}
                                />
                                <button type="submit" disabled={!newMessage.trim()} style={{ 
                                    padding: '0 30px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', 
                                    borderRadius: '30px', fontWeight: '600', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                    opacity: newMessage.trim() ? 1 : 0.6
                                }}>
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--slate-500)' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>💬</div>
                        <h2 style={{ color: 'var(--slate-700)', margin: 0 }}>Your Messages</h2>
                        <p style={{ marginTop: '10px' }}>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
