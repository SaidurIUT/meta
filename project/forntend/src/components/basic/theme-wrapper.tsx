"use client";

import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import styles from "@/app/styles/Layout.module.css";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      className={styles.container}
      style={
        {
          "--bg-start":
            theme === "dark"
              ? colors.background.dark.start
              : colors.background.light.start,
          "--bg-end":
            theme === "dark"
              ? colors.background.dark.end
              : colors.background.light.end,
          background: `linear-gradient(to bottom right, var(--bg-start), var(--bg-end))`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
