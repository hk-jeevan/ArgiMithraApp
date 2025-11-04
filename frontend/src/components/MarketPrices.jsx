import React, { useState, useEffect } from "react";
import "./MarketPrices.css";

export default function MarketPrices() {
  const [crop, setCrop] = useState("");
  const [stateName, setStateName] = useState("");

  const [todayPrices, setTodayPrices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const resourceId = import.meta.env.VITE_MARKET_RESOURCE_ID;
  const apiKey = import.meta.env.VITE_MARKET_API_KEY;
  const baseUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=500`;

  // ✅ Load All Latest Updated Market Prices (No Limit)
  const loadTodayPrices = async () => {
    try {
      const res = await fetch(baseUrl);
      const data = await res.json();
      if (!data.records) return;

      const sorted = data.records.sort(
        (a, b) => new Date(b.arrival_date) - new Date(a.arrival_date)
      );

      setTodayPrices(sorted); // ✅ Show ALL data
    } catch (err) {
      console.log("Error loading today prices:", err);
    }
  };

  useEffect(() => {
    loadTodayPrices();
  }, []);

  // ✅ SEARCH — Only Exact Crop + State Results
  const fetchMarketData = async () => {
    if (!crop || !stateName) {
      setSearchError("Enter both Crop & State!");
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setSearchError(null);

    try {
      const filters = {
        commodity: crop.toUpperCase(),
        state: stateName.toUpperCase(),
      };

      const url = baseUrl + "&filters=" + JSON.stringify(filters);

      const res = await fetch(url);
      const data = await res.json();

      if (!data.records || data.records.length === 0) {
        throw new Error("No data found for this crop in this state!");
      }

      const sorted = data.records.sort(
        (a, b) => new Date(b.arrival_date) - new Date(a.arrival_date)
      );

      // ✅ Hard filter to strictly match
      const filtered = sorted.filter(
        (item) =>
          item.commodity.toUpperCase() === crop.toUpperCase() &&
          item.state.toUpperCase() === stateName.toUpperCase()
      );

      if (filtered.length === 0)
        throw new Error("No exact match found!");

      setSearchResults(filtered);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (item, i) => (
    <div key={i} className="market-card">
      <img
        className="crop-icon"
        src={`https://img.icons8.com/color/96/${item.commodity.toLowerCase().replace(/\s+/g, "")}.png`}
        alt=""
        onError={(e) => (e.target.style.display = "none")}
      />
      <div>
        <h3>{item.commodity}</h3>
        <p><strong>State:</strong> {item.state}</p>
        <p><strong>Market:</strong> {item.market}</p>
        <p><strong>Price:</strong> ₹{item.modal_price}/quintal</p>
        <p><strong>Date:</strong> {item.arrival_date}</p>
      </div>
    </div>
  );

  return (
    <div className="market-container">

      {/* ✅ Today Updated Market Prices */}
      <div className="today-box">
        <h2>📅 Today Updated Market Prices</h2>
        <div className="scroll-box">
          {todayPrices.map(renderCard)}
        </div>
      </div>

      {/* ✅ Search Section */}
      <div className="search-box">
        <h2>🔍 Search Crop & State</h2>

        <div className="market-form">
          <input
            placeholder="Crop (ex: RICE)"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          />
          <input
            placeholder="State (ex: KARNATAKA)"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />
          <button onClick={fetchMarketData} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {searchError && <p className="error">❌ {searchError}</p>}

        <div className="market-results">
          {searchResults.map(renderCard)}
        </div>
      </div>

    </div>
  );
}
