"use client";

import React, { useEffect, useState } from "react";
import { docsService } from "@/services/docsService";
import styles from "./Docs.module.css";

interface Doc {
  id: string;
  title: string;
  content: string;
  teamId: string;
  officeId: string;
}

const DocsPage = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await docsService.getAllDocs();
        setDocs(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Loading documents...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Documents</h1>
      <div className={styles.docsList}>
        {docs.map((doc) => (
          <div key={doc.id} className={styles.docCard}>
            <h2 className={styles.docTitle}>{doc.title}</h2>
            <p className={styles.docContent}>{doc.content}</p>
            <div className={styles.docMeta}>
              <span>Team ID: {doc.teamId}</span>
              <span>Office ID: {doc.officeId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocsPage;
