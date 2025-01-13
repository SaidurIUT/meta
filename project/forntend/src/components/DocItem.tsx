// src/components/DocItem.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocsDTO } from "../types/DocsDTO";
import docsService from "../services/docsService";
import styles from "./DocItem.module.css";
import { Plus } from "lucide-react"; // Ensure lucide-react is installed

interface DocItemProps {
  doc: DocsDTO;
  teamId: string;
  officeId: string; // New prop
  onDocAdded: (newDoc: DocsDTO, parentId: string) => void;
}

const DocItem: React.FC<DocItemProps> = ({ doc, teamId, officeId, onDocAdded }) => {
  const [children, setChildren] = useState<DocsDTO[] | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter(); // Initialize router for navigation

  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    setIsLoading(true);
    try {
      const childDocs = await docsService.getChildDocs(doc.id);
      setChildren(childDocs);
      setIsExpanded(true);
    } catch (error) {
      console.error("Error fetching child documents:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const title = prompt("Enter the title of the new document:");
    if (!title) return;

    const newDoc: Partial<DocsDTO> = {
      teamId: doc.teamId,
      officeId: doc.officeId,
      title,
      content: "",
      parentId: doc.id,
      rootGrandparentId: doc.rootGrandparentId || doc.id,
      level: doc.level + 1, // Increment the level for child documents
    };

    try {
      const createdDoc = await docsService.createDoc(newDoc);
      onDocAdded(createdDoc, doc.id);
      if (isExpanded && children) {
        setChildren([...children, createdDoc]);
      }
      // Navigate to the newly created document's page with correct URL
      router.push(`/office/${officeId}/team/${teamId}/docs/${createdDoc.id}`);
    } catch (error) {
      console.error("Error creating new document:", error);
      alert("Failed to create document.");
    }
  };

  return (
    <li className={styles.docItem}>
      <div className={styles.docHeader}>
        {doc.children && doc.children.length > 0 && (
          <button onClick={handleExpand} className={styles.expandButton}>
            {isExpanded ? "-" : "+"}
          </button>
        )}
        <Link
          href={`/office/${officeId}/team/${teamId}/docs/${doc.id}`} // Updated URL
          className={styles.docLink}
        >
          {doc.title}
        </Link>
        <button onClick={handleCreate} className={styles.createButton}>
          <Plus size={16} />
        </button>
      </div>
      {isExpanded && (
        <div className={styles.childrenContainer}>
          {isLoading ? (
            <p>Loading...</p>
          ) : children && children.length > 0 ? (
            <ul className={styles.docList}>
              {children.map((child) => (
                <DocItem
                  key={child.id}
                  doc={child}
                  teamId={teamId}
                  officeId={officeId} // Pass officeId down
                  onDocAdded={onDocAdded}
                />
              ))}
            </ul>
          ) : (
            <p>No child documents.</p>
          )}
        </div>
      )}
    </li>
  );
};

export default DocItem;
