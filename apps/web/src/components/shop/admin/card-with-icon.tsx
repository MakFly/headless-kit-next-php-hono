import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type CardWithIconProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string | number;
  to?: string;
  children?: React.ReactNode;
};

export function CardWithIcon({
  icon: Icon,
  title,
  subtitle,
  to,
  children,
}: CardWithIconProps) {
  const inner = (
    <div
      className="relative overflow-hidden p-4 flex justify-between items-center
        before:absolute before:top-[50%] before:left-0 before:block before:content-['']
        before:h-[200%] before:aspect-square before:translate-x-[-30%] before:translate-y-[-60%]
        before:rounded-full before:bg-slate-500 before:opacity-15"
    >
      <div>
        <Icon size={36} />
      </div>
      <div className="text-right">
        <p className="text-muted-foreground">{title}</p>
        <h2 className="text-2xl">{subtitle}</h2>
      </div>
    </div>
  );

  return (
    <Card className="min-h-[52px] flex flex-col flex-1 [&_a]:no-underline [&_a]:text-inherit">
      {to ? <Link href={to}>{inner}</Link> : inner}
      {children}
    </Card>
  );
}
