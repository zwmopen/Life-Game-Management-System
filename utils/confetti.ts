type ConfettiLauncher = (options: Record<string, unknown>) => Promise<unknown> | null;

let confettiPromise: Promise<ConfettiLauncher> | null = null;

const loadConfetti = () => {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then(module => module.default as ConfettiLauncher);
  }

  return confettiPromise;
};

export const fireConfetti = async (options: Record<string, unknown>) => {
  const confetti = await loadConfetti();
  return confetti(options);
};

export const withConfetti = async (
  callback: (confetti: ConfettiLauncher) => void | Promise<void>
) => {
  const confetti = await loadConfetti();
  return callback(confetti);
};
