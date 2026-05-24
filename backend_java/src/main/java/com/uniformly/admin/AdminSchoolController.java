package com.uniformly.admin;

import com.uniformly.schools.School;
import com.uniformly.schools.SchoolRepository;
import com.uniformly.common.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/schools")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSchoolController {
    private final SchoolRepository schoolRepository;

    public AdminSchoolController(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @PostMapping
    public ResponseEntity<School> createSchool(@RequestBody AdminSchoolRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("School name is required");
        }
        School school = new School(
                request.name(),
                request.city(),
                request.state(),
                request.address(),
                request.logoUrl()
        );
        School saved = schoolRepository.save(school);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<School> updateSchool(@PathVariable Long id, @RequestBody AdminSchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("School not found"));

        if (request.name() != null) school.setName(request.name());
        if (request.city() != null) school.setCity(request.city());
        if (request.state() != null) school.setState(request.state());
        if (request.address() != null) school.setAddress(request.address());
        if (request.logoUrl() != null) school.setLogoUrl(request.logoUrl());

        School saved = schoolRepository.save(school);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchool(@PathVariable Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("School not found"));

        school.setActive(false);
        schoolRepository.save(school);
        return ResponseEntity.ok().build();
    }
}

record AdminSchoolRequest(
        String name,
        String city,
        String state,
        String address,
        String logoUrl
) {}
