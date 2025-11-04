import React, { useEffect, useState } from 'react';
import './HomeWidgets.css';

export default function HomeWidgets() {
  const [news, setNews] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [language, setLanguage] = useState('en');

  const t = {
    en: { latestNews: "Latest Agriculture News", govtSchemes: "Government Schemes", read: "Read More →", loading: "Loading..." },
    hi: { latestNews: "नवीनतम कृषि समाचार", govtSchemes: "सरकारी योजनाएँ", read: "पढ़ें →", loading: "लोड हो रहा है..." },
    kn: { latestNews: "ಇತ್ತೀಚಿನ ಕೃಷಿ ಸುದ್ದಿ", govtSchemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", read: "ಓದಿ →", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const newsUrl = import.meta.env.VITE_NEWS_API_URL;
        const schemesUrl = import.meta.env.VITE_SCHEMES_API_URL;

        const r = await fetch(newsUrl);
        const j = await r.json();
        setNews(j.articles || []);

        const r2 = await fetch(schemesUrl);
        const j2 = await r2.json();
        setSchemes(j2.articles || []);

      } catch  {
        setError("Unable to load content");
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section className="home-widgets">

      {/* Language Switch */}
      <div className="language-selector">
        <span>🌐</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
      </div>

      {/* NEWS Section */}
      <h3 className="section-title">{t[language].latestNews}</h3>
      {loading && <div className="loading">{t[language].loading}</div>}
      {error && <div className="error">{error}</div>}

      <div className="carousel-container">
        {news.slice(0, 15).map((item, i) => (
          <div className="carousel-card" key={i}>
            {item.urlToImage && <img src={item.urlToImage} alt="news" />}
            <h4>{item.title}</h4>
            <p>{item.description?.slice(0, 90)}{item.description?.length > 90 && "..."}</p>
            <a href={item.url} target="_blank" rel="noreferrer">
              {t[language].read}
            </a>
          </div>
        ))}
      </div>

      {/* Schemes Section */}
      <h3 className="section-title">{t[language].govtSchemes}</h3>
      <div className="carousel-container">
        {schemes.slice(0, 15).map((s, i) => (
          <div className="carousel-card scheme" key={i}>
            <h4>{s.title || s.name}</h4>
            <p>{s.description?.slice(0, 90)}{s.description?.length > 90 && "..."}</p>
            <a href={s.url || s.link} target="_blank" rel="noreferrer">
              {t[language].read}
            </a>
          </div>
        ))}
      </div>

    </section>
  );
}
