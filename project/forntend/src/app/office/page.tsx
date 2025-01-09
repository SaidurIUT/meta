// app/office/page.tsx

"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  officeService,
  Office,
  CreateOfficeData,
} from "../../services/officeService";
import { colors } from "@/components/colors";
import styles from "./Office.module.css";
import CreateNewOffice from "@/components/CreateNewOffice";

export default function OfficePage() {
  const { theme } = useTheme();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch offices associated with the user on component mount
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const data = await officeService.getOfficesByUserId();
        setOffices(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch offices.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);

  // Handlers to open and close the modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle office creation callback
  const handleOfficeCreated = (createdOffice: Office) => {
    setOffices([...offices, createdOffice]);
  };

  return (
    <div className={styles.container}>
      <h1
        className={styles.title}
        style={{
          color:
            theme === "dark"
              ? colors.text.dark.primary
              : colors.text.light.primary,
        }}
      >
        Your Offices
      </h1>

      {/* Display loading and error states */}
      {loading && <p>Loading offices...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.officeGrid}>
        {/* Render fetched offices */}
        {offices.map((office) => (
          <Link href={`/office/${office.id}`} key={office.id}>
            <div
              className={styles.officeCard}
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
            >
              <h2>{office.name}</h2>
              <p>{office.physicalAddress}</p>
            </div>
          </Link>
        ))}

        {/* Plus Button Card */}
        <div
          className={`${styles.officeCard} ${styles.plusCard}`}
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
          onClick={openModal}
        >
          +
        </div>
      </div>

      {/* Modal for Creating New Office */}
      {isModalOpen && (
        <CreateNewOffice
          onClose={closeModal}
          onOfficeCreated={handleOfficeCreated}
        />
      )}
    </div>
  );
}
