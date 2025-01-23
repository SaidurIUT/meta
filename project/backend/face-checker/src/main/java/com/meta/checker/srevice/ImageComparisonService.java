package com.meta.checker.srevice;

import org.bytedeco.javacpp.DoublePointer;
import org.bytedeco.javacpp.IntPointer;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.opencv.opencv_core.*;
import org.bytedeco.opencv.opencv_face.*;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import static org.bytedeco.opencv.global.opencv_core.*;
import static org.bytedeco.opencv.global.opencv_imgcodecs.*;
import static org.bytedeco.opencv.global.opencv_imgproc.*;
import static org.bytedeco.opencv.global.opencv_face.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.IntBuffer;
import java.nio.file.*;
import java.util.ArrayList;

import static org.bytedeco.opencv.global.opencv_core.CV_32SC1;

@Service
public class ImageComparisonService {

    @Value("${user.stored.images.path}")
    private String userImagesPath;

    private static final double SIMILARITY_THRESHOLD = 80.0;
    private static final double CONFIDENCE_THRESHOLD = 1000.0;
    private final CascadeClassifier faceDetector;
    private final LBPHFaceRecognizer faceRecognizer;

    static {
        // Load the native library
        Loader.load(org.bytedeco.opencv.global.opencv_core.class);
    }

