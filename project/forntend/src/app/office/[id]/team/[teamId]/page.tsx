// app/office/[id]/team/[teamId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound } from "next/navigation";
import { teamService, Team } from "@/services/office/teamService";
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";

export default function TeamPage() {
  const { theme } = useTheme();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await teamService.getTeam(teamId);
        setTeam(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch team details.");
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Team not found."}</p>
      </div>
    );
  }

  return (
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
        {team.name}
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
        {team.description}
      </p>
    </div>
  );
}
