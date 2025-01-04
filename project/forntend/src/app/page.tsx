"use client";

import Link from "next/link";
import styles from "./styles/Home.module.css";
import { colors } from "@/app/styles/colors";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h2
          className={styles.heroTitle}
          style={{
            backgroundImage: `linear-gradient(to right, ${
              colors.primary[theme === "dark" ? "dark" : "light"]
            }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
          }}
        >
          Welcome to the Future
        </h2>
        <p
          className={styles.heroDescription}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.secondary
                : colors.text.light.secondary,
          }}
        >
          Experience minimalism with a touch of futurism in this Next.js
          showcase.
        </p>
        <Link
          href="#"
          className={styles.heroButton}
          style={{
            color: "white",
            backgroundImage: `linear-gradient(to right, ${
              colors.primary[theme === "dark" ? "dark" : "light"]
            }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
          }}
        >
          Explore Now
        </Link>
      </section>

      <section className={styles.features}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles.featureCard}
            style={{
              backgroundColor:
                theme === "dark" ? colors.background.dark.end : "white",
            }}
          >
            <h3
              className={styles.featureTitle}
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
            >
              Feature {i}
            </h3>
            <p
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.secondary
                    : colors.text.light.secondary,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        ))}
      </section>

      <section className={styles.cta}>
        <h2
          className={styles.ctaTitle}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          className={styles.ctaDescription}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.secondary
                : colors.text.light.secondary,
          }}
        >
          Join us on this journey into the future of web design and development.
        </p>
        <div className={styles.ctaButtons}>
          <Link
            href="#"
            className={styles.ctaButton}
            style={{
              color: colors.primary[theme === "dark" ? "dark" : "light"],
              borderColor: colors.primary[theme === "dark" ? "dark" : "light"],
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          >
            Learn More
          </Link>
          <Link
            href="#"
            className={styles.ctaButton}
            style={{
              color: "white",
              backgroundColor:
                colors.secondary[theme === "dark" ? "dark" : "light"],
            }}
          >
            Sign Up
          </Link>
        </div>
      </section>
    </div>
  );
}
