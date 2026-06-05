package com.worksphere.platform.service;

import com.worksphere.platform.dto.*;
import com.worksphere.platform.entity.*;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.EmployeeRepository;
import com.worksphere.platform.repository.UserRepository;
import com.worksphere.platform.security.JwtTokenProvider;
import com.worksphere.platform.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public JwtResponse login(LoginRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        auditLogService.log(user.getEmail(), "USER_LOGIN", "User logged in successfully.", ipAddress);

        return JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .employeeId(user.getEmployee() != null ? user.getEmployee().getId() : null)
                .employeeName(user.getEmployee() != null ? 
                        (user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName()) : "Admin")
                .build();
    }

    @Transactional
    public void register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new BadRequestException("Employee Code is already in use!");
        }

        // Create new employee profile
        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .joiningDate(LocalDate.now())
                .employmentType("FULL_TIME")
                .employmentStatus("ACTIVE")
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        // Assign role
        Role role = Role.ROLE_EMPLOYEE;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role specified.");
            }
        }

        // Create new user account
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .employee(savedEmployee)
                .isActive(true)
                .build();

        userRepository.save(user);

        auditLogService.log(request.getEmail(), "USER_REGISTRATION", "Registered new user: " + request.getEmail(), ipAddress);
    }

    @Transactional(readOnly = true)
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        if (tokenProvider.validateToken(requestRefreshToken)) {
            String email = tokenProvider.getUsernameFromJwt(requestRefreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("Token refers to non-existing user"));

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("userId", user.getId());
            claims.put("employeeId", user.getEmployee() != null ? user.getEmployee().getId() : null);

            String token = tokenProvider.generateTokenFromUsername(email, claims);
            return new TokenRefreshResponse(token, requestRefreshToken);
        } else {
            throw new BadRequestException("Invalid or expired refresh token");
        }
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request, String ipAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.log(email, "PASSWORD_CHANGE", "Password changed successfully.", ipAddress);
    }
}
