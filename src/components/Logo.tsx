import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useCarTrust } from "../context/CarTrustContext";

// Import the verified generated assets directly
import logoDark from "../assets/images/cartrust_logo_dark_1780973881994.png";
import logoLight from "../assets/images/cartrust_logo_light_1780973926683.png";
import logoSquare from "../assets/images/cartrust_app_icon_1780973896172.png";
import logoMonogram from "../assets/images/cartrust_monogram_1780973910489.png";

interface LogoProps {
  variant?: "horizontal" | "square" | "monogram";
  theme?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "horizontal",
  theme = "dark",
  className = "",
  onClick,
}) => {
  const { setCurrentPage } = useCarTrust();
  const [hasError, setHasError] = useState(false);

  const getSource = () => {
    if (variant === "square") {
      return logoSquare;
    }
    if (variant === "monogram") {
      return logoMonogram;
    }
    return theme === "light" ? logoLight : logoDark;
  };

  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to dashboard/home gracefully
      setCurrentPage("landing");
    }
  };

  // Render fallback SVG-based Logo if image fails to load or error is manually forced
  const renderFallback = () => {
    if (variant === "monogram") {
      return (
        <span className="flex items-center gap-1">
          <span className="font-sans font-black text-xl text-blue-400">C</span>
          <span className="font-sans font-black text-xl text-cyan-400">T</span>
        </span>
      );
    }

    if (variant === "square") {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
      );
    }

    // Default horizontal layout fallback
    return (
      <div className="flex items-center gap-2 font-sans">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.4)]">
          <ShieldCheck className="w-4.5 h-4.5 text-white" />
        </div>
        <span className={`font-sans font-bold text-lg tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
          CarTrust<span className="text-blue-500">AI</span>
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={handleLogoClick}
      className={`transition-all duration-300 hover:opacity-95 active:scale-95 select-none ${
        onClick || !onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {hasError ? (
        renderFallback()
      ) : (
        <div className="relative flex items-center justify-center">
          <img
            src={getSource()}
            alt="CarTrust AI Logo"
            onError={() => {
              console.warn(
                `[LOGO ERROR] Failed to load logo variant "${variant}" (${theme} theme). Activating fallback SVG.`
              );
              setHasError(true);
            }}
            loading="lazy"
            className={`object-contain max-w-full h-auto transition-all ${
              variant === "horizontal"
                ? "h-8 md:h-9"
                : variant === "square"
                ? "w-10 h-10 md:w-11 md:h-11 rounded-xl"
                : "w-8 h-8 md:w-9 md:h-9 rounded-lg"
            } ${
              theme === "dark" && variant !== "square"
                ? "drop-shadow-[0_0_12px_rgba(0,191,255,0.25)]"
                : ""
            }`}
          />
        </div>
      )}
    </div>
  );
};
