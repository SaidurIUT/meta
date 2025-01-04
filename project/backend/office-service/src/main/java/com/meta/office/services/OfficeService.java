package com.meta.office.services;

import com.meta.office.dtos.OfficeDTO;

import java.util.List;

public interface OfficeService {
    OfficeDTO createOffice(OfficeDTO officeDTO);
    OfficeDTO getOffice(String id);
    OfficeDTO updateOffice(String id, OfficeDTO officeDTO);
    void deleteOffice(String id);
    List<OfficeDTO> getAllOffices();
}
