import clsx from 'clsx';

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx('w-10 h-[22px] rounded-full relative transition-colors shrink-0', checked ? 'bg-cyan-500/70' : 'bg-white/10')}
    >
      <span className={clsx('absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all', checked ? 'left-[19px]' : 'left-[3px]')} />
    </button>
  );
}
