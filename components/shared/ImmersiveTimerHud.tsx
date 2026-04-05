import React, { useMemo } from 'react';
import { SPECIES } from '../../data/speciesData';

interface ImmersiveTimerHudProps {
  isDark: boolean;
  isNeomorphic: boolean;
  isFocusing: boolean;
  isPaused: boolean;
  currentDuration: number;
  secondsRemaining: number;
  currentSeed: string;
  formatTime: (seconds: number) => string;
  onPrimaryAction: () => void;
  onReset: () => void;
}

const HUD_SIZE = 248;
const RING_RADIUS = 102;
const RING_STROKE_WIDTH = 12;
const INNER_INSET = 31;

const ImmersiveTimerHud: React.FC<ImmersiveTimerHudProps> = ({
  isDark,
  isNeomorphic,
  isFocusing,
  isPaused,
  currentDuration,
  secondsRemaining,
  currentSeed,
  formatTime,
  onPrimaryAction,
}) => {
  const currentSeedMeta = useMemo(
    () => [...SPECIES.plants, ...SPECIES.animals].find(seed => seed.id === currentSeed) ?? SPECIES.plants[0],
    [currentSeed]
  );

  const timerProgress = currentDuration > 0
    ? Math.max(0, Math.min(1, secondsRemaining / currentDuration))
    : 0;
  const timerProgressCircumference = 2 * Math.PI * RING_RADIUS;

  const shellClass = isNeomorphic
    ? isDark
      ? 'bg-[#1d2433] shadow-[20px_20px_40px_rgba(5,8,18,0.42),-14px_-14px_32px_rgba(66,84,118,0.18)]'
      : 'bg-[#eef3f9] shadow-[0_0_46px_rgba(255,255,255,0.82),18px_18px_38px_rgba(104,130,168,0.26),-14px_-14px_30px_rgba(255,255,255,0.82)]'
    : isDark
      ? 'bg-slate-900/86 shadow-[0_0_42px_rgba(96,165,250,0.28),0_24px_42px_rgba(5,10,20,0.36)]'
      : 'bg-[rgba(247,250,253,0.95)] shadow-[0_0_44px_rgba(255,255,255,0.74),0_24px_42px_rgba(122,145,179,0.2)]';

  const innerClass = isNeomorphic
    ? isDark
      ? 'bg-[#1d2433] shadow-[inset_8px_8px_20px_rgba(0,0,0,0.32),inset_-8px_-8px_18px_rgba(58,73,101,0.2)]'
      : 'bg-[#eef3f9] shadow-[inset_10px_10px_22px_rgba(176,191,214,0.32),inset_-10px_-10px_20px_rgba(255,255,255,0.95)]'
    : isDark
      ? 'bg-slate-900/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_38px_rgba(15,23,42,0.3)]'
      : 'bg-[rgba(247,250,253,0.95)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_18px_36px_rgba(148,163,184,0.16)]';

  const statusText = isFocusing ? (isPaused ? '已暂停' : '专注中') : '待开始';
  const progressPercent = Math.round((1 - timerProgress) * 100);

  return (
    <div className="pointer-events-auto flex items-center justify-center">
      <button
        type="button"
        onClick={onPrimaryAction}
        className={`relative flex items-center justify-center rounded-full border-0 transition-transform duration-300 ${shellClass} ${isFocusing && !isPaused ? 'scale-[1.02]' : ''}`}
        style={{ width: HUD_SIZE, height: HUD_SIZE }}
      >
        <div
          className={`absolute rounded-full ${innerClass}`}
          style={{ inset: INNER_INSET }}
        />

        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox={`0 0 ${HUD_SIZE} ${HUD_SIZE}`}>
          <circle
            cx={HUD_SIZE / 2}
            cy={HUD_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={isDark ? '#4f8dff' : '#2563eb'}
            strokeWidth={RING_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={timerProgressCircumference}
            strokeDashoffset={timerProgressCircumference * (1 - timerProgress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] ${
            isFocusing
              ? isPaused
                ? (isDark ? 'bg-amber-500/15 text-amber-200' : 'bg-amber-100 text-amber-700')
                : (isDark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-100 text-emerald-700')
              : (isDark ? 'bg-white/8 text-zinc-300' : 'bg-slate-100 text-slate-600')
          }`}>
            <span>{currentSeedMeta.icon}</span>
            <span>{statusText}</span>
          </span>

          <span className={`mt-5 text-5xl font-bold tabular-nums md:text-6xl ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
            {formatTime(secondsRemaining)}
          </span>

          <span className={`mt-3 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            {currentSeedMeta.name}
          </span>

          <span className={`mt-2 text-xs tracking-[0.24em] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            进度 {progressPercent}%
          </span>
        </div>
      </button>
    </div>
  );
};

export default ImmersiveTimerHud;
