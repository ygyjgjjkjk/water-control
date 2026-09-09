import type { DemoStepDef } from '../types';

export const DEMO_STEPS: DemoStepDef[] = [
  { label: 'Штатный режим — все зоны в норме', durationMs: 5000 },
  { label: 'Рост потребления в женском туалете — 3 этаж', durationMs: 5000 },
  { label: 'Включено обнаружение аномалий ИИ', durationMs: 5000 },
  { label: 'Создана тревога — цифровой двойник подсвечивает помещение', durationMs: 6000 },
  { label: 'Оценка потерь воды растёт', durationMs: 6000 },
  { label: 'Расследование аномалии', durationMs: 4000 },
  { label: 'Проблема устранена — система возвращается к норме', durationMs: 5000 },
];

export const DEMO_TARGET_ZONE = 'toilet-f3-w';
