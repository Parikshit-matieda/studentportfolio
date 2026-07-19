import './Footer.css';

function Footer({ email, socialLinks }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Portfolio</span>
          </div>
          <p className="footer-tagline">
            Let's build something amazing together.
          </p>
        </div>

        <div className="footer-contact">
          <h3 className="footer-heading">Get In Touch</h3>
          <a href={`mailto:${email}`} className="footer-email" id="contact-email">
            {email}
          </a>
          <div className="footer-socials" id="social-links">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} All rights reserved. Built with React & Vite.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
