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

import styles from "./DocDetailsPage.module.css";
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

  const officeId = params.id as string;
  const teamId = params.teamId as string;
  const docsId = params.docsId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoading, setTeamLoading] = useState<boolean>(true);
  const [teamError, setTeamError] = useState<string | null>(null);

  const [docs, setDocs] = useState<DocsDTO[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  const [doc, setDoc] = useState<DocsDTO | null>(null);
  const [docLoading, setDocLoading] = useState<boolean>(true);
  const [docError, setDocError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildDocTitle, setNewChildDocTitle] = useState("");
  const [newChildDocContent, setNewChildDocContent] = useState("");

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

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

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const allDocs = await docsService.getDocsByTeamId(teamId);
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

  const handleDocAdded = (newDoc: DocsDTO, parentId: string) => {
    setDocs((prevDocs) => {
      if (parentId === null) {
        return [...prevDocs, newDoc];
      }
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

  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

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

  const handleCreateChildDoc = async () => {
    try {
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: doc?.id || null,
        title: newChildDocTitle,
        content: newChildDocContent,
        level: (doc?.level || 0) + 1,
      });

      if (doc) {
        setDoc({
          ...doc,
          children: doc.children ? [...doc.children, newDoc] : [newDoc],
        });
      }

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

      router.push(`/office/${officeId}/team/${teamId}/docs/${newDoc.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create child document.");
    }
  };

  if (teamLoading || docLoading) {
    return (
      <div className={styles.container}>
        <p style={{ color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary }}>
          Loading...
        </p>
      </div>
    );
  }

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

  const themeTextStyle = {
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  };

  const themeInputStyle = {
    backgroundColor: theme === "dark" ? colors.background.dark.end : colors.background.light.end,
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  };

  return (
    <div className={styles.container}>
      <button
        onClick={toggleLeftSidebar}
        className={`${styles.sidebarToggle} ${
          leftSidebarOpen ? styles.leftToggleTransform : styles.leftToggle
        }`}
        style={{
          backgroundColor: colors.button.primary.default,
          ...themeTextStyle,
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
            backgroundColor: theme === "dark" ? colors.background.dark.end : colors.background.light.end,
          }}
        >
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle} style={themeTextStyle}>
              Docs
            </h2>
          </div>
          <div className={styles.docsList}>
            {docsLoading && <p style={themeTextStyle}>Loading documents...</p>}
            {docsError && <p className={styles.error}>{docsError}</p>}
            {!docsLoading && !docsError && docs.length === 0 && (
              <p style={themeTextStyle}>No documents available.</p>
            )}
            {!docsLoading && !docsError && docs.length > 0 && (
              <ul className={styles.docList}>
                {docs.map((d) => (
                  <DocItem
                    key={d.id}
                    doc={d}
                    teamId={teamId}
                    officeId={officeId}
                    onDocAdded={handleDocAdded}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.mainContent}>
          <h1 className={styles.title} style={themeTextStyle}>
            {team.name} / {doc.title}
          </h1>

          <div className={styles.docForm}>
            <label htmlFor="docTitle" style={themeTextStyle}>
              Title
            </label>
            <input
              id="docTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={themeInputStyle}
            />

            <label htmlFor="docContent" style={themeTextStyle}>
              Content
            </label>
            <textarea
              id="docContent"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={themeInputStyle}
            />

            <button
              onClick={handleUpdateDoc}
              className={styles.updateButton}
              style={{
                backgroundColor: colors.button.primary.default,
                color: colors.button.text,
              }}
            >
              Update Document
            </button>
          </div>

          <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4" 
                variant="outline"
                style={themeTextStyle}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Child Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle style={themeTextStyle}>Create New Child Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Document Title"
                    value={newChildDocTitle}
                    onChange={(e) => setNewChildDocTitle(e.target.value)}
                    style={themeInputStyle}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Document Content"
                    value={newChildDocContent}
                    onChange={(e) => setNewChildDocContent(e.target.value)}
                    className="min-h-[200px]"
                    style={themeInputStyle}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateChildDoc}
                  disabled={!newChildDocTitle || !newChildDocContent}
                  style={{
                    backgroundColor: colors.button.primary.default,
                    color: colors.button.text,
                  }}
                >
                  Create Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div
          className={`${styles.sidebar} ${styles.rightSidebar} ${
            rightSidebarOpen ? styles.open : ""
          }`}
          style={{
            backgroundColor: theme === "dark" ? colors.background.dark.end : colors.background.light.end,
          }}
        >
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle} style={themeTextStyle}>
              Options
            </h2>
          </div>
          <div className={styles.placeholderContent}>
            <p style={themeTextStyle}>
              No options available.
            </p>
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
          ...themeTextStyle,
        }}
        aria-label="Toggle right sidebar"
      >
        <Settings size={24} />
      </button>
    </div>
  );
}