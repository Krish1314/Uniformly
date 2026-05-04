package com.uniformly.schools;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByNameContainingIgnoreCaseAndActiveTrueOrderByName(String search);

    List<School> findByActiveTrueOrderByName();

    @Query("""
            select new com.uniformly.schools.SchoolSummary(
                s.id, s.name, s.city, s.state, s.logoUrl, count(p.id)
            )
            from School s
            left join Product p on p.school = s and p.active = true
            where s.active = true
            group by s.id, s.name, s.city, s.state, s.logoUrl
            order by s.name
            """)
    List<SchoolSummary> findSchoolSummaries();
}
