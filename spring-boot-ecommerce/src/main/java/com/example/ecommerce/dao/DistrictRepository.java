package com.example.ecommerce.dao;

import com.example.ecommerce.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;


@RepositoryRestResource(collectionResourceRel = "districts", path = "districts")
public interface DistrictRepository extends JpaRepository<District, Integer> {

}
