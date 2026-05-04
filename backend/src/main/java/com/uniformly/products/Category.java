package com.uniformly.products;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "size_guide_image_url")
    private String sizeGuideImageUrl;

    @Column(name = "size_guide_notes")
    private String sizeGuideNotes;

    protected Category() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getSizeGuideImageUrl() {
        return sizeGuideImageUrl;
    }

    public void setSizeGuideImageUrl(String sizeGuideImageUrl) {
        this.sizeGuideImageUrl = sizeGuideImageUrl;
    }

    public String getSizeGuideNotes() {
        return sizeGuideNotes;
    }

    public void setSizeGuideNotes(String sizeGuideNotes) {
        this.sizeGuideNotes = sizeGuideNotes;
    }
}
