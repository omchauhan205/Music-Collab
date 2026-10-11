package com.musiccollab.config;

import com.musiccollab.entity.*;
import com.musiccollab.repository.*;
import com.musiccollab.service.SettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingsService settingsService;
    private final SeedProperties seedProperties;

    public DataSeeder(UserRepository userRepository,
                      ProjectRepository projectRepository,
                      ProjectMemberRepository projectMemberRepository,
                      PortfolioItemRepository portfolioItemRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder,
                      SettingsService settingsService,
                      SeedProperties seedProperties) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.portfolioItemRepository = portfolioItemRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingsService = settingsService;
        this.seedProperties = seedProperties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        settingsService.initializeDefaults();
        if (userRepository.count() > 0) {
            log.info("Seed skipped: users already exist");
            return;
        }
        String password = passwordEncoder.encode(seedProperties.defaultPassword());

        User admin = userRepository.save(User.builder()
                .name("Platform Admin")
                .email("admin@musiccollab.com")
                .password(password)
                .role(Role.ADMIN)
                .enabled(true)
                .bio("System administrator")
                .build());

        User aria = userRepository.save(User.builder()
                .name("Aria Vance")
                .email("aria@musiccollab.com")
                .password(password)
                .role(Role.MUSICIAN)
                .enabled(true)
                .bio("Vocalist and songwriter exploring synth-pop.")
                .build());

        User leo = userRepository.save(User.builder()
                .name("Leo Marsh")
                .email("leo@musiccollab.com")
                .password(password)
                .role(Role.MUSICIAN)
                .enabled(true)
                .bio("Session guitarist and producer.")
                .build());

        User mia = userRepository.save(User.builder()
                .name("Mia Chen")
                .email("mia@musiccollab.com")
                .password(password)
                .role(Role.MUSICIAN)
                .enabled(true)
                .bio("Drummer and mix engineer.")
                .build());

        Project project = projectRepository.save(Project.builder()
                .title("Midnight Echoes - EP")
                .description("A four-track synth-pop EP blending live vocals with analog synths.")
                .genre("Synth-pop")
                .deadline(LocalDate.now().plusMonths(2))
                .status(ProjectStatus.IN_PROGRESS)
                .owner(aria)
                .build());

        projectMemberRepository.save(ProjectMember.builder()
                .project(project).user(aria).role(ProjectRole.OWNER).build());
        projectMemberRepository.save(ProjectMember.builder()
                .project(project).user(leo).role(ProjectRole.COLLABORATOR).build());
        projectMemberRepository.save(ProjectMember.builder()
                .project(project).user(mia).role(ProjectRole.COLLABORATOR).build());

        portfolioItemRepository.save(PortfolioItem.builder()
                .owner(aria).title("Neon Rain").type(PortfolioType.SONG)
                .description("Lead single from the upcoming EP.")
                .releaseDate(LocalDate.now().minusMonths(1))
                .build());

        portfolioItemRepository.save(PortfolioItem.builder()
                .owner(aria).title("Midnight Echoes").type(PortfolioType.ALBUM)
                .description("Debut EP - in production.")
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(aria).title("Welcome to MusicCollab")
                .message("Your project workspace is ready.")
                .type("WELCOME").link("/musician/projects").build());

        log.info("Seed complete. Admin login: admin@musiccollab.com / {}", seedProperties.defaultPassword());
        log.info("Sample musician login: aria@musiccollab.com / {}", seedProperties.defaultPassword());
        log.info("Seeded admin id={}, musicians={}, {} , {}", admin.getId(), aria.getId(), leo.getId(), mia.getId());
    }
}
