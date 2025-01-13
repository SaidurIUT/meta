// src/app/office/[id]/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, useRouter, notFound } from "next/navigation";
import { Users, Settings } from "lucide-react";
import { officeService, Office } from "../../../services/officeService";
import { teamService, Team } from "../../../services/teamService";
import {
  officeRoleService,
  AssignRoleData,
  OfficeRole,
} from "../../../services/officeRoleService"; // Import officeRoleService
import { colors } from "@/components/colors";
import styles from "./DynamicOffice.module.css"; // <--- using the updated CSS
import TeamCard from "@/components/TeamCard";
import CreateNewTeam from "@/components/CreateNewTeam";
import GameCanvas from "@/components/GameCanvas";
import AddMemberModal from "@/components/AddMemberModal"; // Import the new AddMemberModal component
import { useAuth } from "@/components/auth/AuthProvider";
import { faceTrackingService } from "@/services/faceTrackingService";
import { toast } from "@/hooks/use-toast";

export default function DynamicOfficePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [office, setOffice] = useState<Office | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); // State for AddMemberModal

  const officeId = params.id as string;

  // Game screen states
  const [gameStarted, setGameStarted] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({
    name: user?.preferred_username || "Anonymous",
    roomId: officeId,
  });

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const data = await officeService.getOffice(officeId);
        setOffice(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch office details.");
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchOffice();
  }, [officeId]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeamsByOffice(officeId);
        setTeams(data);
      } catch (err) {
        console.error(err);
        setTeamsError("Failed to fetch teams.");
      } finally {
        setTeamsLoading(false);
      }
    };
    fetchTeams();
  }, [officeId]);

  // useEffect(() => {
  //   let intervalId: ReturnType<typeof setInterval> | null = null;

  //   if (officeId) {
  //     const captureAndSendPhoto = async () => {
  //       try {
  //         const image = await capturePhoto(); // Function to capture photo
  //         if (image) {
  //           await faceTrackingService.trackFace({ officeId, image });
  //           console.log("Photo sent successfully.");
  //           // add a success toast
  //           toast({ message: "Photo sent successfully.", type: "success" });
  //         }
  //       } catch (error) {
  //         console.error("Error sending photo:", error);
  //       }
  //     };

  //     // Start capturing photos every 5 minutes
  //     captureAndSendPhoto(); // Initial capture
  //     intervalId = setInterval(captureAndSendPhoto, 1 * 60 * 1000);

  //     return () => {
  //       if (intervalId) clearInterval(intervalId);
  //     };
  //   }
  // }, [officeId]);

  // const capturePhoto = async (): Promise<File | null> => {
  //   try {
  //     // Access the webcam and capture a photo
  //     const video = document.createElement("video");
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     video.srcObject = stream;
  //     await video.play();

  //     const canvas = document.createElement("canvas");
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     const ctx = canvas.getContext("2d");
  //     ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

  //     // Stop the video stream
  //     stream.getTracks().forEach((track) => track.stop());

  //     const blob = await new Promise<Blob | null>((resolve) =>
  //       canvas.toBlob((blob) => resolve(blob), "image/jpeg")
  //     );

  //     return blob
  //       ? new File([blob], "photo.jpg", { type: "image/jpeg" })
  //       : null;
  //   } catch (error) {
  //     console.error("Error capturing photo:", error);
  //     return null;
  //   }
  // };

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const toggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const openCreateTeamModal = () => {
    setIsCreateTeamModalOpen(true);
  };

  const closeCreateTeamModal = () => {
    setIsCreateTeamModalOpen(false);
  };

  const openAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams([...teams, newTeam]);
  };

  const handleGameStart = (username: string, roomId: string) => {
    setPlayerInfo({ name: username, roomId: roomId });
    setGameStarted(true);
  };

  const handleLeaveOffice = async () => {
    try {
      await officeService.leaveOffice(officeId);
      // After successfully leaving, redirect to the offices list page
      router.push("/office"); // Assuming '/office' is your offices list page
    } catch (err) {
      console.error("Failed to leave office:", err);
      // Optionally add error state and display to user
      setError("Failed to leave office. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading office details...</p>
      </div>
    );
  }

  if (error || !office) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error || "Office not found."}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* LEFT SIDEBAR TOGGLE BUTTON */}
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
        <Users size={24} />
      </button>

      <div className={styles.content}>
        {/* Left Sidebar */}
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
          {teamsLoading && <p>Loading teams...</p>}
          {teamsError && <p className={styles.error}>{teamsError}</p>}

          <div className={styles.teamList}>
            {teams.map((team) => (
              <TeamCard team={team} key={team.id} />
            ))}
            <div
              className={`${styles.teamCard} ${styles.plusCard}`}
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
              onClick={openCreateTeamModal}
            >
              +
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.mainContent}>
          {/* 80% Container for BootScreen or GameCanvas */}
          <div className={styles.gameContainer}>
            <div className={styles.gameCanvasContainer}>
              <GameCanvas
                playerName={playerInfo.name}
                roomId={playerInfo.roomId}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
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
          {/* Add your right-side content/services here */}
          <button
            onClick={openAddMemberModal}
            className={styles.addButton}
            style={{
              backgroundColor: colors.button.primary.default,
              color:
                theme === "dark"
                  ? colors.text.light.primary
                  : colors.text.dark.primary,
            }}
          >
            Add Member
          </button>
          <button
            onClick={handleLeaveOffice}
            className={styles.addButton}
            style={{
              backgroundColor: colors.button.primary.default,
              color:
                theme === "dark"
                  ? colors.text.light.primary
                  : colors.text.dark.primary,
            }}
          >
            Leave office
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR TOGGLE BUTTON */}
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

      {/* CREATE TEAM MODAL */}
      {isCreateTeamModalOpen && (
        <CreateNewTeam
          officeId={officeId}
          onClose={closeCreateTeamModal}
          onTeamCreated={handleTeamCreated}
        />
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <AddMemberModal officeId={officeId} onClose={closeAddMemberModal} />
      )}
    </div>
  );
}
