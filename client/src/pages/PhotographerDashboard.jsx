import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const PRESET_CATEGORIES = [
    "Wedding",
    "Engagement",
    "Baby Shower",
    "Birthday",
    "Event",
    "Maternity",
    "Portrait",
    "Corporate",
    "Pre-Wedding",
    "Graduation",
    "Fashion",
    "Product",
    "Car Shoot",
];

function PhotographerDashboard({ user }) {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [customCategoryInput, setCustomCategoryInput] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [portfolio, setPortfolio] = useState([]);
    const [rating, setRating] = useState(5.0);
    const [saveStatus, setSaveStatus] = useState("");

    // Pricing packages state
    const [packages, setPackages] = useState([
        { name: "Basic", description: "2-hour shoot, 20 edited photos", price: "" },
        { name: "Standard", description: "5-hour shoot, 50 edited photos, 1 location", price: "" },
        { name: "Premium", description: "Full-day shoot, 100+ photos, multiple locations", price: "" },
    ]);

    // 🔹 Load user profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const docRef = doc(db, "photographers", user.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setName(data.name || "");
                        setCity(data.city || "");
                        setPhone(data.phone || "");
                        setBio(data.bio || "");
                        setSelectedCategories(data.categories || []);
                        setPortfolio(data.portfolio || []);
                        setRating(data.rating !== undefined ? data.rating : 5.0);
                        if (data.packages && data.packages.length > 0) {
                            setPackages(data.packages);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching photographer profile:", error);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    // 🔹 Toggle a preset category
    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    // 🔹 Add custom category
    const handleAddCustomCategory = () => {
        const trimmed = customCategoryInput.trim();
        if (!trimmed) return;
        // Capitalize first letter
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        if (!selectedCategories.includes(formatted)) {
            setSelectedCategories((prev) => [...prev, formatted]);
        }
        setCustomCategoryInput("");
    };

    // 🔹 Remove a selected category
    const removeCategory = (cat) => {
        setSelectedCategories((prev) => prev.filter((c) => c !== cat));
    };

    // 🔹 Add Portfolio Image
    const handleAddImage = (e) => {
        e.preventDefault();
        const url = portfolioUrl.trim();
        if (!url) return;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            alert("Image URL must start with http:// or https://");
            return;
        }
        setPortfolio([...portfolio, url]);
        setPortfolioUrl("");
    };

    // 🔹 Remove Portfolio Image
    const handleRemoveImage = (indexToRemove) => {
        setPortfolio(portfolio.filter((_, idx) => idx !== indexToRemove));
    };

    // 🔹 Update a pricing package field
    const updatePackage = (index, field, value) => {
        const updated = [...packages];
        updated[index][field] = value;
        setPackages(updated);
    };

    // 🔹 Save profile
    const handleSave = async () => {
        if (!user) return;

        const profileData = {
            name: name.trim(),
            email: user.email,
            city: city.trim(),
            phone: phone.trim(),
            bio: bio.trim(),
            categories: selectedCategories,
            rating: rating,
            portfolio: portfolio,
            packages: packages,
        };

        setSaveStatus("Saving...");
        try {
            const docRef = doc(db, "photographers", user.uid);
            await setDoc(docRef, profileData, { merge: true });
            setSaveStatus("Profile saved successfully!");
            setTimeout(() => setSaveStatus(""), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            setSaveStatus(`Error saving profile: ${error.message || error}`);
        }
    };

    // 🔹 Logout
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    if (loading) return (
        <div className="loading-container">
            <p>Loading dashboard...</p>
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <h2>Photographer Dashboard</h2>
                <p className="dashboard-subtitle">Update your studio details and manage your portfolio</p>

                {user ? (
                    <>
                        {saveStatus && (
                            <div className={`save-status-alert ${saveStatus.includes("successfully") ? "success" : saveStatus.includes("Error") ? "error" : "info"}`}>
                                {saveStatus}
                            </div>
                        )}

                        {/* ─── BASIC INFO ─── */}
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Account Email</label>
                                <input value={user.email} disabled className="disabled-input" />
                            </div>

                            <div className="form-group">
                                <label>Studio / Photographer Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Royal Wedding Studio"
                                />
                            </div>

                            <div className="form-group">
                                <label>City</label>
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Pune"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Contact Phone (WhatsApp)</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+919876543210"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Biography / Studio Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Brief introduction about your photography style, years of experience, and services..."
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* ─── CATEGORY SELECTOR ─── */}
                        <div className="dashboard-section">
                            <h3 className="section-label">Photography Categories</h3>
                            <p className="section-hint">Click to toggle. Add a custom category below if yours isn't listed.</p>

                            <div className="category-toggle-grid">
                                {PRESET_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`category-toggle-btn ${selectedCategories.includes(cat) ? "active" : ""}`}
                                        onClick={() => toggleCategory(cat)}
                                    >
                                        {selectedCategories.includes(cat) && <span className="check-icon">✓ </span>}
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="custom-category-row">
                                <input
                                    value={customCategoryInput}
                                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomCategory()}
                                    placeholder="Add custom category (e.g. Underwater)"
                                />
                                <button type="button" className="add-url-btn" onClick={handleAddCustomCategory}>
                                    Add
                                </button>
                            </div>

                            {selectedCategories.length > 0 && (
                                <div className="selected-categories-chips">
                                    <p className="chips-label">Selected ({selectedCategories.length}):</p>
                                    <div className="chips-row">
                                        {selectedCategories.map((cat) => (
                                            <span key={cat} className="selected-chip">
                                                {cat}
                                                <button
                                                    type="button"
                                                    className="chip-remove-btn"
                                                    onClick={() => removeCategory(cat)}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── PRICING PACKAGES ─── */}
                        <div className="dashboard-section">
                            <h3 className="section-label">Pricing Packages</h3>
                            <p className="section-hint">Set clear pricing for each package. Leave price blank to hide it on your profile.</p>
                            <div className="packages-grid">
                                {packages.map((pkg, index) => (
                                    <div key={index} className="package-editor-card">
                                        <div className="package-editor-name">{pkg.name}</div>
                                        <input
                                            value={pkg.description}
                                            onChange={(e) => updatePackage(index, "description", e.target.value)}
                                            placeholder="What's included?"
                                            className="package-desc-input"
                                        />
                                        <div className="package-price-row">
                                            <span className="currency-symbol">₹</span>
                                            <input
                                                type="number"
                                                value={pkg.price}
                                                onChange={(e) => updatePackage(index, "price", e.target.value)}
                                                placeholder="Price"
                                                className="package-price-input"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── PORTFOLIO IMAGES ─── */}
                        <div className="dashboard-section">
                            <h3 className="section-label">Portfolio Images</h3>
                            <p className="section-hint">Paste a direct image URL to add it to your portfolio gallery.</p>
                            <div className="url-input-wrapper">
                                <input
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    placeholder="https://example.com/photo.jpg"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddImage(e)}
                                />
                                <button onClick={handleAddImage} className="add-url-btn">Add Image</button>
                            </div>

                            {portfolio.length > 0 ? (
                                <div className="portfolio-preview-grid" style={{ marginTop: "16px" }}>
                                    {portfolio.map((img, index) => (
                                        <div key={index} className="portfolio-preview-item">
                                            <img src={img} alt={`Portfolio ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="remove-img-btn"
                                                onClick={() => handleRemoveImage(index)}
                                                title="Remove Image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-portfolio-msg" style={{ marginTop: "12px" }}>
                                    No images added yet. Add URLs above to start your showcase!
                                </p>
                            )}
                        </div>

                        <div className="action-buttons">
                            <button className="save-btn" onClick={handleSave}>
                                Save Profile Changes
                            </button>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="error-container">
                        <p>No user logged in. Please log in first.</p>
                        <button onClick={() => navigate("/login")}>Go to Login</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PhotographerDashboard;