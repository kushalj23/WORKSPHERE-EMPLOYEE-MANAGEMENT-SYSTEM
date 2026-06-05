package com.worksphere.platform.service;

import com.worksphere.platform.entity.AuditLog;
import com.worksphere.platform.entity.User;
import com.worksphere.platform.repository.AuditLogRepository;
import com.worksphere.platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void log(String email, String action, String details, String ipAddress) {
        User user = userRepository.findByEmail(email).orElse(null);
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(auditLog);
    }
}
