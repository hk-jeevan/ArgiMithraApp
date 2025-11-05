import React, { useEffect, useRef, useState } from "react";
import "./AgriAssistant.css";

const API_URL = "http://localhost:8000";

export default function AgriAssistant() {
  const [lang, setLang] = useState("en");
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
  const [voices, setVoices] = useState([]);

  // ✅ Load Speech voices
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => (window.speechSynthesis.onvoiceschanged = null);
  }, []);

  const cleanForSpeech = (text = "") => {
    let t = text
      .replace(/^#+\s*/gm, "")
      .replace(/^\s*[-*•]\s+/gm, "");
    ["*", "#", "•", "–", "-", "—", "▶️", "▶", "►", "➤"].forEach(
      (ch) => (t = t.split(ch).join(""))
    );
    return t.replace(/\n{2,}/g, ". ").replace(/\n/g, ". ").trim();
  };

  const formatForUI = (txt = "") =>
    txt
      .replace(/\r/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/^\s*[-*•]\s+/gm, "• ")
      .replace(/\n/g, "<br>");

  // ✅ Setup Speech Recognition
  useEffect(() => {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SR) {
      recognitionRef.current = null;
      return;
    }
    const r = new SR();
    r.maxAlternatives = 1; // ✅ Edge needs this to return results

    r.continuous = false;
    r.interimResults = false;

    r.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setInput(spoken); // Show input first ✅
      setTimeout(() => sendMessage(spoken), 600); // Auto-send ✅
    };
    r.onend = () => setListening(false);

    recognitionRef.current = r;

    return () => {
      r.abort?.();
      r.stop?.();
    };
  }, []);

  // ✅ Speak Response
  const speak = (text) => {
    if (!tts || !window.speechSynthesis) return;
    const clean = cleanForSpeech(text);
    if (!clean) return;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = lang === "kn" ? "kn-IN" : "en-IN";

    const voice =
      (lang === "kn" && voices.find((v) => /kn/i.test(v.lang))) ||
      voices.find((v) => /en-IN/i.test(v.lang)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (voice) utter.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // ✅ Backend Call
  async function askGemini(question) {
    try {
      const res = await fetch(`${API_URL}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, lang }),
      });
      const data = await res.json();
      return cleanForSpeech(data?.reply || "");
    } catch {
      return "";
    }
  }

  // ✅ Send Chat Flow
  async function sendMessage(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text) return;

    setInput("");
    setMessages((m) => [...m, { from: "user", text, time: Date.now() }]);

    const reply = await askGemini(text);
    const finalReply =
      reply ||
      (lang === "kn"
        ? "AI ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        : "AI couldn’t answer. Please try again.");

    const formattedReply = formatForUI(finalReply);

    setMessages((m) => [
      ...m,
      { from: "bot", text: formattedReply, time: Date.now() },
    ]);

    speak(finalReply);
  }

  // ✅ Toggle Voice Input
  function toggleListening() {
    const r = recognitionRef.current;
    if (!r)
      return alert(
        lang === "kn" ? "ಧ್ವನಿ ಬೆಂಬಲ ಲಭ್ಯವಿಲ್ಲ" : "Speech not supported"
      );

    window.speechSynthesis.cancel(); // 🔥 REQUIRED FIX

    r.lang = lang === "kn" ? "kn-IN" : "en-IN"; // ✅ always set language here

    if (listening) {
      r.stop();
      setListening(false);
    } else {
      r.start();
      setListening(true);
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
            <div
              className="bubble"
              dangerouslySetInnerHTML={{ __html: formatForUI(m.text) }}
            ></div>
            <div className="time">{new Date(m.time).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <div className="chat-controls">
        <input
          value={input}
          placeholder={
            lang === "kn" ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ..." : "Ask your question..."
          }
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className={`mic ${listening ? "on" : ""}`}
          onClick={toggleListening}
        >
          🎤
        </button>
        <button className="send" onClick={() => sendMessage()}>
          ➤
        </button>
      </div>

      <div className="note">
        {lang === "kn"
          ? "ಸೂಚನೆ: ಉತ್ತರಗಳು Gemini AI ಬಳಸಿ ಬರುತ್ತವೆ"
          : "Tip: Answers from Gemini AI"}
      </div>
    </div>
  );
}
