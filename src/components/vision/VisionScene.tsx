import type { VisionState } from '../../types';

export function VisionScene({ vision }: { vision: VisionState }) {
  const { personDetected, handsDetected, waterFlow } = vision;

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#050a0f] aspect-video">
      <svg viewBox="0 0 640 360" className="w-full h-full">
        <defs>
          <linearGradient id="camBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1520" />
            <stop offset="100%" stopColor="#05080c" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="counterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        <rect width="640" height="360" fill="url(#camBg)" />

        {/* wall tiles */}
        <g opacity="0.15" stroke="#22d3ee" strokeWidth="1">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 42} y1="0" x2={i * 42} y2="220" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 42} x2="640" y2={i * 42} />
          ))}
        </g>

        {/* counter */}
        <rect x="0" y="220" width="640" height="140" fill="url(#counterGrad)" />
        <rect x="0" y="220" width="640" height="6" fill="#334155" />

        {/* sink basin */}
        <ellipse cx="320" cy="248" rx="130" ry="26" fill="#0b1220" stroke="#334155" strokeWidth="2" />
        <ellipse cx="320" cy="250" rx="118" ry="20" fill="#060b12" />

        {/* faucet */}
        <rect x="308" y="150" width="14" height="60" rx="6" fill="#94a3b8" />
        <path d="M 308 158 Q 260 158 260 195 L 260 205" stroke="#94a3b8" strokeWidth="13" fill="none" strokeLinecap="round" />
        <circle cx="260" cy="205" r="7" fill="#64748b" />

        {/* water stream */}
        {waterFlow && (
          <g>
            <rect x="255" y="205" width="10" height="42" fill="url(#waterGrad)" className="flow-line" opacity="0.9" />
            <rect x="255" y="205" width="10" height="42" fill="url(#waterGrad)" opacity="0.5">
              <animate attributeName="height" values="42;46;42" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <ellipse cx="260" cy="248" rx="16" ry="4" fill="#67e8f9" opacity="0.5">
              <animate attributeName="rx" values="12;18;12" dur="0.8s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* person */}
        {personDetected && (
          <g>
            <circle cx="400" cy="120" r="26" fill="#334155" stroke="#475569" strokeWidth="2" />
            <path d="M 355 220 Q 400 155 445 220 L 445 240 Q 400 200 355 240 Z" fill="#334155" stroke="#475569" strokeWidth="2" />
            {handsDetected && (
              <g>
                <ellipse cx="272" cy="222" rx="16" ry="10" fill="#cbd5e1" opacity="0.9" />
                <ellipse cx="248" cy="222" rx="16" ry="10" fill="#cbd5e1" opacity="0.9" />
              </g>
            )}
          </g>
        )}

        {/* detection overlay boxes */}
        {personDetected && (
          <g stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.85">
            <rect x="352" y="88" width="96" height="155" rx="4" />
            <text x="352" y="80" fill="#22d3ee" fontSize="11" fontFamily="monospace">ЧЕЛОВЕК 0.97</text>
          </g>
        )}
        {handsDetected && (
          <g stroke="#34d399" strokeWidth="1.5" fill="none" opacity="0.85">
            <rect x="232" y="206" width="56" height="32" rx="4" />
            <text x="232" y="200" fill="#34d399" fontSize="11" fontFamily="monospace">РУКИ 0.93</text>
          </g>
        )}
        {waterFlow && (
          <g stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.85">
            <rect x="246" y="200" width="30" height="55" rx="4" />
            <text x="246" y="194" fill="#f59e0b" fontSize="11" fontFamily="monospace">ПОТОК</text>
          </g>
        )}

        {/* camera HUD chrome */}
        <text x="12" y="24" fill="#67e8f9" fontSize="12" fontFamily="monospace" opacity="0.8">CAM-01 · РАКОВИНА-A · СТОЛОВАЯ</text>
        <text x="628" y="24" fill="#67e8f9" fontSize="12" fontFamily="monospace" opacity="0.8" textAnchor="end">● ЗАПИСЬ</text>
        <text x="12" y="348" fill="#67e8f9" fontSize="11" fontFamily="monospace" opacity="0.6">ЛОКАЛЬНЫЙ ИНФЕРЕНС · 24 FPS · НА УСТРОЙСТВЕ</text>
      </svg>
    </div>
  );
}
