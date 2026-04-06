import { type LucideIcon } from 'lucide-react';

interface CardSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}

export function CardSectionHeader({ icon: Icon, title, action }: CardSectionHeaderProps) {
  return (
    <div className="flex h-8 items-center justify-between">
      <h3 className="text-body flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      {action}
    </div>
  );
}
