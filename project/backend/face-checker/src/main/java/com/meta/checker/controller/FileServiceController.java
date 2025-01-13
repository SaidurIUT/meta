package com.meta.checker.controller;

import com.meta.checker.srevice.FileService;
import com.meta.checker.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/ac/v1/file")
public class FileServiceController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FileService fileService;

    @Value("${user.stored.images.path}")
    private String referenceImagePath;

    @Value("${project.track.image.path}")
    private String storedImagePath;

    @PostMapping("/reference")
    public String postImage(@RequestParam("image") MultipartFile image) throws IOException {
        String fileName = jwtUtil.getUserIdFromToken();
        return this.fileService.uploadImageWithFileName(referenceImagePath, image, fileName);
    }

    @GetMapping(value = "/seeCaptured/{imageName}",produces = MediaType.IMAGE_JPEG_VALUE)
    public void downloadImage(@PathVariable("imageName") String imageName, HttpServletResponse response) throws IOException {

        InputStream resource = this.fileService.getResource(storedImagePath, imageName);
        response.setContentType(MediaType.IMAGE_JPEG_VALUE);
        StreamUtils.copy(resource,response.getOutputStream())   ;

    }
}