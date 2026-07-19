import './About.css';

function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <div className="section-label">
          <span className="label-dot"></span>
          About Me
        </div>
        <h2 className="section-heading">
          Passionate about building<br />
          <span className="heading-accent">digital experiences</span>
        </h2>

        <div className="about-content">
          <div className="about-text">
            <p>
              I'm a Computer Science student with a deep passion for creating elegant,
              user-friendly applications. Currently focused on full-stack web development,
              I love turning complex problems into simple, beautiful designs.
            </p>
            <p>
              When I'm not coding, you'll find me exploring open-source projects,
              participating in hackathons, or diving into the latest tech trends.
              I believe in continuous learning and building things that make a difference.
            </p>
          </div>

          <div className="about-stats">
            <div className="stat-card">
              <span className="stat-number">3</span>
              <span className="stat-label">Projects Built</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">3+</span>
              <span className="stat-label">Hackathons</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">5+</span>
              <span className="stat-label">Technologies</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">2+</span>
              <span className="stat-label">Years Coding</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
