package com.meta.doc.mapper;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.entities.Docs;

import java.util.List;
import java.util.stream.Collectors;

public class DocsMapper {

    public static DocsDTO toDto(Docs docs, int level) {
        DocsDTO dto = new DocsDTO(
                docs.getId(),
                docs.getTeamId(),
                docs.getOfficeId(),
                docs.getTitle(),
                docs.getContent(),
                docs.getParent() != null ? docs.getParent().getId() : null,
                docs.getRootGrandparentId(),
                level
        );

        if (docs.getChildren() != null && !docs.getChildren().isEmpty()) {
            dto.setChildren(docs.getChildren().stream()
                    .map(child -> toDto(child, level + 1))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public static Docs toEntity(DocsDTO dto) {
        Docs docs = new Docs();
        docs.setId(dto.getId());
        docs.setTeamId(dto.getTeamId());
        docs.setOfficeId(dto.getOfficeId());
        docs.setTitle(dto.getTitle());
        docs.setContent(dto.getContent());
        docs.setRootGrandparentId(dto.getRootGrandparentId());
        return docs;
    }

    public static List<DocsDTO> toDtoList(List<Docs> docsList) {
        return docsList.stream()
                .map(doc -> toDto(doc, 0))
                .collect(Collectors.toList());
    }
}
