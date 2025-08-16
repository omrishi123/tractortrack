import { cn } from "@/lib/utils";

export const TractorIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)}
  >
    <path d="M3 4H21V6H3V4ZM5 8V14H3V8H5ZM19 8V14H21V8H19ZM8 8V10H6V8H8ZM18 8V10H16V8H18ZM6 12V14H8V12H6ZM16 12V14H18V12H16Z" transform="translate(0 2)"/>
    <path d="M10 16H14V18H10V16Z" />
    <path d="M8 18H16L18 20H6L8 18Z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);
