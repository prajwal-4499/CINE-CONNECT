import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Profile() {
    const { id } = useParams();
    const [photographer, setPhotographer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed
    
    // Reviews & Favorites state
    const [currentUser, setCurrentUser] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Check if favorite
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().favorites?.includes(id)) {
                    setIsFavorite(true);
                }
            }
        });
        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const fetchPhotographer = async () => {
            try {
                const docRef = doc(db, "photographers", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPhotographer(docSnap.data());
                } else {
                    setPhotographer(null);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotographer();
    }, [id]);

    // Close lightbox on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") setLightboxIndex(null);
            if (e.key === "ArrowRight" && lightboxIndex !== null) {
                setLightboxIndex((prev) =>
                    prev < photographer.portfolio.length - 1 ? prev + 1 : 0
                );
            }
            if (e.key === "ArrowLeft" && lightboxIndex !== null) {
                setLightboxIndex((prev) =>
                    prev > 0 ? prev - 1 : photographer.portfolio.length - 1
                );
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightboxIndex, photographer]);

    const handleToggleFavorite = async () => {
        if (!currentUser) return alert("Please log in to save favorites.");
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            let currentFavs = userDoc.exists() && userDoc.data().favorites ? userDoc.data().favorites : [];
            
            if (isFavorite) {
                currentFavs = currentFavs.filter(favId => favId !== id);
                setIsFavorite(false);
            } else {
                currentFavs.push(id);
                setIsFavorite(true);
            }
            await updateDoc(userRef, { favorites: currentFavs });
        } catch (error) {
            console.error("Error toggling favorite", error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!currentUser) return alert("Please log in to leave a review.");
        if (!reviewText.trim()) return;

        setSubmittingReview(true);
        try {
            const newReview = {
                userId: currentUser.uid,
                userName: currentUser.email.split("@")[0],
                rating: Number(reviewRating),
                text: reviewText.trim(),
                date: new Date().toISOString()
            };
            
            const docRef = doc(db, "photographers", id);
            await updateDoc(docRef, {
                reviews: arrayUnion(newReview)
            });
            
            // Update local state
            setPhotographer(prev => ({
                ...prev,
                reviews: [...(prev.reviews || []), newReview]
            }));
            
            setReviewText("");
            setReviewRating(5);
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div className="loading-container"><p>Loading profile...</p></div>
    );

    if (!photographer) return (
        <div className="error-container">
            <p>Photographer profile not found.</p>
            <Link to="/" className="back-home-btn">Go back to Home</Link>
        </div>
    );

    const getWhatsAppLink = () => {
        if (!photographer.phone) return "";
        const cleanNumber = photographer.phone.replace(/\D/g, "");
        const text = encodeURIComponent(
            `Hi ${photographer.name || "there"}, I saw your profile on CINE-CONNECT and would love to inquire about your photography services!`
        );
        return `https://wa.me/${cleanNumber}?text=${text}`;
    };

    const portfolio = photographer.portfolio || [];
    const packages = (photographer.packages || []).filter((p) => p.price);

    return (
        <div className="profile-container">
            <Link to="/" className="back-link">← Back to Explore</Link>

            {/* HERO CARD */}
            <div className="profile-hero-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div className="profile-avatar-circle">
                            {photographer.name ? photographer.name.charAt(0).toUpperCase() : "📷"}
                        </div>
                        <h2 className="profile-name">{photographer.name || "Unnamed Studio"}</h2>
                        <div className="profile-meta-info">
                            <span className="profile-city-badge">📍 {photographer.city || "Unknown City"}</span>
                            {photographer.rating && (
                                <span className="profile-rating-badge">⭐ {Number(photographer.rating).toFixed(1)} / 5.0</span>
                            )}
                        </div>
                    </div>
                    {currentUser && (
                        <button 
                            onClick={handleToggleFavorite}
                            style={{
                                background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer',
                                color: isFavorite ? 'var(--rose-500)' : 'var(--slate-400)',
                                transition: 'color 0.2s', position: 'absolute', right: '20px', top: '20px'
                            }}
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            {isFavorite ? '❤️' : '🤍'}
                        </button>
                    )}
                </div>
                {photographer.categories && photographer.categories.length > 0 && (
                    <div className="profile-categories-list">
                        {photographer.categories.map((cat, index) => (
                            <span key={index} className="profile-category-pill">{cat}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* BIO */}
            {photographer.bio && (
                <div className="profile-section bio-section">
                    <h3>About the Photographer</h3>
                    <p className="profile-bio-text">{photographer.bio}</p>
                </div>
            )}

            {/* PRICING PACKAGES */}
            {packages.length > 0 && (
                <div className="profile-section">
                    <h3>Pricing Packages</h3>
                    <div className="pricing-grid">
                        {packages.map((pkg, index) => (
                            <div key={index} className={`pricing-card ${index === 1 ? "pricing-card-featured" : ""}`}>
                                {index === 1 && <div className="pricing-popular-badge">Most Popular</div>}
                                <div className="pricing-card-name">{pkg.name}</div>
                                <div className="pricing-card-price">
                                    <span className="pricing-currency">₹</span>
                                    {Number(pkg.price).toLocaleString("en-IN")}
                                </div>
                                <p className="pricing-card-desc">{pkg.description}</p>
                                {photographer.email && (
                                    <a
                                        href={`mailto:${photographer.email}?subject=Inquiry about ${pkg.name} Package&body=Hi ${photographer.name}, I am interested in your ${pkg.name} package (₹${pkg.price}). Please share more details.`}
                                        className="pricing-book-btn"
                                    >
                                        Book This Package
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PORTFOLIO GALLERY with Lightbox */}
            <div className="profile-section portfolio-section">
                <h3>Portfolio Gallery</h3>
                {portfolio.length > 0 ? (
                    <>
                        <p className="gallery-hint">Click any image to view full screen</p>
                        <div className="profile-portfolio-grid">
                            {portfolio.map((img, index) => (
                                <div
                                    key={index}
                                    className="gallery-card"
                                    onClick={() => setLightboxIndex(index)}
                                    title="Click to expand"
                                >
                                    <img
                                        src={img}
                                        alt={`${photographer.name} Portfolio ${index + 1}`}
                                        className="gallery-image"
                                    />
                                    <div className="gallery-expand-icon">🔍</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="no-gallery-card">
                        <p>No portfolio images uploaded by this photographer yet.</p>
                    </div>
                )}
            </div>

            {/* UNAVAILABLE DATES */}
            {photographer.unavailableDates && photographer.unavailableDates.length > 0 && (
                <div className="profile-section">
                    <h3>Unavailable Dates</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                        {photographer.unavailableDates.map((date, idx) => (
                            <span key={idx} style={{ background: 'var(--slate-100)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', color: 'var(--slate-700)' }}>
                                📅 {new Date(date).toLocaleDateString()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="profile-section">
                <h3>Client Reviews</h3>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {photographer.reviews && photographer.reviews.length > 0 ? (
                        photographer.reviews.map((rev, idx) => (
                            <div key={idx} style={{ padding: '15px', border: '1px solid var(--slate-200)', borderRadius: '8px', backgroundColor: 'var(--white)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '600' }}>{rev.userName}</span>
                                    <span>{'⭐'.repeat(rev.rating)}</span>
                                </div>
                                <p style={{ color: 'var(--slate-600)', fontSize: '14px', margin: '0 0 10px 0' }}>{rev.text}</p>
                                <span style={{ fontSize: '12px', color: 'var(--slate-400)' }}>{new Date(rev.date).toLocaleDateString()}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--slate-500)' }}>No reviews yet. Be the first to leave one!</p>
                    )}
                </div>

                {currentUser && (
                    <form onSubmit={handleSubmitReview} style={{ marginTop: '30px', padding: '20px', backgroundColor: 'var(--slate-50)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>Leave a Review</h4>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ marginRight: '10px' }}>Rating:</label>
                            <select value={reviewRating} onChange={e => setReviewRating(e.target.value)} style={{ padding: '5px' }}>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            placeholder="Write your review here..."
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--slate-300)', minHeight: '80px', marginBottom: '15px' }}
                        />
                        <button type="submit" disabled={submittingReview} style={{ background: 'var(--primary-600)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: submittingReview ? 'not-allowed' : 'pointer' }}>
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}
            </div>

            {/* CONTACT */}
            <div className="profile-section contact-section-card">
                <h3>Interested in working together?</h3>
                <p>Send an inquiry directly to the photographer via Email or WhatsApp.</p>
                <div className="profile-contact-buttons">
                    {photographer.email && (
                        <a
                            href={`mailto:${photographer.email}?subject=Inquiry%20from%20CINE-CONNECT&body=Hi%20${photographer.name || "there"},%20I%20saw%20your%20portfolio%20on%20CINE-CONNECT%20and%20would%20like%20to%20get%20in%20touch%20regarding%20an%20upcoming%20shoot.`}
                            className="contact-btn email-btn"
                        >
                            <span>✉️</span> Email Photographer
                        </a>
                    )}
                    {photographer.phone && (
                        <a
                            href={getWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-btn whatsapp-btn"
                        >
                            <span>💬</span> WhatsApp Chat
                        </a>
                    )}
                </div>
            </div>

            {/* LIGHTBOX OVERLAY */}
            {lightboxIndex !== null && portfolio.length > 0 && (
                <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
                    <button
                        className="lightbox-close"
                        onClick={() => setLightboxIndex(null)}
                    >
                        ✕
                    </button>

                    <button
                        className="lightbox-nav lightbox-prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) =>
                                prev > 0 ? prev - 1 : portfolio.length - 1
                            );
                        }}
                    >
                        ‹
                    </button>

                    <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={portfolio[lightboxIndex]}
                            alt={`Portfolio ${lightboxIndex + 1}`}
                            className="lightbox-image"
                        />
                        <div className="lightbox-counter">
                            {lightboxIndex + 1} / {portfolio.length}
                        </div>
                    </div>

                    <button
                        className="lightbox-nav lightbox-next"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) =>
                                prev < portfolio.length - 1 ? prev + 1 : 0
                            );
                        }}
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}

export default Profile;