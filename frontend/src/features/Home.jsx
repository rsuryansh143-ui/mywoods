import { Link } from "react-router-dom";
import Card from "../components/molecule/card";
import heroImg from "../assets/hero.png";

const HomeDetail = ({ data = [] }) => {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">Sustainably Sourced</span>
          <h1>
            Premium Timber, <span>Naturally Beautiful</span>
          </h1>
          <p>
            From rich hardwoods to renewable bamboo, MyWoods supplies
            responsibly harvested timber for furniture makers, builders and
            craftsmen across India.
          </p>
          <div className="hero-actions">
            <Link to="/woods" className="btn btn-primary">
              Browse Our Woods
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Get a Quote
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImg} alt="Freshly cut timber" />
        </div>
      </section>

      <section className="home-grid-section">
        <div className="section-heading">
          <span className="about-tag">Featured Woods</span>
          <h2>Popular Species in Stock</h2>
        </div>

        <div className="cardsClass">
          {data.slice(0, 3).map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomeDetail;
