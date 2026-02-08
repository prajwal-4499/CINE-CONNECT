function PhotographerCard({ photographer, onClick }) {
    return (
        <div className="card" onClick={onClick}>
            <h3>{photographer.name}</h3>
            <p>City: {photographer.city}</p>
            <p className="rating">⭐ {photographer.rating}</p>
            <p>Click to view profile</p>
        </div>
    );
}

export default PhotographerCard;
