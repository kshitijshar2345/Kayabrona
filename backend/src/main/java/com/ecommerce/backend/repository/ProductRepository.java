package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find all active products with pagination
    Page<Product> findByActiveTrue(Pageable pageable);

    // Search by name or description
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    // Filter by category
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    // Get featured products
    List<Product> findByFeaturedTrueAndActiveTrue();

    // Filter by price range
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.price BETWEEN :min AND :max")
    Page<Product> findByPriceRange(@Param("min") Double min,
                                   @Param("max") Double max,
                                   Pageable pageable);

    // Search + category filter combined
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "p.category.id = :categoryId AND " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchByKeywordAndCategory(@Param("keyword") String keyword,
                                             @Param("categoryId") Long categoryId,
                                             Pageable pageable);
}
