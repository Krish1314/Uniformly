package com.uniformly.schools;

import com.uniformly.common.NotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schools")
public class SchoolController {
    private final SchoolRepository schools;

    public SchoolController(SchoolRepository schools) {
        this.schools = schools;
    }

    @GetMapping
    public List<?> getSchools(@RequestParam(required = false) String search) {
        if (search == null || search.isBlank()) {
            return schools.findSchoolSummaries();
        }
        return schools.findByNameContainingIgnoreCaseAndActiveTrueOrderByName(search);
    }

    @GetMapping("/{id}")
    public School getSchoolById(@PathVariable Long id) {
        return schools.findById(id).filter(School::isActive)
                .orElseThrow(() -> new NotFoundException("School not found"));
    }
}
