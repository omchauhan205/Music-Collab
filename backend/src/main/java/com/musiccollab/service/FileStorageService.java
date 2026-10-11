package com.musiccollab.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    StoredFile store(MultipartFile file);

    Resource loadAsResource(String storedFilename);

    void delete(String storedFilename);

    String publicUrl(String storedFilename);

    record StoredFile(String storedFilename, String originalFilename, String contentType, long size) {
    }
}
