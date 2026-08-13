import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import PhotographerCard from "../components/PhotographerCard";

function Category() {
    const { name } = useParams();
    const navigate = useNavigate();

    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState("all");
    const [minRating, setMinRating] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("rating");

    useEffect(() => {
        const fetchPhotographers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "photographers"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPhotographers(data);
            } catch (error) {
                console.error("Error fetching photographers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotographers();
    }, []);

    // City list
    const cities = [
        "all",
        ...new Set(photographers.map((p) => p.city).filter(Boolean)),
    ];

    // Filter + sort
    const filteredPhotographers = photographers
        .filter((p) => {
            const categoryMatch = p.categories?.some(
                (cat) => cat.toLowerCase() === name.toLowerCase()
            );
            const cityMatch = selectedCity === "all" || p.city === selectedCity;
            const photographerRating = typeof p.rating === "number" ? p.rating : 5.0;
            const ratingMatch = photographerRating >= minRating;
            const searchMatch =
                !searchQuery ||
                (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.city || "").toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && cityMatch && ratingMatch && searchMatch;
        })
        .sort((a, b) => {
            if (sortBy === "rating") {
                return (b.rating || 0) - (a.rating || 0);
            } else if (sortBy === "name") {
                return (a.name || "").localeCompare(b.name || "");
            } else if (sortBy === "portfolio") {
                return (b.portfolio?.length || 0) - (a.portfolio?.length || 0);
            }
            return 0;
        });

    if (loading) {
        return (
            <div className="loading-container">
                <p>Loading photographers...</p>
            </div>
        );
    }

    return (
        <div className="category-container">
            <div className="category-header">
                <h2>Browse Category: {name}</h2>
                <p>Showing {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? "s" : ""} in this category</p>
            </div>

            {/* SEARCH BAR */}
            <div className="search-bar-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    id="photographer-search"
                    type="text"
                    className="search-bar-input"
                    placeholder="Search by name or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button className="search-clear-btn" onClick={() => setSearchQuery("")}>✕</button>
                )}
            </div>

            {/* FILTER & SORT BAR */}
            <div className="filter-bar">
                <div className="filter-group">
                    <label htmlFor="city-filter">Filter by City</label>
                    <select
                        id="city-filter"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city === "all" ? "All Cities" : city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group slider-group">
                    <label htmlFor="rating-filter">Min Rating: ⭐ {minRating.toFixed(1)}</label>
                    <input
                        id="rating-filter"
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="sort-filter">Sort By</label>
                    <select
                        id="sort-filter"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="rating">Highest Rating</option>
                        <option value="name">Name (A–Z)</option>
                        <option value="portfolio">Most Portfolio Images</option>
                    </select>
                </div>
            </div>

            {/* PHOTOGRAPHER CARDS */}
            {filteredPhotographers.length === 0 ? (
                <div className="no-photographers-card">
                    <p>No photographers found matching your search or filters.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {filteredPhotographers.map((photo) => (
                        <PhotographerCard
                            key={photo.id}
                            photographer={photo}
                            onClick={() => navigate(`/profile/${photo.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Category;
