// src/app/office/[id]/team/[teamId]/docs/[docsId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useParams, notFound, useRouter } from "next/navigation";
import { Menu, Plus, Settings } from "lucide-react";

import { teamService, Team } from "@/services/teamService";
import docsService from "@/services/docsService";
import { colors } from "@/components/colors";
import DocItem from "@/components/DocItem";
import { DocsDTO } from "@/types/DocsDTO";

import styles from "./DocDetailsPage.module.css"; // Ensure this CSS exists or reuse TeamPage.module.css
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DocDetailsPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();

  // IDs from the dynamic route
  const officeId = params.id as string;
  const teamId = params.teamId as string;
  const docsId = params.docsId as string;

  // Team state
  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoading, setTeamLoading] = useState<boolean>(true);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Document tree (left sidebar)
  const [docs, setDocs] = useState<DocsDTO[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  // Single doc state (for the main content)
  const [doc, setDoc] = useState<DocsDTO | null>(null);
  const [docLoading, setDocLoading] = useState<boolean>(true);
  const [docError, setDocError] = useState<string | null>(null);

  // Local state for updating doc
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // State for adding child docs
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildDocTitle, setNewChildDocTitle] = useState("");
  const [newChildDocContent, setNewChildDocContent] = useState("");

  // Sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Fetch the team info (so we can display team name, etc.)
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await teamService.getTeam(teamId);
        setTeam(data);
      } catch (err) {
        console.error(err);
        setTeamError("Failed to fetch team details.");
        notFound();
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  // Fetch all docs for the left sidebar
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const allDocs = await docsService.getDocsByTeamId(teamId);
        // Filter to get only root docs
        const rootDocs = allDocs.filter((d) => !d.parentId);
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

  // Fetch the single doc data for main content
  useEffect(() => {
    const fetchDocById = async () => {
      try {
        const docData = await docsService.getDocById(docsId);
        setDoc(docData);
        setTitle(docData.title);
        setContent(docData.content);
      } catch (err) {
        console.error(err);
        setDocError("Failed to fetch doc details.");
        notFound();
      } finally {
        setDocLoading(false);
      }
    };

    fetchDocById();
  }, [docsId]);

  // For creating new docs in the tree
  const handleDocAdded = (newDoc: DocsDTO, parentId: string) => {
    setDocs((prevDocs) => {
      if (parentId === null) {
        // Add to root docs
        return [...prevDocs, newDoc];
      }
      // Find the parent doc and add the new doc to its children
      const updatedDocs = prevDocs.map((d) => {
        if (d.id === parentId) {
          return {
            ...d,
            children: d.children ? [...d.children, newDoc] : [newDoc],
          };
        }
        return d;
      });
      return updatedDocs;
    });
  };

  // Toggle sidebars
  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  // Handle updating the doc
  const handleUpdateDoc = async () => {
    try {
      if (!doc) return;
      const updatedDoc = await docsService.updateDoc(doc.id, {
        title,
        content,
      });
      setDoc(updatedDoc);
      alert("Document updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update document.");
    }
  };

  // Handle adding a child document
  const handleCreateChildDoc = async () => {
    try {
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: doc?.id || null,
        title: newChildDocTitle,
        content: newChildDocContent,
        level: (doc?.level || 0) + 1, // Increment the level for child documents
      });

      if (doc) {
        // Update the current document's children
        setDoc({
          ...doc,
          children: doc.children ? [...doc.children, newDoc] : [newDoc],
        });
      }

      // Update the docs in the sidebar
      setDocs((prevDocs) => {
        const updatedDocs = prevDocs.map((d) => {
          if (d.id === newDoc.parentId) {
            return {
              ...d,
              children: d.children ? [...d.children, newDoc] : [newDoc],
            };
          }
          return d;
        });
        return updatedDocs;
      });

      setNewChildDocTitle("");
      setNewChildDocContent("");
      setIsAddChildOpen(false);

      // Navigate to the new document's page with correct URL
      router.push(`/office/${officeId}/team/${teamId}/docs/${newDoc.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create child document.");
    }
  };

  // Loading states
  if (teamLoading || docLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  // Error states
  if (teamError || !team) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{teamError || "Team not found."}</p>
      </div>
    );
  }

  if (docError || !doc) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{docError || "Document not found."}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* LEFT SIDEBAR TOGGLE */}
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
        <Menu size={24} />
      </button>

      <div className={styles.content}>
        {/* LEFT SIDEBAR - Docs Tree */}
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
          <div className={styles.docsList}>
            {docsLoading && <p>Loading documents...</p>}
            {docsError && <p className={styles.error}>{docsError}</p>}
            {!docsLoading && !docsError && docs.length === 0 && (
              <p>No documents available.</p>
            )}
            {!docsLoading && !docsError && docs.length > 0 && (
              <ul className={styles.docList}>
                {docs.map((d) => (
                  <DocItem
                    key={d.id}
                    doc={d}
                    teamId={teamId}
                    officeId={officeId} // Pass officeId to DocItem
                    onDocAdded={handleDocAdded}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* MAIN CONTENT - Show doc details & update form */}
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
            {team.name} / {doc.title}
          </h1>

          <div className={styles.docForm}>
            <label htmlFor="docTitle">Title</label>
            <input
              id="docTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="docContent">Content</label>
            <textarea
              id="docContent"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button onClick={handleUpdateDoc} className={styles.updateButton}>
              Update Document
            </button>
          </div>

          {/* Add Child Document Dialog */}
          <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Child Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Child Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Document Title"
                    value={newChildDocTitle}
                    onChange={(e) => setNewChildDocTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Document Content"
                    value={newChildDocContent}
                    onChange={(e) => setNewChildDocContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateChildDoc}
                  disabled={!newChildDocTitle || !newChildDocContent}
                >
                  Create Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* RIGHT SIDEBAR */}
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
          <div className={styles.placeholderContent}>
            <p>No options available.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR TOGGLE */}
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
