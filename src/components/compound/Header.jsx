
// import { useNavigate } from "react-router-dom";

function Header() {
  //  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear()
    window.location.reload(true);
    // navigate("/login")
  }
  return (
    <header className="header">
      <div className="logo">
        <h2>Mywoods</h2>
      </div>

      <nav>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/woods">Woods</a></li>
          <li><a href="/contact">Contact</a></li>

          {localStorage.getItem('token') ? <li><a href="/cms">CMS</a></li> : <li><a href="/login">Login</a></li>}


        </ul>
      </nav>
      {localStorage.getItem('token') ? <button className="btn" onClick={() => handleLogout()}>Logout</button> : ""}

    </header>
  );
}

export default Header;