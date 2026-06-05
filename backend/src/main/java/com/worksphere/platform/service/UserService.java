package com.worksphere.platform.service;

import com.worksphere.platform.dto.AuditLogDto;
import com.worksphere.platform.dto.Mapper;
import com.worksphere.platform.entity.*;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       AuditLogRepository auditLogRepository,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUserRole(Long userId, String roleName, String adminEmail, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Role role = Role.valueOf(roleName);
        user.setRole(role);
        User saved = userRepository.save(user);

        auditLogService.log(adminEmail, "ROLE_UPDATE", "Updated role of user " + user.getEmail() + " to " + roleName, ipAddress);
        return saved;
    }

    @Transactional
    public User toggleUserStatus(Long userId, String adminEmail, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setIsActive(!user.getIsActive());
        User saved = userRepository.save(user);

        String action = saved.getIsActive() ? "USER_ACTIVATE" : "USER_DEACTIVATE";
        auditLogService.log(adminEmail, action, (saved.getIsActive() ? "Activated" : "Deactivated") + " user: " + user.getEmail(), ipAddress);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(Mapper::toAuditLogDto)
                .collect(Collectors.toList());
    }
}
