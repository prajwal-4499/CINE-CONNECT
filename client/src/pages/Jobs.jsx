import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, getDocs, addDoc, serverTimestamp, where, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const q = query(collection(db, "requirements"));
                const snapshot = await getDocs(q);
                const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // sort by newest
                fetchedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Error fetching jobs: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleReachOut = async (job) => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (userRole === "client") {
            alert("Clients cannot reach out to other clients' jobs.");
            return;
        }

        try {
            // Check if a chat already exists between this photographer and client for this job
            // Actually, just for this photographer and client in general is fine, or per job. Let's do per job to be safe.
            const chatQ = query(
                collection(db, "chats"), 
                where("photographerId", "==", user.uid),
                where("jobId", "==", job.id)
            );
            const chatSnap = await getDocs(chatQ);

            let chatId;
            if (!chatSnap.empty) {
                // Chat already exists
                chatId = chatSnap.docs[0].id;
            } else {
                // Create new chat
                const newChatRef = await addDoc(collection(db, "chats"), {
                    jobId: job.id,
                    jobTitle: job.title,
                    clientId: job.clientId,
                    photographerId: user.uid,
                    participants: [user.uid, job.clientId],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastMessage: "Chat started"
                });
                chatId = newChatRef.id;
            }

            // Navigate to messages
            navigate(`/messages?chat=${chatId}`);

        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Could not start chat. Please try again.");
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--slate-50)' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '36px', color: 'var(--slate-900)', fontWeight: '700', marginBottom: '10px' }}>Job Board</h1>
                <p style={{ fontSize: '18px', color: 'var(--slate-600)', maxWidth: '600px', margin: '0 auto' }}>
                    Find clients looking for your photography services and connect with them directly.
                </p>
                
                <input 
                    type="text" 
                    placeholder="Search by title, location, or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        width: '100%', maxWidth: '500px', padding: '15px 20px', borderRadius: '30px', 
                        border: '1px solid var(--slate-200)', marginTop: '30px', fontSize: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', outline: 'none'
                    }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: 'var(--slate-600)' }}>Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>🔍</div>
                    <h2 style={{ color: 'var(--slate-900)', marginBottom: '10px' }}>No jobs found</h2>
                    <p style={{ color: 'var(--slate-600)' }}>Try adjusting your search criteria or check back later.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                    {filteredJobs.map(job => (
                        <div key={job.id} style={{ 
                            backgroundColor: 'var(--white)', borderRadius: '16px', padding: '25px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
                            transition: 'transform 0.3s ease', cursor: 'default'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '20px', margin: '0', color: 'var(--slate-900)', fontWeight: '600' }}>{job.title}</h3>
                                <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                    {job.category}
                                </span>
                            </div>
                            
                            <p style={{ color: 'var(--slate-600)', fontSize: '15px', lineHeight: '1.6', flex: 1, marginBottom: '20px' }}>
                                {job.description}
                            </p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderTop: '1px solid var(--slate-100)', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-700)' }}>
                                    <span>📍</span> {job.location}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-700)' }}>
                                    <span>💰</span> {job.budget}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-700)' }}>
                                    <span>📅</span> {new Date(job.eventDate).toLocaleDateString()}
                                </div>
                            </div>

                            <button 
                                onClick={() => handleReachOut(job)}
                                style={{ 
                                    width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', 
                                    border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', 
                                    cursor: 'pointer', transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                Reach Out to Client
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Jobs;
