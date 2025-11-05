import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Array of creative loading messages
  const loadingMessages = [
    "Gears are spinning and code elves are still typing away.",
    "Your app's in the workshop—hammering and welding features.",
    "Seeds planted, watering daily—your app's growing.",
    "The orchestra's rehearsing—your app's score is being written.",
    "We're sprinting through code and hurdling over bugs as we build.",
    "Your app's training hard in the gym, getting stronger each day.",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setIsVisible(false);

      // After fade out completes, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setIsVisible(true);
      }, 500); // 500ms for fade out
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  // Redirect logic
  useEffect(() => {
    // This page acts as a splash screen and then redirects
    const redirectTimer = setTimeout(() => {
      if (isLoggedIn) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 2000); // Show splash screen for 2 seconds before redirecting

    return () => clearTimeout(redirectTimer);
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Spinning Gear Icon */}
      <div className="mb-8">
        <Settings
          className="w-16 h-16 text-gray-400 animate-spin"
          style={{ animationDuration: "3s" }}
        />
      </div>

      {/* Main Text with Fade Animation */}
      <h1
        className={`text-xl font-medium text-gray-300 text-center max-w-md transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {loadingMessages[currentMessageIndex]}
      </h1>
    </div>
  );
};

export default Index;