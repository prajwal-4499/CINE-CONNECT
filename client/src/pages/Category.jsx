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

    // 🔹 City list (safe fallback)
    const cities = [
        "all",
        ...new Set(
            photographers
                .map((p) => p.city)
                .filter(Boolean)
        ),
    ];

    // 🔹 Filtering logic
    const filteredPhotographers = photographers.filter((p) => {
        const categoryMatch = p.categories?.some(
            (cat) => cat.toLowerCase() === name.toLowerCase()
        );

        const cityMatch =
            selectedCity === "all" || p.city === selectedCity;

        const ratingMatch =
            typeof p.rating === "number" && p.rating >= minRating;

        return categoryMatch && cityMatch && ratingMatch;
    });

    if (loading) {
        return <p>Loading photographers...</p>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Category: {name}</h2>

            {/* CITY FILTER */}
            <label>
                Filter by city:{" "}
                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </label>

            <br /><br />

            {/* RATING FILTER */}
            <label>
                Minimum rating: ⭐ {minRating}
                <br />
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                />
            </label>

            <br /><br />

            {/* PHOTOGRAPHER CARDS */}
            {filteredPhotographers.length === 0 ? (
                <p>No photographers available.</p>
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

