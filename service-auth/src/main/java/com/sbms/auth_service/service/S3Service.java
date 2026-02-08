package com.sbms.auth_service.service;

import com.sbms.auth_service.custom_exceptions.FileUploadException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;


/**
 * Service for handling S3 file uploads
 * Supports profile photos, signatures, and business stamps
 */
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    // File constraints
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png");

    /**
     * Upload a file to S3 and return its public URL
     *
     * @param file   The file to upload
     * @param folder The S3 folder (e.g., "profile-photos", "signatures", "stamps")
     * @param userId The user ID for organizing files
     * @return The public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder, UUID userId, UUID businessId) {

        validateFile(file);

        String fileName = generateUniqueFileName(file.getOriginalFilename());
        // Structure: folder/businessId/userId/filename
        String key = String.format("%s/%s/%s/%s", folder, businessId, userId, fileName);


        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

            // Return the public URL
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);

        } catch (S3Exception e) {
            throw new FileUploadException("Failed to upload file to S3: " + e.getMessage());
        } catch (IOException e) {
            throw new FileUploadException("Failed to read file: " + e.getMessage());
        }
    }

    /**
     * Delete a file from S3 using its URL
     *
     * @param fileUrl The full S3 URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        try {
            // Extract the key from the URL
            // Format: https://bucket-name.s3.region.amazonaws.com/folder/userId/filename
            String key = extractKeyFromUrl(fileUrl);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);

        } catch (S3Exception e) {
            // Log but don't fail if deletion fails (file might not exist)
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }
    }

    /**
     * Validate file type and size
     *
     * @param file The file to validate
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileUploadException("File size exceeds maximum limit of 5MB");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new FileUploadException("Only PNG and JPG images are allowed");
        }

        // Check file extension
        String fileName = file.getOriginalFilename();
        if (fileName == null || !hasValidExtension(fileName)) {
            throw new FileUploadException("Only PNG and JPG images are allowed");
        }
    }

    /**
     * Check if filename has a valid extension
     */
    private boolean hasValidExtension(String fileName) {
        String extension = getFileExtension(fileName);
        return ALLOWED_EXTENSIONS.contains(extension.toLowerCase());
    }

    /**
     * Generate a unique filename to prevent conflicts
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        return UUID.randomUUID().toString() + "." + extension;
    }

    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1);
        }
        return "";
    }

    /**
     * Extract the S3 key from a full URL
     */
    private String extractKeyFromUrl(String url) {
        // Format: https://bucket-name.s3.region.amazonaws.com/folder/userId/filename
        // We need to extract: folder/userId/filename
        int lastSlashIndex = url.indexOf(".com/");
        if (lastSlashIndex > 0) {
            return url.substring(lastSlashIndex + 5); // Skip ".com/"
        }
        throw new IllegalArgumentException("Invalid S3 URL format: " + url);
    }
}
