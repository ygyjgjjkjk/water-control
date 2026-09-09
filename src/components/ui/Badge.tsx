import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Severity, ZoneStatus, AlertStatus, DeviceStatus } from '../../types';
import { SEVERITY_RU, ZONE_STATUS_RU, ALERT_STATUS_RU, DEVICE_STATUS_RU } from '../../utils/labels';

const severityStyles: Record<Severity, string> = {
  HIGH: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide', severityStyles[severity])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {SEVERITY_RU[severity]}
    </span>
  );
}

const zoneStatusStyles: Record<ZoneStatus, string> = {
  NORMAL: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  HIGH: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  CRITICAL: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  OFFLINE: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export function StatusBadge({ status }: { status: ZoneStatus }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide', zoneStatusStyles[status])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {ZONE_STATUS_RU[status]}
    </span>
  );
}

const alertStatusStyles: Record<AlertStatus, string> = {
  OPEN: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  INVESTIGATING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide', alertStatusStyles[status])}>{ALERT_STATUS_RU[status]}</span>;
}

const deviceStatusStyles: Record<DeviceStatus, string> = {
  ONLINE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  OFFLINE: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  WARNING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide', deviceStatusStyles[status])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full bg-current', status === 'ONLINE' && 'pulse-dot')} />
      {DEVICE_STATUS_RU[status]}
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10 bg-white/5 text-[var(--color-text-dim)]', className)}>{children}</span>;
}
