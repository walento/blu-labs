import HeroSection from './HeroSection';
import SiteHeader from './SiteHeader';
import './PageShell.css';

function PageShell() {
  return (
    <main className="page-shell" data-page="onepage-root">
      <div className="page-shell__canvas">
        <div className="page-shell__preview">
          <SiteHeader />
          <HeroSection />
          <section className="page-shell__test-section" aria-label="Test Section" />
        </div>
      </div>
    </main>
  );
}

export default PageShell;
