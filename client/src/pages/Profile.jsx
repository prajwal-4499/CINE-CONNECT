import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function Profile() {
    const { id } = useParams();
    const [photographer, setPhotographer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed

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