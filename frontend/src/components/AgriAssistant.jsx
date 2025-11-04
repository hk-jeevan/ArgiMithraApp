import React, { useEffect, useRef, useState } from "react";
import "./AgriAssistant.css";

const API_URL = "http://localhost:8000";

export default function AgriAssistant() {
  const [lang, setLang] = useState("en"); // "en" | "kn"
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi — I am Agri Assistant 🌾. Ask me anything about farming.",
      time: Date.now(),
    },
  ]);
  const [listening, setListening] = useState(false);
  const [tts, setTts] = useState(true);
  const recognitionRef = useRef(null);

  // --- Voice input (safe & optional) ---
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      recognitionRef.current = null;
      return;
    }
    const r = new SR();
    r.lang = lang === "kn" ? "kn-IN" : "en-IN";
    r.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setInput(spoken);
      sendMessage(spoken);
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    // cleanup (avoid lingering handlers if component unmounts)
    return () => {
      try {
        r.onresult = null;
        r.onend = null;
        r.abort?.();
        r.stop?.();
      } catch {
        // no-op
      }
    };
  }, [lang]);

  // --- Speak helper (optional) ---
  function speak(text) {
    try {
      if (!tts || typeof window === "undefined" || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "kn" ? "kn-IN" : "en-IN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch  {
      // no-op
    }
  }

  // --- Call backend (Gemini 2.0 Flash) ---
  async function askGemini(question) {
    try {
      const res = await fetch(`${API_URL}/assistant/chat`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, lang }),
      });

      if (!res.ok) {
        // try to read error body for clarity
        let detail = "";
        try {
          const e = await res.json();
          detail = e?.detail || "";
        } catch {
          // no-op
        }
        throw new Error(detail || `AI request failed (${res.status})`);
      }

      const data = await res.json();
      return (data?.reply || "").trim();
    } catch (error) {
      console.error("Gemini Fetch Error:", error);
      return ""; // caller will show fallback text
    }
  }

  // --- Send message flow ---
  async function sendMessage(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text) return;

    setInput("");
    setMessages((ms) => [...ms, { from: "user", text, time: Date.now() }]);

    const reply = await askGemini(text);
    const finalReply =
      reply ||
      (lang === "kn"
        ? "AI ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        : "AI couldn’t answer. Please try again.");

    setMessages((ms) => [
      ...ms,
      { from: "bot", text: finalReply, time: Date.now() },
    ]);
    speak(finalReply);
  }

  function onEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  function toggleListening() {
    const r = recognitionRef.current;
    if (!r)
      return alert(
        lang === "kn"
          ? "ಧ್ವನಿ ಬೆಂಬಲ ಲಭ್ಯವಿಲ್ಲ."
          : "Speech not supported on this browser."
      );
    if (listening) {
      try {
        r.stop();
      } catch {
        // no-op
      }
      setListening(false);
    } else {
      try {
        r.start();
        setListening(true);
      } catch {
        // no-op
      }
    }
  }

  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <h2>Agri Assistant 🌾</h2>
        <div className="right-controls">
          <label className="tts-toggle">
            <input
              type="checkbox"
              checked={tts}
              onChange={(e) => setTts(e.target.checked)}
            />
            <span>{lang === "kn" ? "ಉತ್ತರವನ್ನು ಓದಿ" : "Speak answers"}</span>
          </label>
          <div className="lang-switch">
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className={lang === "kn" ? "active" : ""}
              onClick={() => setLang("kn")}
            >
              KN
            </button>
          </div>
        </div>
      </header>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            <div className="bubble">{m.text}</div>
            <div className="time">{new Date(m.time).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <div className="chat-controls">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onEnter}
          placeholder={lang === "kn" ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ..." : "Type your question..."}
        />
        <button
          className={`mic ${listening ? "on" : ""}`}
          onClick={toggleListening}
          title={lang === "kn" ? "ಮಾತನಾಡಿ" : "Speak"}
        >
          {listening ? "🎙️" : "🎤"}
        </button>
        <button className="send" onClick={() => sendMessage()}>
          Send
        </button>
      </div>

      <div className="note">
        {lang === "kn"
          ? "ಸೂಚನೆ: AI ಉತ್ತರಗಳು ಇಂಟರ್ನೆಟ್ ಮೇಲೆ ಅವಲಂಬಿತ."
          : "Tip: AI answers come live from Gemini; keep internet on."}
      </div>
    </div>
  );
}
