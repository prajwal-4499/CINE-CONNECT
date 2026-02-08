import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const categories = [
        {
            name: "Wedding",
            image:
                "https://t3.ftcdn.net/jpg/03/38/79/70/360_F_338797073_CsO0jjvg8f8E9WqPJJn072tBwYrsFOcH.jpg",
        },
        {
            name: "Baby Shower",
            image:
                "https://cdn.balloondekor.com/26/1766754716700.webp",
        },
        {
            name: "Birthday",
            image:
                "https://media.gettyimages.com/id/1454098743/vector/blue-color-background-with-podium-for-birthday-celebration.jpg?s=612x612&w=0&k=20&c=mxNZOoUgIZAu6NFsvZGwzoBsgLq96qO2m7KH-8DV1g4=",
        },
        {
            name: "Engagement",
            image:
                "https://media.gettyimages.com/id/177109164/photo/hands-of-engagement.jpg?s=612x612&w=0&k=20&c=00CbPI8LdRcz4YQEz_xyjAuS0I51XhRZNoaSNS2_CYU=",
        },
        {
            name: "Event",
            image:
                "https://t3.ftcdn.net/jpg/16/49/52/78/360_F_1649527836_yCrQUdlIAguXWde85pgVf56S3c1ilVFp.jpg",
        },
    ];

    return (
        <div>
            {/* HERO SECTION */}
            <h1 className="hero-title">CINE-CONNECT</h1>
            <p className="hero-subtitle">
                Find the perfect photographer for every special moment
            </p>

            <h2>Explore Photography Categories</h2>

            <div className="category-grid">
                {categories.map((cat) => (
                    <div
                        key={cat.name}
                        className="category-card"
                        onClick={() => navigate(`/category/${cat.name}`)}
                    >
                        <img src={cat.image} alt={cat.name} />
                        <div className="category-title">{cat.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
