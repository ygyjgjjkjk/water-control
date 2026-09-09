import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Panel({
  children,
  className,
  title,
  subtitle,
  right,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className={clsx('glass rounded-2xl p-5', className)}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--color-text-dim)] mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
