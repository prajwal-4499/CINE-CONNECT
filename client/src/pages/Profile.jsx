import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function Profile() {
    const { id } = useParams();
    const [photographer, setPhotographer] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (!photographer) {
        return <p>Photographer not found.</p>;
    }

    return (
        <div className="profile">
            {/* HEADER */}
            <div className="profile-header">
                <h2>{photographer.name}</h2>
                <p>City: {photographer.city}</p>
                <p>Rating: ⭐ {photographer.rating}</p>
                <p>Categories: {photographer.categories?.join(", ")}</p>
            </div>

            {/* PORTFOLIO */}
            <h3>Portfolio</h3>

            {photographer.portfolio && photographer.portfolio.length > 0 ? (
                <div className="portfolio-grid">
                    {photographer.portfolio.map((img, index) => (
                        <img key={index} src={img} alt="Portfolio" />
                    ))}
                </div>
            ) : (
                <p>No portfolio images available.</p>
            )}

            <br />
            <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                {/* EMAIL */}
                <a
                    href={`mailto:${photographer.email}?subject=Photography Inquiry`}
                >
                    <button>Email</button>
                </a>

                {/* WHATSAPP */}
                {photographer.phone && (
                    <a
                        href={`https://wa.me/${photographer.phone}?text=Hi%20I%20found%20your%20profile%20on%20Photographer%20Platform`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <button>WhatsApp</button>
                    </a>
                )}
            </div>

        </div>
    );
}

export default Profile;
