import { useTheme } from "../Context/ThemeContext";

const accentColorMap = {
  blue: "rgba(0, 123, 255, 0.3)",    // strand lighter
  purple: "rgba(128, 0, 128, 0.3)",
  green: "rgba(0, 200, 83, 0.3)",
  yellow: "rgba(255, 193, 7, 0.3)",
  red: "rgba(220, 53, 69, 0.3)",
  orange: "rgba(255, 140, 0, 0.3)"
};

const dotColorMap = {
  blue: "rgba(0, 123, 255, 0.8)",    // dot darker
  purple: "rgba(128, 0, 128, 0.8)",
  green: "rgba(0, 200, 83, 0.8)",
  yellow: "rgba(255, 193, 7, 0.8)",
  red: "rgba(220, 53, 69, 0.8)",
  orange: "rgba(255, 140, 0, 0.8)"
};

const DNAAnimation = () => {
  const { color } = useTheme(); // ✅ get global accent color

  const strandColor = accentColorMap[color] || "rgba(0,0,0,0.3)";
  const dotColor = dotColorMap[color] || "rgba(0,0,0,0.8)";

  return (
    <svg
      className="dna-svg"
      viewBox="0 0 1000 200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Left Strand */}
      <path
        d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100 T500,100 T600,100 T700,100 T800,100 T900,100 T1000,100"
        stroke={strandColor}
        strokeWidth="3"
        strokeDasharray="6,6"
        fill="transparent"
      />

      {/* Right Strand */}
      <path
        d="M0,100 Q50,150 100,100 T200,100 T300,100 T400,100 T500,100 T600,100 T700,100 T800,100 T900,100 T1000,100"
        stroke={strandColor}
        strokeWidth="3"
        strokeDasharray="6,6"
        fill="transparent"
      />

      {/* Connecting Bars */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = i * 25 + 25;
        const yOffset = i % 2 === 0 ? 20 : -20;
        return (
          <line
            key={i}
            x1={x}
            y1={100 - yOffset}
            x2={x}
            y2={100 + yOffset}
            stroke={strandColor}
            strokeWidth="2"
          />
        );
      })}

      {/* Glowing Dots */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (i * 20) % 1000;
        const y = 100 + Math.sin(i / 2) * 40;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={Math.random() * 2 + 1}
            fill={dotColor} // ✅ always matches theme color
          />
        );
      })}
    </svg>
  );
};

export default DNAAnimation;
