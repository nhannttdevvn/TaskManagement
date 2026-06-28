module.exports = {
  darkMode: "class",
  content: [
    "./frontend/templates/**/*.html",
    "./frontend/static/js/**/*.js",
    "./backend/apps/tasks/**/*.py"
  ],
  safelist: [
    "hidden",
    "grid",
    "flex",
    "translate-x-0",
    "-translate-x-full",
    "opacity-0",
    "opacity-100",
    "scale-95",
    "scale-100",
    "translate-y-0",
    "bg-gradient-to-br",
    "from-cyan-400",
    "to-blue-600",
    "from-violet-500",
    "to-fuchsia-500",
    "from-emerald-500",
    "to-green-500",
    "from-amber-500",
    "to-rose-500",
    "from-cyan-500",
    "to-violet-500",
    "from-violet-600",
    "to-cyan-400",
    "bg-cyan-400/15",
    "text-cyan-200",
    "bg-emerald-400/15",
    "text-emerald-200",
    "bg-amber-400/15",
    "text-amber-200",
    "bg-rose-400/15",
    "text-rose-200",
    "bg-violet-400/15",
    "text-violet-200",
    "bg-slate-400/15",
    "text-slate-200",
    "bg-blue-400",
    "bg-violet-400",
    "bg-emerald-400",
    "bg-fuchsia-400/15",
    "text-fuchsia-200",
    "bg-sky-200",
    "bg-violet-200",
    "bg-rose-200",
    "bg-emerald-200",
    "border-sky-300",
    "border-violet-300",
    "border-rose-300",
    "border-emerald-300"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#7C4DFF",
          secondary: "#4F9CF9",
          accent: "#22D3EE",
          surface: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 16px 44px rgba(15, 23, 42, 0.26)",
        glow: "0 18px 44px rgba(37, 99, 235, 0.28)",
        soft: "0 20px 70px rgba(2, 6, 23, 0.32)"
      },
      keyframes: {
        shimmer: {
          "100%": { backgroundPosition: "-220% 0" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" }
        },
        modalIn: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.25s ease-in-out infinite",
        pulseLine: "pulseLine 1.8s ease-in-out infinite",
        modalIn: "modalIn 180ms ease both"
      }
    }
  }
};
