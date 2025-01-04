"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { offices } from "../data/officeData";
import { colors } from "@/app/styles/colors";
import styles from "./Office.module.css";

export default function OfficePage() {
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
        Our Offices
      </h1>
      <div className={styles.officeGrid}>
        {offices.map((office) => (
          <Link href={`/office/${office.id}`} key={office.id}>
            <div
              className={styles.officeCard}
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
              <h2>{office.name}</h2>
              <p>{office.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
