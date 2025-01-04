package com.meta.office.services.impl;

import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.entities.OfficeRole;
import com.meta.office.enums.RoleType;
import com.meta.office.exceptions.InvalidRoleException;
import com.meta.office.exceptions.OfficeNotFoundException;
import com.meta.office.repositories.OfficeRoleRepository;
import com.meta.office.repositories.OfficeRepository;
import com.meta.office.services.OfficeRoleService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfficeRoleServiceImpl implements OfficeRoleService {

    private final OfficeRoleRepository officeRoleRepository;
    private final OfficeRepository officeRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public OfficeRoleServiceImpl(OfficeRoleRepository officeRoleRepository,
                                 OfficeRepository officeRepository,
                                 ModelMapper modelMapper) {
        this.officeRoleRepository = officeRoleRepository;
        this.officeRepository = officeRepository;
        this.modelMapper = modelMapper;
    }

    private void validateRole(Integer roleId) {
        try {
            RoleType.fromId(roleId);
        } catch (InvalidRoleException e) {
            throw new InvalidRoleException(roleId);
        }
    }

    private OfficeRoleDTO enrichWithRoleName(OfficeRoleDTO dto) {
        RoleType roleType = RoleType.fromId(dto.getRoleId());
        dto.setRoleName(roleType.getName());
        return dto;
    }

    private void validateOffice(String officeId) {
        if (!officeRepository.existsById(officeId)) {
            throw new OfficeNotFoundException(officeId);
        }
    }


    @Override
    public OfficeRoleDTO assignRole(OfficeRoleDTO officeRoleDTO) {
        validateRole(officeRoleDTO.getRoleId());
        validateOffice(officeRoleDTO.getOfficeId());

        OfficeRole officeRole = modelMapper.map(officeRoleDTO, OfficeRole.class);
        OfficeRole savedRole = officeRoleRepository.save(officeRole);
        return enrichWithRoleName(modelMapper.map(savedRole, OfficeRoleDTO.class));
    }

    @Override
    public List<OfficeRoleDTO> getRolesByOffice(String officeId) {
        return List.of();
    }

    @Override
    public List<OfficeRoleDTO> getRolesByMember(String memberId) {
        return List.of();
    }

    @Override
    public List<OfficeRoleDTO> getMembersByRole(RoleType roleType, String officeId) {
        return List.of();
    }

    @Override
    public boolean hasMemberRole(String memberId, RoleType roleType, String officeId) {
        return false;
    }
}
