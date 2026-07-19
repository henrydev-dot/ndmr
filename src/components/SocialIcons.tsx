import { Instagram, Youtube, Linkedin, Facebook, Twitter, Music2 } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  facebook: Facebook,
  x: Twitter,
  tiktok: Music2,
};

export default function SocialIcons({
  socials,
  size = 20,
}: {
  socials: { platform: string; url: string; isActive: boolean; order: number }[];
  size?: number;
}) {
  const active = (socials || [])
    .filter((s) => s.isActive && s.url)
    .sort((a, b) => a.order - b.order);
  if (active.length === 0) return null;
  return (
    <div className="flex items-center gap-4">
      {active.map((s) => {
        const Icon = ICONS[s.platform] || Instagram;
        return (
          <a
            key={s.platform + s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.platform}
            className="text-text-secondary transition-colors hover:text-accent"
          >
            <Icon size={size} strokeWidth={1.5} />
          </a>
        );
      })}
    </div>
  );
}
