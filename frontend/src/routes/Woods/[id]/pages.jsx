import { useParams, Link } from "react-router-dom";
import CardData from "../../../sampleData/cardData";

const WoodDetails = () => {
  const { id } = useParams();
  const wood = CardData.find((item) => String(item.id) === id);

  if (!wood) {
    return (
      <div className="wood-detail-empty">
        <h2>Wood not found</h2>
        <Link to="/woods" className="btn btn-primary">
          Back to Woods
        </Link>
      </div>
    );
  }

  return (
    <section className="wood-detail">
      <div className="wood-detail-image">
        <img src={wood.image} alt={wood.title} />
      </div>
      <div className="wood-detail-content">
        <span className="category">{wood.category}</span>
        <h1>{wood.title}</h1>
        <p>{wood.description}</p>
        <h3 className="wood-detail-price">{wood.price}</h3>
        <Link to="/contact" className="btn btn-primary">
          Enquire About This Wood
        </Link>
      </div>
    </section>
  );
};

export default WoodDetails;
