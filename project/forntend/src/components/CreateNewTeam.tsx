// components/CreateNewTeam.tsx
import React, { useState } from "react";
import { teamService, CreateTeamData, Team } from "../services/teamService";
import { useTheme } from "next-themes";
import { colors } from "@/components/colors";
import styles from "./CreateNewTeam.module.css";

interface CreateNewTeamProps {
  officeId: string;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

const CreateNewTeam: React.FC<CreateNewTeamProps> = ({
  officeId,
  onClose,
  onTeamCreated,
}) => {
  const { theme } = useTheme();
  const [newTeam, setNewTeam] = useState<CreateTeamData>({
    name: "",
    officeId: officeId,
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewTeam({
      ...newTeam,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const createdTeam = await teamService.createTeam(newTeam);
      onTeamCreated(createdTeam);
      setNewTeam({
        name: "",
        officeId: officeId,
        description: "",
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create team.");
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
        <h2>Create New Team</h2>
        <form onSubmit={handleCreateTeam} className={styles.modalForm}>
          <label>
            Team Name:
            <input
              type="text"
              name="name"
              value={newTeam.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={newTeam.description}
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

export default CreateNewTeam;
