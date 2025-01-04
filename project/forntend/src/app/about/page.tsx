"use client";

import { useTheme } from "next-themes";
import { colors } from "@/app/styles/colors";
import styles from "./About.module.css";

export default function AboutUs() {
  const { theme } = useTheme();

  return (
    <div className={styles.container}>
      <h1
        className={styles.title}
        style={{
          color:
            theme === "dark"
              ? colors.text.dark.primary
              : colors.text.light.primary,
        }}
      >
        About Us
      </h1>
      <p
        className={styles.description}
        style={{
          color:
            theme === "dark"
              ? colors.text.dark.secondary
              : colors.text.light.secondary,
        }}
      >
        We are a team of passionate developers and designers dedicated to
        creating futuristic and minimal web experiences. Our goal is to push the
        boundaries of web design while maintaining simplicity and usability.
      </p>
      <div className={styles.teamSection}>
        <h2
          className={styles.sectionTitle}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Our Team
        </h2>
        <div className={styles.teamGrid}>
          {["Alice", "Bob", "Charlie", "Diana"].map((member, index) => (
            <div
              key={index}
              className={styles.teamMember}
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
            >
              <div className={styles.avatar}></div>
              <h3>{member}</h3>
              <p
                style={{
                  color:
                    theme === "dark"
                      ? colors.text.dark.secondary
                      : colors.text.light.secondary,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
