import { cn } from "@/lib/utils";

export const TractorIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-tractor", className)}
  >
    <path d="M3 4H21V6H3V4Z" transform="translate(0 1)"/>
    <path d="M3 4H21V6H3V4Z" transform="translate(0 5)"/>
    <path d="M12 11L12 19" />
    <path d="M5 11L5 19" />
    <path d="M2 11H8" />
    <path d="m19 11-2-3-2 3" />
    <path d="M11 11H22" />
    <circle cx="7" cy="20" r="2" />
    <circle cx="17" cy="20" r="2" />
  </svg>
);
