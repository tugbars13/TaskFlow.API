import Badge from "@/components/ui/Badge";

export default function TaskBadges({ tags = [] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-xs">
      {tags.map((tag) => (
        <Badge key={tag.label} className={tag.className}>
          {tag.label}
        </Badge>
      ))}
    </div>
  );
}
