package com.musiccollab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MusicCollabApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicCollabApplication.class, args);
    }
}
