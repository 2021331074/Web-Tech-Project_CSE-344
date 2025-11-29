package com.example.ecommerce.dao;

import com.example.ecommerce.entity.Upazila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource
public interface UpazilaRepository extends JpaRepository<Upazila, Integer> {

    List<Upazila> findByDistrictCode(@Param("code") String code);

}
