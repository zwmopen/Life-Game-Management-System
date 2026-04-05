import React, { useMemo } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
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
  onReset
}) => {
  const currentSeedMeta = useMemo(
    () => [...SPECIES.plants, ...SPECIES.animals].find(seed => seed.id === currentSeed) ?? SPECIES.plants[0],
    [currentSeed]
  );
  const timerProgress = currentDuration > 0
    ? Math.max(0, Math.min(1, secondsRemaining / currentDuration))
    : 0;
  const timerProgressCircumference = 2 * Math.PI * 96;

  return (
    <div
      className={`pointer-events-auto w-[92vw] max-w-[420px] rounded-[32px] border p-4 md:p-6 transition-all duration-300 ${
        isNeomorphic
          ? isDark
            ? 'bg-[#1e1e2e]/95 border-zinc-700/80 shadow-[12px_12px_30px_rgba(0,0,0,0.35),-12px_-12px_30px_rgba(40,43,52,0.85)]'
            : 'bg-[#e0e5ec]/95 border-slate-300/80 shadow-[12px_12px_30px_rgba(163,177,198,0.55),-12px_-12px_30px_rgba(255,255,255,0.95)]'
          : isDark
            ? 'border-white/10 bg-slate-950/60 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl'
            : 'border-slate-200/80 bg-white/72 shadow-[0_24px_60px_rgba(148,163,184,0.35)] backdrop-blur-xl'
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-2 text-left">
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.24em] uppercase ${
            isDark ? 'bg-blue-500/12 text-blue-200' : 'bg-blue-100 text-blue-700'
          }`}>
            3D大陆计时器
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
              生长倒计时
            </h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              {currentSeedMeta.icon} 当前种子：{currentSeedMeta.name}
            </p>
          </div>
        </div>
        <div className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          isFocusing
            ? isPaused
              ? (isDark ? 'bg-amber-500/15 text-amber-200' : 'bg-amber-100 text-amber-700')
              : (isDark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-100 text-emerald-700')
            : (isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600')
        }`}>
          {isFocusing ? (isPaused ? '已暂停' : '生长中') : '待开始'}
        </div>
      </div>

      <div
        className={`relative mx-auto flex h-56 w-56 cursor-pointer items-center justify-center rounded-full transition-all duration-300 md:h-64 md:w-64 ${
          isNeomorphic
            ? isDark
              ? 'bg-[#1e1e2e] shadow-[8px_8px_20px_rgba(0,0,0,0.35),-8px_-8px_20px_rgba(40,43,52,0.7)]'
              : 'bg-[#e0e5ec] shadow-[8px_8px_20px_rgba(163,177,198,0.5),-8px_-8px_20px_rgba(255,255,255,0.92)]'
            : isDark
              ? 'bg-slate-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(15,23,42,0.35)]'
              : 'bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_18px_40px_rgba(148,163,184,0.25)]'
        } ${isFocusing && !isPaused ? 'scale-[1.01]' : ''}`}
        onClick={onPrimaryAction}
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r="96"
            fill="none"
            stroke={isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.14)'}
            strokeWidth="12"
          />
          <circle
            cx="120"
            cy="120"
            r="96"
            fill="none"
            stroke={isDark ? '#60a5fa' : '#2563eb'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={timerProgressCircumference}
            strokeDashoffset={timerProgressCircumference * (1 - timerProgress)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className={`text-xs font-semibold tracking-[0.32em] uppercase ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            时间盒风格
          </span>
          <span className={`mt-3 text-5xl font-bold tabular-nums md:text-6xl ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
            {formatTime(secondsRemaining)}
          </span>
          <span className={`mt-3 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            {isFocusing ? (isPaused ? '点击圆环或按钮继续专注' : '植物正在生长，保持单线程推进') : '点击圆环或下方按钮开始专注'}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className={`rounded-2xl px-3 py-2 ${isDark ? 'bg-white/5 text-zinc-300' : 'bg-slate-100/80 text-slate-600'}`}>
          <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">时长</div>
          <div className="mt-1 text-sm font-semibold">{Math.floor(currentDuration / 60)} 分钟</div>
        </div>
        <div className={`rounded-2xl px-3 py-2 ${isDark ? 'bg-white/5 text-zinc-300' : 'bg-slate-100/80 text-slate-600'}`}>
          <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">进度</div>
          <div className="mt-1 text-sm font-semibold">{Math.round((1 - timerProgress) * 100)}%</div>
        </div>
        <div className={`rounded-2xl px-3 py-2 ${isDark ? 'bg-white/5 text-zinc-300' : 'bg-slate-100/80 text-slate-600'}`}>
          <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">状态</div>
          <div className="mt-1 text-sm font-semibold">
            {isFocusing ? (isPaused ? '暂停' : '专注') : '待机'}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onPrimaryAction();
          }}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            isDark
              ? 'bg-blue-500/15 text-blue-100 hover:bg-blue-500/22'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFocusing && !isPaused ? <Pause size={16} /> : <Play size={16} />}
          {isFocusing ? (isPaused ? '继续专注' : '暂停计时') : '开始专注'}
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onReset();
          }}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            isDark
              ? 'bg-white/5 text-zinc-200 hover:bg-white/10'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <RotateCcw size={16} />
          重置计时
        </button>
      </div>
    </div>
  );
};

export default ImmersiveTimerHud;
