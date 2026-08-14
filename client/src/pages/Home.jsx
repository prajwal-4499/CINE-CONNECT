import { useNavigate } from "react-router-dom";
import { seedDatabase } from "../utils/seedData";

function Home() {
    const navigate = useNavigate();

    const categories = [
        {
            name: "Wedding",
            image: "/images/wedding.png",
            desc: "Capture your special day with elegant cinematic visual stories."
        },
        {
            name: "Baby Shower",
            image: "/images/baby_shower.png",
            desc: "Heartwarming portraits of parents-to-be and sweet new beginnings."
        },
        {
            name: "Birthday",
            image: "/images/birthday.png",
            desc: "Vibrant memories of laughter, cakes, and colorful celebrations."
        },
        {
            name: "Engagement",
            image: "/images/engagement.png",
            desc: "Celebrate your love story with breathtaking sunset portraiture."
        },
        {
            name: "Event",
            image: "/images/event.png",
            desc: "Dynamic live coverage of corporate functions, gigs, and parties."
        },
        {
            name: "Car Shoot",
            image: "/images/car_shoot.png",
            desc: "Sleek automotive photography highlighting speed and design."
        },
        {
            name: "Fashion & Editorial",
            image: "/images/fashion.png",
            desc: "High-end modeling portfolios, beauty, and magazine shoots."
        },
        {
            name: "Real Estate",
            image: "/images/real_estate.png",
            desc: "Professional property listings and interior design showcases."
        },
        {
            name: "Product",
            image: "/images/product.png",
            desc: "High-quality studio shots for brands and e-commerce."
        },
        {
            name: "Food & Beverage",
            image: "/images/food.png",
            desc: "Appetizing culinary photography for restaurants and cafes."
        },
        {
            name: "Corporate",
            image: "/images/corporate.png",
            desc: "Professional headshots for LinkedIn and company profiles."
        },
        {
            name: "Maternity",
            image: "/images/maternity.png",
            desc: "Beautiful and specialized photoshoots for expecting mothers."
        },
        {
            name: "Pet Photography",
            image: "/images/pet.png",
            desc: "Fun, creative, and memorable portraits with your pets."
        },
        {
            name: "Sports & Action",
            image: "/images/sports.png",
            desc: "Dynamic coverage of athletic events and extreme sports."
        },
        {
            name: "Concerts & Nightlife",
            image: "/images/concerts.png",
            desc: "Vibrant live bands, festivals, and club photography."
        },
    ];

    const handleSeedData = async () => {
        const confirmSeed = window.confirm("Are you sure you want to seed the database with demo users?");
        if (confirmSeed) {
            await seedDatabase();
        }
    };

    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <header className="hero-section">
                <h1 className="hero-title" onClick={handleSeedData} style={{ cursor: "pointer" }}>CINE-CONNECT</h1>
                <p className="hero-subtitle">
                    Find and book the perfect professional photographer for every special moment
                </p>
                <div className="hero-badges">
                    <span className="hero-badge">✨ 100% Verified Profiles</span>
                    <span className="hero-badge">📸 Professional Portfolios</span>
                    <span className="hero-badge">💬 Instant WhatsApp Inquiry</span>
                </div>
            </header>

            {/* CATEGORIES SECTION */}
            <section className="categories-section">
                <h2 className="section-title">Explore Photography Styles</h2>
                <p className="section-subtitle">Select a category to discover award-winning photographers near you</p>
                
                <div className="category-grid">
                    {categories.map((cat) => (
                        <div
                            key={cat.name}
                            className="category-card"
                            onClick={() => navigate(`/category/${cat.name}`)}
                        >
                            <div className="category-img-wrapper">
                                <img src={cat.image} alt={`${cat.name} Photography`} />
                            </div>
                            <div className="category-card-overlay">
                                <div className="category-card-info">
                                    <span className="category-title">{cat.name}</span>
                                    <p className="category-desc">{cat.desc}</p>
                                    <span className="category-action-link">Browse Portfolios →</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PLATFORM FEATURES */}
            <section className="features-section">
                <h2>Why Choose Cine-Connect?</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <span className="feature-icon">✨</span>
                        <h3>Curated Talent</h3>
                        <p>We host top-tier photographers specializing in diverse photography categories and styles.</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">📂</span>
                        <h3>Rich Portfolios</h3>
                        <p>Browse full image galleries, cities, and authentic review ratings before making contact.</p>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">💬</span>
                        <h3>No Middlemen</h3>
                        <p>Contact photographers directly via Email or WhatsApp. No booking fees or hidden charges.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
