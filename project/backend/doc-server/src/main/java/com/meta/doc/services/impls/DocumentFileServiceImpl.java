package com.meta.doc.services.impls;

import com.meta.doc.dtos.DocumentFileDTO;
import com.meta.doc.entities.Docs;
import com.meta.doc.entities.DocumentFile;
import com.meta.doc.repositories.DocumentFileRepository;
import com.meta.doc.repositories.DocsRepo;
import com.meta.doc.services.DocumentFileService;
import com.meta.doc.services.FileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentFileServiceImpl implements DocumentFileService {

    private final DocumentFileRepository documentFileRepository;
    private final DocsRepo docsRepository;
    private final FileService fileService;

    @Value("${project.file.path}")
    private String basePath;

    public DocumentFileServiceImpl(
            DocumentFileRepository documentFileRepository,
            DocsRepo docsRepository,
            FileService fileService) {
        this.documentFileRepository = documentFileRepository;
        this.docsRepository = docsRepository;
        this.fileService = fileService;
    }

    @Override
    public DocumentFileDTO addFileToDocument(String documentId, MultipartFile file) throws IOException {
        // Find the document
        Docs document = docsRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));

        // Upload the file
        String storedFileName = fileService.uploadResource(basePath, file);

        // Create DocumentFile entity
        DocumentFile documentFile = new DocumentFile();
        documentFile.setId(UUID.randomUUID().toString());
        documentFile.setDocument(document);
        documentFile.setOriginalFileName(file.getOriginalFilename());
        documentFile.setStoredFileName(storedFileName);
        documentFile.setFilePath(basePath);
        documentFile.setFileType(file.getContentType());

        // Save the file metadata
        DocumentFile savedFile = documentFileRepository.save(documentFile);

        // Convert and return DTO
        return convertToDTO(savedFile);
    }

    @Override
    public List<DocumentFileDTO> getFilesForDocument(String documentId) {
        return documentFileRepository.findByDocument_Id(documentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteDocumentFile(String fileId) {
        DocumentFile file = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));

        documentFileRepository.delete(file);
    }

    private DocumentFileDTO convertToDTO(DocumentFile documentFile) {
        DocumentFileDTO dto = new DocumentFileDTO();
        dto.setId(documentFile.getId());
        dto.setOriginalFileName(documentFile.getOriginalFileName());
        dto.setStoredFileName(documentFile.getStoredFileName());
        dto.setFileType(documentFile.getFileType());
        return dto;
    }
}