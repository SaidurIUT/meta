package com.meta.checker.srevice;
import org.opencv.core.*;
import org.opencv.features2d.ORB;
import org.opencv.features2d.BFMatcher;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import nu.pattern.OpenCV;
import java.io.IOException;
import java.nio.file.*;

@Service
public class ImageComparisonService {

    @Value("${user.stored.images.path}")
    private String userImagesPath;

    private static final double SIMILARITY_THRESHOLD = 2000.0;
    private final CascadeClassifier faceDetector;

    // Static initializer to load OpenCV
    static {
        OpenCV.loadLocally();
    }

    public ImageComparisonService() {
        faceDetector = new CascadeClassifier();

        // Get the file from the classpath resources
        try {
            // Create a temporary file from the classpath resource
            Path tempFile = Files.createTempFile("cascade", ".xml");
            Files.copy(
                    getClass().getResourceAsStream("/haarcascade_frontalface_default.xml"),
                    tempFile,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Load the classifier from the temporary file
            if (!faceDetector.load(tempFile.toString())) {
                throw new RuntimeException("Failed to load face cascade classifier");
            }

            // Clean up the temporary file
            Files.delete(tempFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load face cascade classifier", e);
        }
    }

    public boolean compareImages(String userId, MultipartFile uploadedImage) throws IOException {
        // Find stored image
        Path storedImagePath = findStoredImage(userId);
        if (storedImagePath == null) {
            throw new IllegalArgumentException("Stored image for userId not found.");
        }

        // Read images
        Mat uploadedMat = readImage(uploadedImage);
        Mat storedMat = Imgcodecs.imread(storedImagePath.toString());

        // Detect faces
        Rect uploadedFace = detectFace(uploadedMat);
        if (uploadedFace == null) {
            return false; // No face detected in uploaded image
        }

        Rect storedFace = detectFace(storedMat);
        if (storedFace == null) {
            return false; // No face detected in stored image
        }

        // Extract face regions
        Mat uploadedFaceMat = new Mat(uploadedMat, uploadedFace);
        Mat storedFaceMat = new Mat(storedMat, storedFace);

        // Compare the face regions
        return compareFaces(uploadedFaceMat, storedFaceMat);
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
        Mat mat = Imgcodecs.imdecode(new MatOfByte(bytes), Imgcodecs.IMREAD_COLOR);
        if (mat.empty()) {
            throw new IOException("Failed to load image");
        }
        return mat;
    }

    private Rect detectFace(Mat image) {
        // Convert to grayscale for face detection
        Mat gray = new Mat();
        Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY);

        // Detect faces
        MatOfRect faces = new MatOfRect();
        faceDetector.detectMultiScale(gray, faces);

        Rect[] facesArray = faces.toArray();
        if (facesArray.length == 0) {
            return null;
        }

        // Return the first (presumably largest) face
        return facesArray[0];
    }

    private boolean compareFaces(Mat face1, Mat face2) {
        // Convert faces to grayscale
        Mat face1Gray = new Mat();
        Mat face2Gray = new Mat();
        Imgproc.cvtColor(face1, face1Gray, Imgproc.COLOR_BGR2GRAY);
        Imgproc.cvtColor(face2, face2Gray, Imgproc.COLOR_BGR2GRAY);

        // Resize faces to same size for better comparison
        Mat face1Resized = new Mat();
        Mat face2Resized = new Mat();
        Size size = new Size(256, 256);
        Imgproc.resize(face1Gray, face1Resized, size);
        Imgproc.resize(face2Gray, face2Resized, size);

        // Detect ORB features and compute descriptors
        ORB orb = ORB.create();

        MatOfKeyPoint keyPoints1 = new MatOfKeyPoint();
        Mat descriptors1 = new Mat();
        orb.detectAndCompute(face1Resized, new Mat(), keyPoints1, descriptors1);

        MatOfKeyPoint keyPoints2 = new MatOfKeyPoint();
        Mat descriptors2 = new Mat();
        orb.detectAndCompute(face2Resized, new Mat(), keyPoints2, descriptors2);

        if (descriptors1.empty() || descriptors2.empty()) {
            return false;
        }

        // Match features
        BFMatcher matcher = BFMatcher.create(Core.NORM_HAMMING, true);
        MatOfDMatch matches = new MatOfDMatch();
        matcher.match(descriptors1, descriptors2, matches);

        // Calculate similarity
        double totalDistance = 0.0;
        for (DMatch match : matches.toArray()) {
            totalDistance += match.distance;
        }

        return totalDistance < SIMILARITY_THRESHOLD;
    }
}