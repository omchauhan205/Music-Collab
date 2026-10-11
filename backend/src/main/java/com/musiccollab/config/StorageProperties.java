package com.musiccollab.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        String type,
        String location,
        S3 s3
) {
    public record S3(
            String bucket,
            String region,
            String endpoint,
            String accessKey,
            String secretKey,
            String publicBaseUrl
    ) {
    }
}
