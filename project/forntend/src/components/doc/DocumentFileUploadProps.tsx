import React, { useState, useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Upload, UploadCloud, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import documentFileService from "@/services/documentFileService";
import { DocumentFileDTO } from "@/types/DocumentFileDTO";

interface DocumentFileManagementProps {
  docId: string;
}

const DocumentFileManagement: React.FC<DocumentFileManagementProps> = ({
  docId,
}) => {
  const [documentFiles, setDocumentFiles] = useState<DocumentFileDTO[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  // Fetch files when component mounts or docId changes
  useEffect(() => {
    const fetchDocumentFiles = async () => {
      try {
        const files = await documentFileService.getFilesForDocument(docId);
        setDocumentFiles(files);
      } catch (error) {
        toast.error("Failed to fetch document files");
      }
    };

    fetchDocumentFiles();
  }, [docId]);

  // File upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await documentFileService.addFileToDocument(docId, file);
        toast.success(`${file.name} uploaded successfully`);

        // Refresh files
        const updatedFiles = await documentFileService.getFilesForDocument(
          docId
        );
        setDocumentFiles(updatedFiles);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  // File deletion handler
  const handleFileDelete = async () => {
    if (fileToDelete) {
      try {
        await documentFileService.deleteDocumentFile(docId, fileToDelete);
        toast.success("File deleted successfully");

        // Refresh files
        const updatedFiles = await documentFileService.getFilesForDocument(
          docId
        );
        setDocumentFiles(updatedFiles);
        setFileToDelete(null);
      } catch (error) {
        toast.error("Failed to delete file");
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center w-full mb-4">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-10 h-10 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">Upload files to document</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
        {documentFiles.length === 0 ? (
          <p className="text-gray-500">No files uploaded</p>
        ) : (
          <ul className="space-y-2">
            {documentFiles.map((file) => (
              <li
                key={file.id}
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span>{file.originalFileName}</span>
                </div>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <button onClick={() => setFileToDelete(file.id)}>
                      <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
                    <AlertDialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
                      <AlertDialog.Title className="text-lg font-semibold">
                        Delete File?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="text-sm text-gray-500 mt-2">
                        Are you sure you want to delete {file.originalFileName}?
                      </AlertDialog.Description>
                      <div className="flex justify-end space-x-2 mt-4">
                        <AlertDialog.Cancel className="px-4 py-2 bg-gray-200 rounded-md">
                          Cancel
                        </AlertDialog.Cancel>
                        <AlertDialog.Action
                          onClick={handleFileDelete}
                          className="px-4 py-2 bg-red-500 text-white rounded-md"
                        >
                          Delete
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentFileManagement;
