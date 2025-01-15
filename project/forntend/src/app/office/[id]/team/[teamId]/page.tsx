// app/office/[id]/team/[teamId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound, useRouter } from "next/navigation";
import { BookText, Settings } from "lucide-react";
import { teamService, Team } from "@/services/teamService";
import docsService from "@/services/docsService"; // Import the docsService
import { colors } from "@/components/colors";
import styles from "./TeamPage.module.css";
import DocItem from "@/components/DocItem"; // Import the DocItem component
import { DocsDTO } from "@/types/DocsDTO";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust the path as needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Adjust the path as needed
import { Input } from "@/components/ui/input"; // Adjust the path as needed
import { Textarea } from "@/components/ui/textarea"; // Adjust the path as needed

export default function TeamPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter(); // Initialize router
  
  // Extract both officeId and teamId from params
  const officeId = params.id as string;
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  // State to hold the list of root docs
  const [docs, setDocs] = useState<DocsDTO[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

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

  const handleDocAdded = (newDoc: DocsDTO, parentId: string | null) => {
    setDocs((prevDocs) => {
      if (parentId === null) {
        // Add to root docs
        return [...prevDocs, newDoc];
      }
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

  const handleCreateDoc = async () => {
    try {
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: null,
        title: newDocTitle,
        content: newDocContent,
        level: 1, // Root level
      });

      // Navigate to the new document's page with the correct URL structure
      router.push(`/office/${officeId}/team/${teamId}/docs/${newDoc.id}`);

      // Optionally, update the docs state to keep the sidebar in sync
      setDocs((prevDocs) => [...prevDocs, newDoc]);

      // Reset form fields
      setNewDocTitle("");
      setNewDocContent("");
      setIsAddDocOpen(false);
    } catch (err) {
      console.error(err);
      // Optionally, display an error message to the user
      alert("Failed to create document.");
    }
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
                  <DocItem
                    key={doc.id}
                    doc={doc}
                    teamId={teamId}
                    officeId={officeId} // **Pass `officeId` here**
                    onDocAdded={handleDocAdded}
                  />
                ))}
              </ul>
            )}

            {/* Add Document Dialog */}
            <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Document Title"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Document Content"
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateDoc}
                    disabled={!newDocTitle || !newDocContent}
                  >
                    Create Document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
