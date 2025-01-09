// components/CreateNewOffice.tsx
import React, { useState } from "react";
import {
  officeService,
  CreateOfficeData,
  Office,
} from "../services/officeService";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import styles from "./CreateNewOffice.module.css";

interface CreateNewOfficeProps {
  onClose: () => void;
  onOfficeCreated: (office: Office) => void;
}

const CreateNewOffice: React.FC<CreateNewOfficeProps> = ({
  onClose,
  onOfficeCreated,
}) => {
  const { theme } = useTheme();
  const [newOffice, setNewOffice] = useState<CreateOfficeData>({
    name: "",
    physicalAddress: "",
    helpCenterNumber: "",
    email: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Handle input changes in the form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewOffice({
      ...newOffice,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission to create a new office
  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const createdOffice = await officeService.createOffice(newOffice);
      onOfficeCreated(createdOffice);
      setNewOffice({
        name: "",
        physicalAddress: "",
        helpCenterNumber: "",
        email: "",
        logoUrl: "",
        websiteUrl: "",
        description: "",
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create office.");
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        style={{
          backgroundColor:
            theme === "dark"
              ? colors.modal.background.dark
              : colors.modal.background.light,
          color:
            theme === "dark"
              ? colors.text.dark.primary
              : colors.text.light.primary,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2>Create New Office</h2>
        <form onSubmit={handleCreateOffice} className={styles.modalForm}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={newOffice.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Physical Address:
            <input
              type="text"
              name="physicalAddress"
              value={newOffice.physicalAddress}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Help Center Number:
            <input
              type="text"
              name="helpCenterNumber"
              value={newOffice.helpCenterNumber}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={newOffice.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Logo URL:
            <input
              type="url"
              name="logoUrl"
              value={newOffice.logoUrl}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Website URL:
            <input
              type="url"
              name="websiteUrl"
              value={newOffice.websiteUrl}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={newOffice.description}
              onChange={handleInputChange}
            ></textarea>
          </label>
          <div className={styles.modalButtons}>
            <button
              type="submit"
              className={styles.submitButton}
              style={{
                backgroundColor: colors.button.primary.default,
                color: colors.button.text,
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              style={{
                backgroundColor: colors.button.secondary.default,
                color: colors.button.text,
              }}
            >
              Cancel
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateNewOffice;
