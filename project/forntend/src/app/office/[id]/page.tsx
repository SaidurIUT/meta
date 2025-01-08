"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import {
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { offices, Office, Team, Service } from "../../data/officeData";
import { colors } from "@/components/colors";
import styles from "./DynamicOffice.module.css";
import { notFound } from "next/navigation";

export default function DynamicOfficePage() {
  const { theme } = useTheme();
  const params = useParams();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const office = offices.find((o) => o.id === params.id) as Office;

  if (!office) {
    notFound();
  }

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className={styles.container}>
      <button
        onClick={toggleLeftSidebar}
        className={`${styles.sidebarToggle} ${
          leftSidebarOpen ? styles.leftToggleTransform : styles.leftToggle
        }`}
        style={{
          backgroundColor:
            theme === "dark" ? colors.primary.dark : colors.primary.light,
          color:
            theme === "dark"
              ? colors.text.light.primary
              : colors.text.dark.primary,
        }}
        aria-label="Toggle left sidebar"
      >
        <Menu size={24} />
      </button>

      <div className={styles.content}>
        <div
          className={`${styles.sidebar} ${styles.leftSidebar} ${
            leftSidebarOpen ? styles.open : ""
          }`}
          style={{
            backgroundColor:
              theme === "dark"
                ? colors.background.dark.end
                : colors.background.light.end,
          }}
        >
          <div className={styles.sidebarHeader}>
            <h2
              className={styles.sidebarTitle}
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
            >
              Teams
            </h2>
          </div>
          <ul className={styles.teamList}>
            {office.teams.map((team) => (
              <li key={team.id}>
                <button
                  onClick={() => toggleTeam(team.id)}
                  className={styles.teamItem}
                  style={{
                    color:
                      theme === "dark"
                        ? colors.text.dark.primary
                        : colors.text.light.primary,
                  }}
                >
                  {team.name}
                  {expandedTeam === team.id ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {expandedTeam === team.id && (
                  <ul className={styles.memberList}>
                    {team.members.map((member, index) => (
                      <li
                        key={index}
                        className={styles.memberItem}
                        style={{
                          color:
                            theme === "dark"
                              ? colors.text.dark.secondary
                              : colors.text.light.secondary,
                        }}
                      >
                        {member}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.mainContent}>
          <h1
            className={styles.title}
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.primary
                  : colors.text.light.primary,
            }}
          >
            {office.name}
          </h1>
          <p
            className={styles.location}
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.secondary
                  : colors.text.light.secondary,
            }}
          >
            {office.location}
          </p>
          <p
            className={styles.placeholder}
            style={{
              color:
                theme === "dark"
                  ? colors.text.dark.secondary
                  : colors.text.light.secondary,
            }}
          >
            Select a team from the left sidebar or a service from the right
            sidebar to view details
          </p>
        </div>

        <div
          className={`${styles.sidebar} ${styles.rightSidebar} ${
            rightSidebarOpen ? styles.open : ""
          }`}
          style={{
            backgroundColor:
              theme === "dark"
                ? colors.background.dark.end
                : colors.background.light.end,
          }}
        >
          <div className={styles.sidebarHeader}>
            <h2
              className={styles.sidebarTitle}
              style={{
                color:
                  theme === "dark"
                    ? colors.text.dark.primary
                    : colors.text.light.primary,
              }}
            >
              Services
            </h2>
          </div>
          <ul className={styles.serviceList}>
            {office.services.map((service) => (
              <li
                key={service.id}
                className={styles.serviceItem}
                style={{
                  color:
                    theme === "dark"
                      ? colors.text.dark.primary
                      : colors.text.light.primary,
                }}
              >
                {service.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={toggleRightSidebar}
        className={`${styles.sidebarToggle} ${
          rightSidebarOpen ? styles.rightToggleTransform : styles.rightToggle
        }`}
        style={{
          backgroundColor:
            theme === "dark" ? colors.primary.dark : colors.primary.light,
          color:
            theme === "dark"
              ? colors.text.light.primary
              : colors.text.dark.primary,
        }}
        aria-label="Toggle right sidebar"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}
