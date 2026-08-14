import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function ClientDashboard({ user }) {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [favoritePhotographers, setFavoritePhotographers] = useState([]);
    const [activeTab, setActiveTab] = useState("jobs"); // "jobs" or "saved"
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Wedding");
    const [budget, setBudget] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [description, setDescription] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchRequirements();
        fetchFavorites();
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().favorites?.length > 0) {
                const favIds = userDoc.data().favorites;
                const photogs = await Promise.all(
                    favIds.map(async (fid) => {
                        const pDoc = await getDoc(doc(db, "photographers", fid));
                        return pDoc.exists() ? { id: pDoc.id, ...pDoc.data() } : null;
                    })
                );
                setFavoritePhotographers(photogs.filter(Boolean));
            } else {
                setFavoritePhotographers([]);
            }
        } catch (err) {
            console.error("Error fetching favorites:", err);
        }
    };

    const fetchRequirements = async () => {
        try {
            const q = query(collection(db, "requirements"), where("clientId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const reqs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // sort by createdAt descending locally since we didn't index it
            reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequirements(reqs);
        } catch (error) {
            console.error("Error fetching requirements: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostRequirement = async (e) => {
        e.preventDefault();
        setPosting(true);
        try {
            const newReq = {
                clientId: user.uid,
                title,
                category,
                budget,
                location,
                eventDate,
                description,
                createdAt: new Date().toISOString(),
                status: "open"
            };
            await addDoc(collection(db, "requirements"), newReq);
            alert("Requirement posted successfully!");
            // Reset form
            setTitle("");
            setCategory("Wedding");
            setBudget("");
            setLocation("");
            setEventDate("");
            setDescription("");
            fetchRequirements(); // refresh list
        } catch (error) {
            console.error("Error posting requirement: ", error);
            alert("Failed to post requirement.");
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job post?")) return;
        try {
            await deleteDoc(doc(db, "requirements", id));
            setRequirements(prev => prev.filter(req => req.id !== id));
        } catch (error) {
            console.error("Error deleting: ", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', color: 'var(--secondary)', marginBottom: '5px' }}>Client Dashboard</h1>
                    <p style={{ color: 'var(--slate-600)' }}>Manage your photography requirements and saved profiles</p>
                </div>
                <button onClick={handleLogout} className="btn-logout" style={{ padding: '10px 20px', backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    Logout
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '10px' }}>
                <button 
                    onClick={() => setActiveTab("jobs")}
                    style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: activeTab === 'jobs' ? '600' : '400', color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--slate-500)', cursor: 'pointer', padding: '5px 10px', borderBottom: activeTab === 'jobs' ? '2px solid var(--primary)' : 'none' }}>
                    My Job Posts
                </button>
                <button 
                    onClick={() => setActiveTab("saved")}
                    style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: activeTab === 'saved' ? '600' : '400', color: activeTab === 'saved' ? 'var(--primary)' : 'var(--slate-500)', cursor: 'pointer', padding: '5px 10px', borderBottom: activeTab === 'saved' ? '2px solid var(--primary)' : 'none' }}>
                    Saved Photographers
                </button>
            </div>

            {activeTab === "jobs" && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                
                {/* POST NEW REQUIREMENT FORM */}
                <div style={{ backgroundColor: 'var(--white)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--slate-900)' }}>Post New Job</h2>
                    <form onSubmit={handlePostRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Job Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)' }} placeholder="e.g., Pre-wedding shoot" />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                                <option>Wedding</option>
                                <option>Engagement</option>
                                <option>Event</option>
                                <option>Portrait</option>
                                <option>Product</option>
                                <option>Car Shoot</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Budget (Approx)</label>
                            <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)' }} placeholder="e.g., $500 - $1000" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Location</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)' }} placeholder="City, State" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Event Date</label>
                            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)', resize: 'vertical' }} placeholder="Provide details about your requirement..."></textarea>
                        </div>

                        <button type="submit" disabled={posting} style={{ padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '10px' }}>
                            {posting ? "Posting..." : "Post Job"}
                        </button>
                    </form>
                </div>

                {/* MY POSTED JOBS */}
                <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--slate-900)' }}>My Job Posts</h2>
                    {loading ? (
                        <p>Loading your posts...</p>
                    ) : requirements.length === 0 ? (
                        <div style={{ backgroundColor: 'var(--white)', padding: '40px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
                            <h3 style={{ color: 'var(--slate-900)', marginBottom: '5px' }}>No jobs posted yet</h3>
                            <p style={{ color: 'var(--slate-600)' }}>Fill out the form to post your first requirement.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {requirements.map(req => (
                                <div key={req.id} style={{ backgroundColor: 'var(--white)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--slate-900)' }}>{req.title}</h3>
                                        <span style={{ fontSize: '12px', backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>{req.category}</span>
                                    </div>
                                    <p style={{ margin: '0 0 15px 0', color: 'var(--slate-600)', fontSize: '14px', lineHeight: '1.5' }}>{req.description}</p>
                                    
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--slate-700)' }}>
                                            <span>💰</span> {req.budget}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--slate-700)' }}>
                                            <span>📍</span> {req.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--slate-700)' }}>
                                            <span>📅</span> {req.eventDate}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-100)', paddingTop: '15px' }}>
                                        <button onClick={() => handleDelete(req.id)} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                                            Delete Post
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                </div>
            )}
            
            {activeTab === "saved" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {favoritePhotographers.length > 0 ? (
                        favoritePhotographers.map((photog) => (
                            <div key={photog.id} style={{ padding: '20px', backgroundColor: 'var(--white)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                        {photog.name ? photog.name.charAt(0).toUpperCase() : "📷"}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px' }}>{photog.name}</h3>
                                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--slate-500)' }}>📍 {photog.city}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/profile/${photog.id}`)}
                                    style={{ marginTop: 'auto', padding: '10px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    View Profile
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '12px', color: 'var(--slate-500)' }}>
                            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🤍</span>
                            <p>You haven't saved any photographers yet.</p>
                            <button onClick={() => navigate("/")} style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Explore Photographers</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ClientDashboard;
