// app/office/[id]/team/[teamId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound } from "next/navigation";
import { Menu } from "lucide-react";
import { teamService, Team } from "@/services/teamService";
import docsService from "@/services/docsService"; // Import the docsService
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";
import DocItem from "@/components/DocItem"; // Import the DocItem component
import { DocsDTO } from "@/types/DocsDTO";

export default function TeamPage() {
  const { theme } = useTheme();
  const params = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // State to hold the list of root docs
  const [docs, setDocs] = useState<DocsDTO[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  const teamId = params.teamId as string;

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

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const allDocs = await docsService.getDocsByTeamId(teamId);
        // Filter docs with no parent (root docs)
        const rootDocs = allDocs.filter((doc) => !doc.parentId);
        setDocs(rootDocs);
      } catch (err) {
        console.error(err);
        setDocsError("Failed to fetch documents.");
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocs();
  }, [teamId]);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const handleDocAdded = (newDoc: DocsDTO, parentId: string) => {
    setDocs((prevDocs) => {
      // Find the parent doc and add the new doc to its children
      const updatedDocs = prevDocs.map((doc) => {
        if (doc.id === parentId) {
          return {
            ...doc,
            children: doc.children ? [...doc.children, newDoc] : [newDoc],
          };
        }
        return doc;
      });
      return updatedDocs;
    });
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
    <div className={styles.container}>
      <button
        onClick={toggleLeftSidebar}
        className={`${styles.sidebarToggle} ${
          leftSidebarOpen ? styles.leftToggleTransform : styles.leftToggle
        }`}
        style={{
          backgroundColor:
            theme === "dark"
              ? colors.button.primary.default
              : colors.button.primary.default,
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
        {/* Left Sidebar - Docs */}
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
              Docs
            </h2>
          </div>
          {/* Docs content */}
          <div className={styles.docsList}>
            {docsLoading && <p>Loading documents...</p>}
            {docsError && <p className={styles.error}>{docsError}</p>}
            {!docsLoading && !docsError && docs.length === 0 && (
              <p>No documents available.</p>
            )}
            {!docsLoading && !docsError && docs.length > 0 && (
              <ul className={styles.docList}>
                {docs.map((doc) => (
                  <DocItem key={doc.id} doc={doc} onDocAdded={handleDocAdded} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Content - Team Details */}
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

        {/* Right Sidebar - Options */}
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
              Options
            </h2>
          </div>
          {/* Placeholder for Options content */}
          <div className={styles.placeholderContent}>
            {/* Add your Options content here */}
            <p>No options available.</p>
          </div>
        </div>
      </div>

      <button
        onClick={toggleRightSidebar}
        className={`${styles.sidebarToggle} ${
          rightSidebarOpen ? styles.rightToggleTransform : styles.rightToggle
        }`}
        style={{
          backgroundColor:
            theme === "dark"
              ? colors.button.primary.default
              : colors.button.primary.default,
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
