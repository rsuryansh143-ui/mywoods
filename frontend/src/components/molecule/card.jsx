import { Link } from "react-router-dom";

function Card({ item }) {
  return (
    <div className="card">
      <img src={item.image} alt={item.title} className="card-image" />

      <div className="card-content">
        <span className="category">{item.category}</span>

        <h2>{item.title}</h2>

        <p>{item.description}</p>

        <div className="card-footer">
          <h3>{item.price}</h3>
          <Link to={`/woods/${item.id}`} className="btn-card">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Card;
