function PhotographerCard({ photographer, onClick }) {
    const coverImage = photographer.portfolio && photographer.portfolio.length > 0 
        ? photographer.portfolio[0] 
        : null;

    return (
        <div className="photographer-card" onClick={onClick}>
            <div className="card-image-container">
                {coverImage ? (
                    <img src={coverImage} alt={photographer.name} className="card-cover-image" />
                ) : (
                    <div className="card-placeholder-image">
                        <span className="placeholder-icon">📷</span>
                        <p className="placeholder-text">No Portfolio Yet</p>
                    </div>
                )}
                {photographer.rating && (
                    <div className="card-rating-badge">
                        ⭐ {Number(photographer.rating).toFixed(1)}
                    </div>
                )}
            </div>
            
            <div className="card-content">
                <h3 className="card-name">{photographer.name || "Unnamed Studio"}</h3>
                <p className="card-city">
                    <span className="location-pin">📍</span> {photographer.city || "Unknown City"}
                </p>
                
                {photographer.categories && photographer.categories.length > 0 && (
                    <div className="card-tags">
                        {photographer.categories.slice(0, 3).map((cat, index) => (
                            <span key={index} className="card-tag">{cat}</span>
                        ))}
                    </div>
                )}
                
                <div className="card-footer">
                    <span className="view-profile-link">View Portfolio →</span>
                </div>
            </div>
        </div>
    );
}

export default PhotographerCard;
