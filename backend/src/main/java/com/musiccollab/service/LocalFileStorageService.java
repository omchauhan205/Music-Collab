package com.musiccollab.service;

import com.musiccollab.config.StorageProperties;
import com.musiccollab.exception.StorageException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private final Path root;

    public LocalFileStorageService(StorageProperties properties) {
        this.root = Paths.get(properties.location()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
        } catch (IOException ex) {
            throw new StorageException("Could not create storage directory: " + this.root, ex);
        }
    }

    @Override
    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StorageException("Cannot store an empty file");
        }
        String original = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename());
        String extension = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            extension = original.substring(dot);
        }
        String storedFilename = UUID.randomUUID() + extension;
        try {
            Path target = root.resolve(storedFilename).normalize();
            if (!target.getParent().equals(root)) {
                throw new StorageException("Cannot store file outside the storage directory");
            }
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredFile(storedFilename, original, file.getContentType(), file.getSize());
        } catch (IOException ex) {
            throw new StorageException("Failed to store file " + original, ex);
        }
    }

    @Override
    public Resource loadAsResource(String storedFilename) {
        try {
            Path file = root.resolve(storedFilename).normalize();
            if (!file.getParent().equals(root) || !Files.exists(file)) {
                throw new StorageException("File not found: " + storedFilename);
            }
            return new FileSystemResource(file);
        } catch (StorageException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new StorageException("Could not read file: " + storedFilename, ex);
        }
    }

    @Override
    public void delete(String storedFilename) {
        try {
            Path file = root.resolve(storedFilename).normalize();
            if (file.getParent().equals(root)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ex) {
            throw new StorageException("Could not delete file: " + storedFilename, ex);
        }
    }

    @Override
    public String publicUrl(String storedFilename) {
        return "/uploads/" + storedFilename;
    }
}
