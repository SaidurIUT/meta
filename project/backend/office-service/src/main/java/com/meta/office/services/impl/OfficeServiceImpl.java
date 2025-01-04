package com.meta.office.services.impl;

import com.meta.office.dtos.OfficeDTO;
import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.entities.Office;
import com.meta.office.enums.RoleType;
import com.meta.office.exceptions.OfficeNotFoundException;
import com.meta.office.repositories.OfficeRepository;
import com.meta.office.services.OfficeRoleService;
import com.meta.office.utils.JwtUtil;
import com.meta.office.services.OfficeService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OfficeServiceImpl implements OfficeService {

    private final OfficeRepository officeRepository;
    private final ModelMapper modelMapper;
    private final OfficeRoleService officeRoleService;

    @Autowired
    public OfficeServiceImpl(OfficeRepository officeRepository, ModelMapper modelMapper, OfficeRoleService officeRoleService) {
        this.officeRepository = officeRepository;
        this.modelMapper = modelMapper;
        this.officeRoleService = officeRoleService;

    }

    @Override
    public OfficeDTO createOffice(OfficeDTO officeDTO) {

        String randomId = UUID.randomUUID().toString();  // Generating a random id for the office
        officeDTO.setId(randomId);
        Office office = modelMapper.map(officeDTO, Office.class);
        Office savedOffice = officeRepository.save(office);


        // Assign the creator of the office as an admin

        String creatorId = JwtUtil.getCurrentUserId(); // Getting the office creator's id from the JWT token

        OfficeRoleDTO officeRoleDTO = new OfficeRoleDTO();
        officeRoleDTO.setOfficeId(savedOffice.getId());
        officeRoleDTO.setMemberId(creatorId);
        officeRoleDTO.setRoleId(RoleType.ADMIN.getId());
        officeRoleService.assignRole(officeRoleDTO);


        return modelMapper.map(savedOffice, OfficeDTO.class);
    }

    @Override
    public OfficeDTO getOffice(String id) {
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new OfficeNotFoundException(id));
        return modelMapper.map(office, OfficeDTO.class);
    }

    @Override
    public OfficeDTO updateOffice(String id, OfficeDTO officeDTO) {
        return null;
    }

    @Override
    public void deleteOffice(String id) {

    }

    @Override
    public List<OfficeDTO> getAllOffices() {
        return List.of();
    }


}
