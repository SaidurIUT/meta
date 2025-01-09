// src/components/DocItem.tsx

import React, { useState } from "react";
import { DocsDTO } from "../types/DocsDTO";
import docsService from "../services/docsService";
import styles from "./DocItem.module.css";

interface DocItemProps {
  doc: DocsDTO;
  onDocAdded: (newDoc: DocsDTO, parentId: string) => void;
}

const DocItem: React.FC<DocItemProps> = ({ doc, onDocAdded }) => {
  const [children, setChildren] = useState<DocsDTO[] | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    const newDoc = {
      teamId: doc.teamId,
      officeId: doc.officeId,
      title,
      content: "",
      parentId: doc.id,
      rootGrandparentId: doc.rootGrandparentId || doc.id,
    };

    try {
      const createdDoc = await docsService.createDoc(newDoc);
      onDocAdded(createdDoc, doc.id);
      if (isExpanded && children) {
        setChildren([...children, createdDoc]);
      }
    } catch (error) {
      console.error("Error creating new document:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <li className={styles.docItem}>
      <div className={styles.docHeader}>
        <button onClick={handleExpand} className={styles.expandButton}>
          {isExpanded ? "-" : "+"}
        </button>
        <span className={styles.docTitle}>{doc.title}</span>
        <button onClick={handleCreate} className={styles.createButton}>
          +
        </button>
      </div>
      {isExpanded && (
        <div className={styles.childrenContainer}>
          {isLoading ? (
            <p>Loading...</p>
          ) : children && children.length > 0 ? (
            <ul className={styles.docList}>
              {children.map((child) => (
                <DocItem key={child.id} doc={child} onDocAdded={onDocAdded} />
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
