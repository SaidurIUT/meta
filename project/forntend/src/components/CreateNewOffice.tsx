// src/components/CreateNewOffice.tsx

"use client";

import * as React from "react";
import { Building2, Mail, Phone, Image, FileText } from "lucide-react";
import { officeService, CreateOfficeData, Office } from "@/services/officeService";
import styles from "./CreateNewOffice.module.css";

interface CreateNewOfficeProps {
  onClose: () => void;
  onOfficeCreated: (office: Office) => void;
}

const CreateNewOffice: React.FC<CreateNewOfficeProps> = ({ onClose, onOfficeCreated }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<CreateOfficeData>({
    name: "",
    physicalAddress: "",
    helpCenterNumber: "",
    email: "",
    logoUrl: "",
    websiteUrl: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const createdOffice = await officeService.createOffice(formData);
      onOfficeCreated(createdOffice);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create office. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Create New Office</h2>
          <p>Fill in the details below to create a new office location.</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Office Name</label>
            <div className={styles.inputWrapper}>
              <Building2 className={styles.inputIcon} />
              <input
                id="name"
                name="name"
                placeholder="Enter office name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="physicalAddress">Physical Address</label>
            <div className={styles.inputWrapper}>
              <Building2 className={styles.inputIcon} />
              <input
                id="physicalAddress"
                name="physicalAddress"
                placeholder="Enter physical address"
                value={formData.physicalAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="helpCenterNumber">Help Center Number</label>
            <div className={styles.inputWrapper}>
              <Phone className={styles.inputIcon} />
              <input
                id="helpCenterNumber"
                name="helpCenterNumber"
                placeholder="Enter help center number"
                value={formData.helpCenterNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="logoUrl">Logo URL</label>
            <div className={styles.inputWrapper}>
              <Image className={styles.inputIcon} />
              <input
                id="logoUrl"
                name="logoUrl"
                type="url"
                placeholder="Enter logo URL"
                value={formData.logoUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Uncomment the following block if you want to include the Website URL field */}
          {/*
          <div className={styles.formGroup}>
            <label htmlFor="websiteUrl">Website URL</label>
            <div className={styles.inputWrapper}>
              <Globe className={styles.inputIcon} />
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="Enter website URL"
                value={formData.websiteUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>
          */}

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <div className={styles.inputWrapper}>
              <FileText className={styles.inputIcon} />
              <textarea
                id="description"
                name="description"
                placeholder="Enter office description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.modalButtons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Creating..." : "Create Office"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewOffice;
