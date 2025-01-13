// src/components/DocItem.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import { DocsDTO } from "@/types/DocsDTO";

import styles from "./DocItem.module.css";

interface DocItemProps {
  doc: DocsDTO;
  teamId: string;
  officeId: string;
  onDocAdded: (newDoc: DocsDTO, parentId: string) => void;
}

const DocItem: React.FC<DocItemProps> = ({
  doc,
  teamId,
  officeId,
  onDocAdded,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li className={styles.docItem}>
      <div className={styles.docHeader}>
        {doc.children && doc.children.length > 0 && (
          <button
            onClick={toggleExpand}
            className={styles.expandButton}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            style={{
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
              color:
                theme === "dark"
                  ? colors.text.dark.primary
                  : colors.text.light.primary,
            }}
          >
            <ChevronRight size={16} />
          </button>
        )}
        <Link
          href={`/office/${officeId}/team/${teamId}/docs/${doc.id}`}
          className={styles.docLink}
          style={{
            color:
              theme === "dark"
                ? colors.text.dark.primary
                : colors.text.light.primary,
          }}
        >
          {doc.title}
        </Link>
      </div>
      {isExpanded && doc.children && doc.children.length > 0 && (
        <ul className={styles.childDocs}>
          {doc.children.map((childDoc) => (
            <DocItem
              key={childDoc.id}
              doc={childDoc}
              teamId={teamId}
              officeId={officeId}
              onDocAdded={onDocAdded}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default DocItem;
