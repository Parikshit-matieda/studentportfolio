import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

/* ─── Data passed as props to components ─── */
const studentName = "Parikshit Matieda";
const studentTitle = "Computer Science Student & Aspiring AI/ML Engineer";

const skillsData = [
  {
    name: "Python",
    level: 90,
    category: "Core AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#3776AB">
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
      </svg>
    ),
  },
  {
    name: "PyTorch",
    level: 80,
    category: "Core AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#EE4C2C">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.23 3.32 9.69 7.97 11.33c-.02-.24-.04-.61-.04-.95c0-1.63.03-3.26.03-4.89c-3.1.53-3.92-1.27-3.92-1.27c-.42-1.06-.99-1.34-.99-1.34c-.87-.6.07-.59.07-.59c.96.07 1.47.99 1.47.99c.85 1.46 2.24 1.04 2.78.79c.09-.62.34-1.04.62-1.28c-2.47-.28-5.08-1.24-5.08-5.51c0-1.22.43-2.21 1.15-2.99c-.11-.28-.5-1.42.11-2.95c0 0 .94-.3 3.07 1.14c.89-.25 1.85-.37 2.81-.38c.96 0 1.92.13 2.81.38c2.13-1.44 3.07-1.14 3.07-1.14c.61 1.53.22 2.67.11 2.95c.72.78 1.15 1.77 1.15 2.99c0 4.28-2.61 5.23-5.09 5.5c.4.34.76 1.02.76 2.06c0 1.49-.01 2.69-.01 3.06c0 .34-.02.72-.04.96c4.65-1.64 7.97-6.1 7.97-11.33c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    name: "TensorFlow",
    level: 75,
    category: "Core AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF6F00">
        <path d="M1.5 6.27L12 0l10.5 6.27V17.7L12 24L1.5 17.7V6.27zm10.5 2.82l6.75-4.03l-6.75-4.03l-6.75 4.03l6.75 4.03zm5.25 7.11V10.2L12 12.6l-5.25-2.4v6.002L12 18.6l5.25-2.4z"/>
      </svg>
    ),
  },
  {
    name: "Scikit-Learn",
    level: 82,
    category: "Core AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#3499CD">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#3499CD" strokeWidth="2"/>
        <path d="M12 2a10 10 0 0110 10" fill="none" stroke="#F7931E" strokeWidth="3"/>
        <circle cx="12" cy="12" r="3" fill="#F7931E"/>
      </svg>
    ),
  },
  {
    name: "OpenAI API",
    level: 78,
    category: "Generative AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5-1.2-2.5-3-2.5-5 0-3.9 3.1-7 7-7 2 0 3.8 1 5 2.5m5.5 6c1.5 1.2 2.5 3 2.5 5 0 3.9-3.1 7-7 7-2 0-3.8-1-5-2.5m0-11c-1.2-1.5-3-2.5-5-2.5-3.9 0-7 3.1-7 7 0 2 1 3.8 2.5 5m11-5.5c1.2 1.5 3 2.5 5 2.5 3.9 0 7-3.1 7-7 0-2-1-3.8-2.5-5" />
      </svg>
    ),
  },
  {
    name: "Hugging Face",
    level: 75,
    category: "Generative AI",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFD21E">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm1 14.5a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 1 0v1zm-1-3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.5-1.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
      </svg>
    ),
  },
  {
    name: "NumPy",
    level: 85,
    category: "Data Engineering",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#013243">
        <path d="M10.315 4.876L6.3048 2.8517l-4.401 2.1965 4.1186 2.0683zm1.8381.9277l4.2045 2.1223-4.3622 2.1906-4.125-2.0718zm5.6153-2.9213l4.3193 2.1658-3.863 1.9402-4.2131-2.1252zm-1.859-.9329L12.021 0 8.1742 1.9193l4.0068 2.0208zm-3.0401 16.7443V24l4.7107-2.3507-.0053-5.3085zm4.7037-4.2057l-.0052-5.2528-4.6985 2.3356v5.2546zm5.6553-.9845v5.327l-4.0178 2.0052-.0029-5.3028zm0-1.8626V6.4214l-4.0253 2.001.0034 5.2633zM11.2062 11.571L8.0333 9.9756v6.895s-3.8804-8.2564-4.2399-8.998c-.0463-.0957-.2371-.2007-.2858-.2262C2.8118 7.2812.773 6.2485.773 6.2485V18.43l2.8204 1.5076v-6.3674s3.8392 7.3775 3.878 7.458c.0389.0807.4245.8582.8362 1.1314.5485.363 2.8992 1.7766 2.8992 1.7766z"/>
      </svg>
    ),
  },
  {
    name: "Pandas",
    level: 83,
    category: "Data Engineering",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#150458">
        <path d="M16.922 0h2.623v18.104h-2.623zm-4.126 12.94h2.623v2.57h-2.623zm0-7.037h2.623v5.446h-2.623zm0 11.197h2.623v5.446h-2.623zM4.456 5.896h2.622V24H4.455zm4.213 2.559h2.623v2.57H8.67zm0 4.151h2.623v5.447H8.67zm0-11.187h2.623v5.446H8.67Z"/>
      </svg>
    ),
  },
  {
    name: "Matplotlib & Seaborn",
    level: 80,
    category: "Data Engineering",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#11557c">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#11557c" strokeWidth="1.5"/>
        <path d="M12 2a10 10 0 0110 10" fill="none" stroke="#e3342f" strokeWidth="2"/>
        <path d="M12 2a10 10 0 00-10 10" fill="none" stroke="#3490dc" strokeWidth="2"/>
        <path d="M22 12a10 10 0 01-10 10" fill="none" stroke="#38c172" strokeWidth="2"/>
        <path d="M2 12a10 10 0 0010 10" fill="none" stroke="#f6993f" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="#11557c"/>
      </svg>
    ),
  },
  {
    name: "SQL & PostgreSQL",
    level: 78,
    category: "Data Engineering",
    icon: <PostgresLogo />,
  },
  {
    name: "Git & GitHub",
    level: 82,
    category: "Tools & DevOps",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
];

