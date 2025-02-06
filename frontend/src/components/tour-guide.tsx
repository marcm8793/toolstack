"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const TourGuide = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tourDone = localStorage.getItem("chatTourDone");
    if (!tourDone) {
      // Show the tour guide for first-time visitors
      setVisible(true);
    }

    // Listen for the custom event to dismiss the tour guide (e.g. when the chat icon is clicked)
    const handleDismissEvent = () => {
      localStorage.setItem("chatTourDone", "true");
      setVisible(false);
    };

    window.addEventListener("dismissTourGuide", handleDismissEvent);
    return () => {
      window.removeEventListener("dismissTourGuide", handleDismissEvent);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("chatTourDone", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 right-6 z-50 flex flex-col items-end">
      {/* Animated speech bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-indigo-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <span className="text-sm">
          Need help? Click the chat icon below to chat with our AI assistant!
        </span>
        <Button size="sm" onClick={handleDismiss}>
          Got it
        </Button>
      </motion.div>

      {/* Animated arrow linking speech bubble to chat icon */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
        className="mt-1"
      >
        <svg
          className="w-8 h-4 text-indigo-600 animate-bounce"
          viewBox="0 0 20 12"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0 L10 12 L20 0" />
        </svg>
      </motion.div>
    </div>
  );
};

export default TourGuide;
