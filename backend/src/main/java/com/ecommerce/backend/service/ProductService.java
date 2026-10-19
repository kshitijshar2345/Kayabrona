package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ProductRequest;
import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Get all products with pagination and sorting
    public Page<Product> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort;
        // Only allow safe sort fields
        List<String> allowedFields = List.of("price", "rating", "createdAt", "name", "id");
        String safeSortBy = allowedFields.contains(sortBy) ? sortBy : "id";

        sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(safeSortBy).descending()
                : Sort.by(safeSortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findByActiveTrue(pageable);
    }

    // Search products by keyword
    public Page<Product> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchProducts(keyword, pageable);
    }

    // Get products by category
    public Page<Product> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
    }

    // Get featured products
    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue();
    }

    // Get single product
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // Create product (Admin only)
    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        setProductFields(product, request);
        return productRepository.save(product);
    }

    // Update product (Admin only)
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        setProductFields(product, request);
        return productRepository.save(product);
    }

    // Delete product — soft delete (Admin only)
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);       // soft delete — keeps data in DB
        productRepository.save(product);
    }

    // Update stock after order
    public void updateStock(Long productId, int quantity) {
        Product product = getProductById(productId);
        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock for: " + product.getName());
        }
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    // Helper — set fields from request
    private void setProductFields(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setBrand(request.getBrand());
        product.setTag(request.getTag());
        product.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
    }
}