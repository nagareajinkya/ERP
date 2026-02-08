package com.sbms.auth_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;

import java.net.URI;

/**
 * AWS S3 Configuration for image uploads
 * Uses AWS SDK V2 (latest version)
 */
@Configuration
@RequiredArgsConstructor
public class S3Config {

    @Value("${aws.s3.access-key}")
    private String awsAccessKey;

    @Value("${aws.s3.secret-key}")
    private String awsSecretKey;

    @Value("${aws.s3.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.s3.endpoint}")
    private String awsEndpoint;

    @Value("${aws.s3.enabled}")
    private boolean s3Enabled;

    /**
     * Create S3Client bean
     * Supports both real AWS S3 and local S3-compatible services (MinIO, LocalStack)
     */
    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(awsRegion));

        // 1. Handle Endpoint (MinIO/LocalStack)
        if (awsEndpoint != null && !awsEndpoint.isBlank()) {
            builder.endpointOverride(URI.create(awsEndpoint))
                    .forcePathStyle(true);
        }

        // 2. Handle Credentials
        // If we have explicit keys in properties, use them
        if (awsAccessKey != null && !awsAccessKey.isBlank()
                && awsSecretKey != null && !awsSecretKey.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(awsAccessKey, awsSecretKey)
            ));
        } else {
            // Otherwise, rely on the Default Credential Provider Chain
            // (Checks standard OS Env vars, ~/.aws/credentials, or IAM roles)
            // This is much safer for production!
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        S3Presigner.Builder builder = S3Presigner.builder()
                .region(Region.of(awsRegion));

        if (awsEndpoint != null && !awsEndpoint.isBlank()) {
            builder.endpointOverride(URI.create(awsEndpoint));
        }

        if (awsAccessKey != null && !awsAccessKey.isBlank()
                && awsSecretKey != null && !awsSecretKey.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(awsAccessKey, awsSecretKey)
            ));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }
}
