import LightButton from './LightButton';
import './Navbar.css';

const menuItems = ['PORTFOLIO', 'EXPERTISE', 'ABOUT'];

function Navbar({ isCompact = false, isScrolled = false }) {
  return (
    <div
      className={`navbar${isCompact ? ' navbar--compact' : ''}${
        isScrolled ? ' navbar--scrolled' : ''
      }`}
    >
      <div className="navbar__left">
        <a className="navbar__logo" href="/" aria-label="blu labs Startseite">
          <span className="navbar__logo-main">blu</span>
          <span className="navbar__logo-accent">::</span>
          <span className="navbar__logo-main">labs</span>
        </a>

        <nav className="navbar__menu-wrap" aria-label="Hauptnavigation">
          <ul className="navbar__menu">
            {menuItems.map((item) => (
              <li key={item}>
                <a className="navbar__link" href="/">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <LightButton
        className="navbar__cta"
        label="JETZT PROTOTYP SICHERN"
        mobileLabel="PROTOTYP SICHERN"
      />
    </div>
  );
}

export default Navbar;
