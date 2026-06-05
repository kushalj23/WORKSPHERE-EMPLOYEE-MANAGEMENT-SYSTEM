package com.worksphere.platform.service;

import com.worksphere.platform.dto.EmployeeDto;
import com.worksphere.platform.dto.Mapper;
import com.worksphere.platform.entity.*;
import com.worksphere.platform.exception.BadRequestException;
import com.worksphere.platform.exception.ResourceNotFoundException;
import com.worksphere.platform.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final AuditLogService auditLogService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           AuditLogService auditLogService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDto> getEmployees(String search, Long departmentId, Long designationId, 
                                          String employmentType, String employmentStatus, Pageable pageable) {
        Specification<Employee> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            String wildcard = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), wildcard),
                    cb.like(cb.lower(root.get("lastName")), wildcard),
                    cb.like(cb.lower(root.get("email")), wildcard),
                    cb.like(cb.lower(root.get("employeeCode")), wildcard)
            ));
        }

        if (departmentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("department").get("id"), departmentId));
        }

        if (designationId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("designation").get("id"), designationId));
        }

        if (employmentType != null && !employmentType.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employmentType"), employmentType));
        }

        if (employmentStatus != null && !employmentStatus.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employmentStatus"), employmentStatus));
        }

        return employeeRepository.findAll(spec, pageable).map(Mapper::toEmployeeDto);
    }

    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return Mapper.toEmployeeDto(emp);
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto, String adminEmail, String ipAddress) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        if (employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new BadRequestException("Employee Code is already in use!");
        }

        Department dept = null;
        if (dto.getDepartmentId() != null) {
            dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }

        Designation desig = null;
        if (dto.getDesignationId() != null) {
            desig = designationRepository.findById(dto.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
        }

        Employee emp = Employee.builder()
                .employeeCode(dto.getEmployeeCode())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .address(dto.getAddress())
                .department(dept)
                .designation(desig)
                .salary(dto.getSalary())
                .joiningDate(dto.getJoiningDate() != null ? dto.getJoiningDate() : LocalDate.now())
                .employmentType(dto.getEmploymentType() != null ? dto.getEmploymentType() : "FULL_TIME")
                .employmentStatus(dto.getEmploymentStatus() != null ? dto.getEmploymentStatus() : "ACTIVE")
                .emergencyContact(dto.getEmergencyContact())
                .profileImage(dto.getProfileImage())
                .build();

        Employee saved = employeeRepository.save(emp);
        auditLogService.log(adminEmail, "EMPLOYEE_CREATION", "Created employee: " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmployeeCode() + ")", ipAddress);
        return Mapper.toEmployeeDto(saved);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto, String adminEmail, String ipAddress) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!emp.getEmail().equals(dto.getEmail()) && employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Department dept = null;
        if (dto.getDepartmentId() != null) {
            dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }

        Designation desig = null;
        if (dto.getDesignationId() != null) {
            desig = designationRepository.findById(dto.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
        }

        emp.setFirstName(dto.getFirstName());
        emp.setLastName(dto.getLastName());
        emp.setEmail(dto.getEmail());
        emp.setPhoneNumber(dto.getPhoneNumber());
        emp.setGender(dto.getGender());
        emp.setDateOfBirth(dto.getDateOfBirth());
        emp.setAddress(dto.getAddress());
        emp.setDepartment(dept);
        emp.setDesignation(desig);
        emp.setSalary(dto.getSalary());
        emp.setEmploymentType(dto.getEmploymentType());
        emp.setEmploymentStatus(dto.getEmploymentStatus());
        emp.setEmergencyContact(dto.getEmergencyContact());
        if (dto.getProfileImage() != null) {
            emp.setProfileImage(dto.getProfileImage());
        }

        Employee saved = employeeRepository.save(emp);
        auditLogService.log(adminEmail, "EMPLOYEE_UPDATE", "Updated employee: " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmployeeCode() + ")", ipAddress);
        return Mapper.toEmployeeDto(saved);
    }

    @Transactional
    public void deleteEmployee(Long id, String adminEmail, String ipAddress) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employeeRepository.delete(emp);
        auditLogService.log(adminEmail, "EMPLOYEE_DELETION", "Deleted employee: " + emp.getFirstName() + " " + emp.getLastName() + " (" + emp.getEmployeeCode() + ")", ipAddress);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> getBirthdaysThisMonth() {
        return employeeRepository.findEmployeesWithBirthdayThisMonth().stream()
                .map(Mapper::toEmployeeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> getAnniversariesThisMonth() {
        return employeeRepository.findEmployeesWithAnniversaryThisMonth().stream()
                .map(Mapper::toEmployeeDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public String bulkUpload(InputStream inputStream, String adminEmail, String ipAddress) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false; // Skip header
                    continue;
                }

                String[] data = line.split(",");
                if (data.length < 8) {
                    failCount++;
                    errors.add("Invalid column count on row");
                    continue;
                }

                try {
                    String code = data[0].trim();
                    String firstName = data[1].trim();
                    String lastName = data[2].trim();
                    String email = data[3].trim();
                    String phone = data[4].trim();
                    String type = data[5].trim();
                    BigDecimal salary = new BigDecimal(data[6].trim());
                    LocalDate joiningDate = LocalDate.parse(data[7].trim(), DateTimeFormatter.ISO_LOCAL_DATE);

                    if (employeeRepository.existsByEmail(email) || employeeRepository.existsByEmployeeCode(code)) {
                        failCount++;
                        errors.add("Email or Code already exists for: " + email);
                        continue;
                    }

                    Employee emp = Employee.builder()
                            .employeeCode(code)
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .phoneNumber(phone)
                            .employmentType(type)
                            .employmentStatus("ACTIVE")
                            .salary(salary)
                            .joiningDate(joiningDate)
                            .build();

                    employeeRepository.save(emp);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add("Parsing error: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read CSV: " + e.getMessage());
        }

        auditLogService.log(adminEmail, "BULK_UPLOAD", "Bulk employee CSV upload. Success: " + successCount + ", Failures: " + failCount, ipAddress);
        return String.format("Upload finished. Success: %d, Failed: %d. Errors: %s", successCount, failCount, String.join("; ", errors));
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportToExcel() {
        List<Employee> employees = employeeRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Employees");

            // Row Headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Code", "Name", "Email", "Phone", "Department", "Designation", "Employment Type", "Status", "Joining Date"};

            CellStyle headerCellStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Employee emp : employees) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(emp.getEmployeeCode());
                row.createCell(1).setCellValue(emp.getFirstName() + " " + emp.getLastName());
                row.createCell(2).setCellValue(emp.getEmail());
                row.createCell(3).setCellValue(emp.getPhoneNumber());
                row.createCell(4).setCellValue(emp.getDepartment() != null ? emp.getDepartment().getName() : "N/A");
                row.createCell(5).setCellValue(emp.getDesignation() != null ? emp.getDesignation().getTitle() : "N/A");
                row.createCell(6).setCellValue(emp.getEmploymentType());
                row.createCell(7).setCellValue(emp.getEmploymentStatus());
                row.createCell(8).setCellValue(emp.getJoiningDate().toString());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Fail to import data to Excel file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportToPdf() {
        List<Employee> employees = employeeRepository.findAll();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("WorkSphere Employee Directory", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Create Table
            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{1.2f, 2.5f, 2.8f, 1.8f, 2.2f, 2.2f, 1.8f, 1.5f});

            // Set headers
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            String[] headers = {"Code", "Name", "Email", "Phone", "Department", "Designation", "Type", "Status"};

            for (String header : headers) {
                PdfPCell hCell = new PdfPCell(new Phrase(header, headFont));
                hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                hCell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                hCell.setPadding(6);
                table.addCell(hCell);
            }

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Employee emp : employees) {
                PdfPCell cell;

                cell = new PdfPCell(new Phrase(emp.getEmployeeCode(), cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getFirstName() + " " + emp.getLastName(), cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getEmail(), cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getPhoneNumber(), cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getDepartment() != null ? emp.getDepartment().getName() : "N/A", cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getDesignation() != null ? emp.getDesignation().getTitle() : "N/A", cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getEmploymentType(), cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(emp.getEmploymentStatus(), cellFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);
            }

            document.add(table);
            document.close();

        } catch (DocumentException ex) {
            throw new RuntimeException("Error producing PDF: " + ex.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
