// app/office/[id]/team/[teamId]/layout.tsx

"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { BookText, Settings } from "lucide-react";
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";
import { DocsDTO } from "@/types/DocsDTO";
import { Board } from "@/services/boardService";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  return (
    <div className={styles.container}>
      <button
        onClick={toggleLeftSidebar}
        className={`${styles.sidebarToggle} ${
          leftSidebarOpen ? styles.leftToggleTransform : styles.leftToggle
        }`}
        style={{
          backgroundColor: colors.button.primary.default,
          color:
            theme === "dark"
              ? colors.text.light.primary
              : colors.text.dark.primary,
        }}
        aria-label="Toggle left sidebar"
      >
        <BookText size={24} />
      </button>

      <div className={styles.content}>
        <LeftSidebar isOpen={leftSidebarOpen} />
        {children}
        <RightSidebar isOpen={rightSidebarOpen} />
      </div>

      <button
        onClick={toggleRightSidebar}
        className={`${styles.sidebarToggle} ${
          rightSidebarOpen ? styles.rightToggleTransform : styles.rightToggle
        }`}
        style={{
          backgroundColor: colors.button.primary.default,
          color:
            theme === "dark"
              ? colors.text.light.primary
              : colors.text.dark.primary,
        }}
        aria-label="Toggle right sidebar"
      >
        <Settings size={24} />
      </button>
    </div>
  );
}
