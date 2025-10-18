import logo from "./images/IMG-20251008-WA0008logo0.png";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SplashScreen = ({ companyName, onFinish }) => {
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayText((prev) => prev + companyName[index]);
      index++;
      if (index === companyName.length) {
        clearInterval(typingInterval);
        // remove cursor after a moment
        setTimeout(() => setCursorVisible(false), 300);
        // finish splash after a short delay
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 800);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, [companyName, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <motion.img
        src={logo}
        alt="Company Logo"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
        className="w-32 h-32 mb-4"
      />

      <h1 className="text-3xl font-bold text-gray-800">
        {displayText}
        {cursorVisible && <span className="animate-pulse">|</span>}
      </h1>
    </div>
  );
};

export default SplashScreen;
