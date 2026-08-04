export const buttonStyles = {
  base:
    "transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",

  variants: {
    filled:
      "bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90",

    secondary:
      "bg-secondary text-on-secondary rounded-full font-label-md flex items-center gap-xs",

    ghost:
      "text-primary rounded-full font-label-md flex items-center gap-xs hover:bg-primary/5",

    text:
      "text-primary font-label-md hover:underline",

    icon:
      "text-on-surface-variant hover:text-primary",
  },

  sizes: {
    sm: "px-md py-xs text-sm",
    md: "px-lg py-sm",
    lg: "px-xl py-md text-lg",
  },
};