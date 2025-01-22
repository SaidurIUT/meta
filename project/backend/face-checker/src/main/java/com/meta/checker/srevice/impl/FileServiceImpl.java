package com.meta.checker.srevice.impl;

import com.meta.checker.srevice.FileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        // Get original file name
        String originalFilename = file.getOriginalFilename();

        // Generate unique filename while preserving extension
        String fileName = UUID.randomUUID().toString();
        String extension = getFileExtension(originalFilename);
        String fileNameWithExtension = fileName + extension;

        // Create complete path
        String filePath = path + File.separator + fileNameWithExtension;

        // Create folder if not exists
        File f = new File(path);
        if (!f.exists()) {
            f.mkdir();
        }

        // Copy file
        Files.copy(file.getInputStream(), Paths.get(filePath));

        return fileNameWithExtension;
    }

    @Override
    public String uploadImageWithFileName(String path, MultipartFile file, String fileName) throws IOException {
        // Get original file extension
        String extension = getFileExtension(file.getOriginalFilename());
        String fileNameWithExtension = fileName + extension;

        // Create complete path
        String filePath = path + File.separator + fileNameWithExtension;

        // Create folder if not exists
        File f = new File(path);
        if (!f.exists()) {
            f.mkdir();
        }

        // Copy file
        Files.copy(file.getInputStream(), Paths.get(filePath));

        return fileNameWithExtension;
    }

    @Override
    public InputStream getResource(String path, String fileName) throws FileNotFoundException {
        String fullPath = path + File.separator + fileName;
        return new FileInputStream(fullPath);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return ".jpg"; // Default extension if none provided
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex);
        }
        return ".jpg"; // Default extension if no extension in filename
    }
}