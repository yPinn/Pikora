interface TabBadgeProps {
  count: number;
}

export function TabBadge({ count }: TabBadgeProps) {
  return (
    <span className="bg-primary-foreground text-primary text-caption ml-2 rounded-full px-1.5">
      {count}
    </span>
  );
}
