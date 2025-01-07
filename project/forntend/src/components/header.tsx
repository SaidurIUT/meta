"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import styles from "./Header.module.css";
import { colors } from "@/app/styles/colors";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginButton } from "@/components/auth/LoginButton";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <header
      className={styles.header}
      style={{
        backgroundColor:
          theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)",
        borderBottomColor:
          theme === "dark" ? colors.border.dark : colors.border.light,
      }}
    >
      <div className={styles.container}>
        <h1
          className={styles.title}
          style={{
            backgroundImage: `linear-gradient(to right, ${
              colors.primary[theme === "dark" ? "dark" : "light"]
            }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
          }}
        >
          FuturMinimal
        </h1>
        <Link href="/office" className={styles.navLink}>
          Offices
        </Link>

        <div>{isAuthenticated ? <LogoutButton /> : <LoginButton />}</div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={styles.themeToggle}
          style={{
            backgroundColor:
              theme === "dark"
                ? colors.background.dark.end
                : colors.background.light.end,
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
