package com.musiccollab.service;

import com.musiccollab.config.StorageProperties;
import com.musiccollab.exception.StorageException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final String bucket;
    private final String publicBaseUrl;

    public S3FileStorageService(StorageProperties properties) {
        StorageProperties.S3 s3 = properties.s3();
        if (s3 == null || !StringUtils.hasText(s3.bucket())) {
            throw new StorageException("S3 bucket is not configured (app.storage.s3.bucket)");
        }
        this.bucket = s3.bucket();
        this.publicBaseUrl = s3.publicBaseUrl();

        var builder = S3Client.builder().region(Region.of(s3.region()));
        if (StringUtils.hasText(s3.endpoint())) {
            builder.endpointOverride(URI.create(s3.endpoint()));
            builder.serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }
        if (StringUtils.hasText(s3.accessKey()) && StringUtils.hasText(s3.secretKey())) {
            AwsCredentialsProvider credentials = StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(s3.accessKey(), s3.secretKey()));
            builder.credentialsProvider(credentials);
        }
        this.s3Client = builder.build();
    }

    @Override
    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Cannot store an empty file");
        }
        String original = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename());
        String key = UUID.randomUUID() + getExtension(original);
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return new StoredFile(key, original, file.getContentType(), file.getSize());
        } catch (IOException ex) {
            throw new StorageException("Failed to store file " + original, ex);
        }
    }

    @Override
    public Resource loadAsResource(String storedFilename) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(storedFilename)
                    .build();
            ResponseInputStream<?> stream = s3Client.getObject(request);
            return new InputStreamResource(stream);
        } catch (Exception ex) {
            throw new StorageException("Could not read file: " + storedFilename, ex);
        }
    }

    @Override
    public void delete(String storedFilename) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(storedFilename).build());
        } catch (Exception ex) {
            throw new StorageException("Could not delete file: " + storedFilename, ex);
        }
    }

    @Override
    public String publicUrl(String storedFilename) {
        if (StringUtils.hasText(publicBaseUrl)) {
            return publicBaseUrl.replaceAll("/$", "") + "/" + storedFilename;
        }
        return "/api/files/download/" + storedFilename;
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
