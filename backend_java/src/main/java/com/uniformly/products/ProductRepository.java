package com.uniformly.products;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @EntityGraph(attributePaths = {"school", "category", "variants"})
    java.util.Optional<Product> findById(Long id);
    @EntityGraph(attributePaths = {"school", "category", "variants"})
    List<Product> findAll();

    @EntityGraph(attributePaths = {"school", "category", "variants"})
    List<Product> findTop8ByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"school", "category", "variants"})
    List<Product> findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"school", "category", "variants"})
    List<Product> findTop4BySchoolIdAndActiveTrueAndIdNot(Long schoolId, Long id);

    @EntityGraph(attributePaths = {"school", "category", "variants"})
    @Query(value = """
            select p from Product p
            where p.active = true
            and (:search is null or lower(p.name) like lower(concat('%', cast(:search as string), '%')))
            and (:schoolId is null or p.school.id = :schoolId)
            and (:category is null or lower(p.category.slug) = lower(cast(:category as string)) or lower(p.category.name) = lower(cast(:category as string)))
            """)
    org.springframework.data.domain.Page<Product> search(
            @Param("search") String search,
            @Param("schoolId") Long schoolId,
            @Param("category") String category,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("""
        select count(p)
        from Product p
        where p.active = true
    """)
    Long countActiveProducts();

    @Query("""
        select count(distinct p)
        from Product p
        join p.variants v
        where p.active = true
        and v.stockQuantity <= 0
    """)
    Long countOutOfStockProducts();

    @Query("""
        select distinct p from Product p
        join fetch p.school
        join fetch p.category
        left join fetch p.variants
        where p.active = true
        and (:search is null or lower(p.name) like lower(concat('%', :search, '%')))
        order by p.createdAt desc
    """)
    List<Product> adminSearchProducts(@Param("search") String search);
}