    public ImageComparisonService() {
        faceDetector = new CascadeClassifier();
        faceRecognizer = LBPHFaceRecognizer.create(1, 8, 8, 8, 100.0);

        try {
            Path tempFile = Files.createTempFile("cascade", ".xml");
            Files.copy(
                    getClass().getResourceAsStream("/haarcascade_frontalface_default.xml"),
                    tempFile,
                    StandardCopyOption.REPLACE_EXISTING
            );

            if (!faceDetector.load(tempFile.toString())) {
                throw new RuntimeException("Failed to load face cascade classifier");
            }

            Files.delete(tempFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load face cascade classifier", e);
        }
    }

    public boolean compareImages(String userId, MultipartFile uploadedImage) throws IOException {
        Path storedImagePath = findStoredImage(userId);
        if (storedImagePath == null) {
            throw new IllegalArgumentException("Stored image for userId not found: " + userId);
        }

        // Read images
        Mat uploadedMat = readImage(uploadedImage);
        Mat storedMat = imread(storedImagePath.toString());

        // Enhance image quality
        uploadedMat = preprocessImage(uploadedMat);
        storedMat = preprocessImage(storedMat);

        // Detect faces
        Rect uploadedFace = detectFaceEnhanced(uploadedMat);
        if (uploadedFace == null) {
            return false;
        }

        Rect storedFace = detectFaceEnhanced(storedMat);
        if (storedFace == null) {
            return false;
        }

        // Extract and normalize faces
        Mat uploadedFaceMat = extractAndNormalizeFace(uploadedMat, uploadedFace);
        Mat storedFaceMat = extractAndNormalizeFace(storedMat, storedFace);

        return compareFacesEnhanced(uploadedFaceMat, storedFaceMat);
    }

    private Mat preprocessImage(Mat image) {
        if (image == null || image.empty()) {
            throw new IllegalArgumentException("Input image is null or empty");
        }

        Mat processed = new Mat();
        Mat temp = new Mat();

        try {
            // Convert to grayscale if not already
            if (image.channels() > 1) {
                cvtColor(image, processed, COLOR_BGR2GRAY);
            } else {
                image.copyTo(processed);
            }

            // Apply histogram equalization
            equalizeHist(processed, processed);

            // Apply bilateral filter
            bilateralFilter(processed, temp, 9, 75, 75);

            return temp;
        } catch (Exception e) {
            // Clean up in case of errors
            processed.release();
            temp.release();
            throw e;
        }
    }

    private Rect detectFaceEnhanced(Mat image) {
        RectVector faces = new RectVector();

        // Try different scale factors and min neighbors
        double[] scaleFactors = {1.1, 1.2, 1.3};
        int[] minNeighbors = {3, 4, 5};

        for (double scaleFactor : scaleFactors) {
            for (int minNeighbor : minNeighbors) {
                faceDetector.detectMultiScale(
                        image,
                        faces,
                        scaleFactor,
                        minNeighbor,
                        0,
                        new Size(30, 30),
                        new Size(0, 0)
                );

                if (!faces.empty()) {
                    return getLargestFace(faces);
                }
            }
        }

        return null;
    }

    private Rect getLargestFace(RectVector faces) {
        if (faces.empty()) return null;

        Rect largest = faces.get(0);
        for (long i = 1; i < faces.size(); i++) {
            Rect face = faces.get(i);
            if (face.area() > largest.area()) {
                largest = face;
            }
        }
        return largest;
    }

    private Mat extractAndNormalizeFace(Mat image, Rect face) {
        Mat faceMat = new Mat(image, face);

        // Resize to standard size
        Mat resized = new Mat();
        resize(faceMat, resized, new Size(256, 256));

        // Normalize brightness and contrast
        Mat normalized = new Mat();
        normalize(resized, normalized, 0, 255, NORM_MINMAX, -1, null);

        return normalized;
    }

    private boolean compareFacesEnhanced(Mat face1, Mat face2) {
        // Create vectors for training data
        MatVector trainImages = new MatVector(1);
        trainImages.put(0, face1);

        // Create labels vector - use Mat instead of IntPointer
        Mat labels = new Mat(1, 1, CV_32SC1);
        IntBuffer labelBuffer = labels.createBuffer();
        labelBuffer.put(0, 1);

        // Train the recognizer with the correct method signature
        faceRecognizer.train(trainImages, labels);

        // Rest of your code remains the same
        IntPointer label = new IntPointer(1);
        DoublePointer confidence = new DoublePointer(1);
        faceRecognizer.predict(face2, label, confidence);

        // Calculate histogram correlation
        Mat hist1 = new Mat();
        Mat hist2 = new Mat();
        calcHist(face1, 1, new int[] {0}, new Mat(), hist1, 1, new int[] {256}, new float[] {0, 256});
        calcHist(face2, 1, new int[] {0}, new Mat(), hist2, 1, new int[] {256}, new float[] {0, 256});
        double correlation = compareHist(hist1, hist2, CV_COMP_CORREL);

        // Template matching
        Mat result = new Mat();
        matchTemplate(face1, face2, result, TM_CCOEFF_NORMED);
        DoublePointer minVal = new DoublePointer(1);
        DoublePointer maxVal = new DoublePointer(1);
        Point minLoc = new Point();
        Point maxLoc = new Point();
        minMaxLoc(result, minVal, maxVal, minLoc, maxLoc, null);

        // Combine results
        boolean recognizerMatch = confidence.get() < CONFIDENCE_THRESHOLD;
        boolean histogramMatch = correlation > 0.7;
        boolean templateMatch = maxVal.get() > 0.6;

        // Clean up native memory
        trainImages.deallocate();
        labels.deallocate();
        label.deallocate();
        confidence.deallocate();
        minVal.deallocate();
        maxVal.deallocate();

        int matchCount = (recognizerMatch ? 1 : 0) +
                (histogramMatch ? 1 : 0) +
                (templateMatch ? 1 : 0);

        return matchCount >= 2;
    }

    private Path findStoredImage(String userId) {
        String[] extensions = {".jpg", ".jpeg", ".png", ".bmp"};
        for (String ext : extensions) {
            Path path = Paths.get(userImagesPath, userId + ext);
            if (Files.exists(path)) {
                return path;
            }
        }
        return null;
    }

    private Mat readImage(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes)) {
            Mat mat = imdecode(new Mat(bytes), IMREAD_COLOR);
            if (mat.empty()) {
                throw new IOException("Failed to load image");
            }
            return mat;
        }
    }
}