const projectsData = [
  {
    title: "GAN Image Synthesizer",
    description: "A PyTorch implementation of deep convolutional Generative Adversarial Networks (GANs). Trained on custom imagery datasets to synthesize high-resolution artificial representations.",
    tech: ["Python", "PyTorch", "NumPy", "Matplotlib", "Docker"],
    githubLink: "https://github.com/Parikshit-matieda",
    demoLink: "#"
  },
  {
    title: "Semantic Search Engine (RAG)",
    description: "A Retrieval-Augmented Generation (RAG) system utilizing OpenAI embeddings, Hugging Face transformers, and a vector database for context-aware Q&A on private documentation.",
    tech: ["Python", "OpenAI API", "Hugging Face", "PostgreSQL", "Git"],
    githubLink: "https://github.com/Parikshit-matieda",
    demoLink: "#"
  },
  {
    title: "Predictive IoT Failure Analytics",
    description: "An end-to-end Machine Learning pipeline utilizing Scikit-Learn to preprocess telemetry data, train failure prediction models, and deploy endpoints via FastAPI.",
    tech: ["Scikit-Learn", "FastAPI", "Pandas", "NumPy", "Git"],
    githubLink: "https://github.com/Parikshit-matieda",
    demoLink: "#"
  }
];

const contactEmail = "24it049@charusat.edu.in";

const socialLinksData = [
  {
    name: "GitHub",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
    url: "https://github.com/Parikshit-matieda",
  },
  {
    name: "LinkedIn",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    url: "https://linkedin.com/in/parikshit-matieda",
  },
  {
    name: "X",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    url: "https://x.com",
  },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY || window.pageYOffset;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="app">
        {/* Scroll Progress Bar */}
        <div 
          className="scroll-progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        ></div>

        {/* Props: name, theme, toggleTheme */}
        <Header 
          name={studentName} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Home name={studentName} title={studentTitle} skills={skillsData} />} 
            />
            <Route 
              path="/projects" 
              element={<Projects projects={projectsData} />} 
            />
            <Route 
              path="/contact" 
              element={<Contact email={contactEmail} />} 
            />
          </Routes>
        </main>

        {/* Props: email, socialLinks */}
        <Footer email={contactEmail} socialLinks={socialLinksData} />
      </div>
    </HashRouter>
  );
}

export default App;
