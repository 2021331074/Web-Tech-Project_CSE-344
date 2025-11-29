package com.example.ecommerce.controller;

import com.example.ecommerce.dao.DistrictRepository;
import com.example.ecommerce.entity.District;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DistrictController {

    private final DistrictRepository districtRepository;

    public DistrictController(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    @GetMapping("/districts/all")
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }
}

