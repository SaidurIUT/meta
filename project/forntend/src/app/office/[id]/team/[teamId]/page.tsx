"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound } from "next/navigation";
import { teamService, Team } from "@/services/office/teamService";
import { userService } from "@/services/userService";
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";
import { teamRoleService } from "@/services/office/teamRoleService";
import { TeamRoleAssignment } from "@/components/office/TeamRoleAssignment";

export default function TeamPage() {
  const { theme } = useTheme();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTeamAndUsers = async () => {
      try {
        // Fetch team details
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);

        // Fetch user IDs for the team
        const userIds = await teamRoleService.getUserIdsByTeam(teamId);

        // Fetch user details using userService
        const userPromises = userIds.map((userId) =>
          userService.getUserById(userId)
        );
        const fetchedUsers = await Promise.all(userPromises);

        // Set user details
        setUserDetails(fetchedUsers);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch team or user details.");
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndUsers();
  }, [teamId, refreshTrigger]);

  const handleRoleAssigned = () => {
    // Trigger a re-fetch of user details
    setRefreshTrigger((prev) => prev + 1);
  };

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

      {/* Display user details */}
      <div className={styles.userInfo}>
        <h2>Team members:</h2>
        {userDetails.length > 0 ? (
          userDetails.map((user, index) => (
            <div key={index} className={styles.username}>
              <ul>
                <li>{user.username}</li>
              </ul>
            </div>
          ))
        ) : (
          <p>No matching users found.</p>
        )}
      </div>

      {/* Add Role Assignment Form */}
      <TeamRoleAssignment teamId={teamId} onRoleAssigned={handleRoleAssigned} />
    </div>
  );
}
