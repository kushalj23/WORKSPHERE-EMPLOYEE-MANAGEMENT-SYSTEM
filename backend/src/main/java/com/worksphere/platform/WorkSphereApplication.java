package com.worksphere.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class WorkSphereApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkSphereApplication.class, args);
    }
}
