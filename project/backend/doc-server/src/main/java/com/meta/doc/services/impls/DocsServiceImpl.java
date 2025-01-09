package com.meta.doc.services.impls;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.entities.Docs;
import com.meta.doc.mapper.DocsMapper;
import com.meta.doc.repositories.DocsRepo;
import com.meta.doc.services.DocsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DocsServiceImpl implements DocsService {

    private final DocsRepo docsRepository;

    public DocsServiceImpl(DocsRepo docsRepository) {
        this.docsRepository = docsRepository;
    }

    @Override
    @Transactional
    public DocsDTO saveDocs(DocsDTO docsDTO) {
        Docs docs = DocsMapper.toEntity(docsDTO);

        // Generate UUID for new documents
        if (docs.getId() == null || docs.getId().isEmpty()) {
            docs.setId(UUID.randomUUID().toString());
        }

        if (docsDTO.getParentId() != null) {
            Docs parent = docsRepository.findById(docsDTO.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent not found: " + docsDTO.getParentId()));
            docs.setParent(parent);
            docs.setRootGrandparentId(parent.getRootGrandparentId());
        }

        Docs savedDocs = docsRepository.save(docs);

        if (docsDTO.getParentId() == null) {
            savedDocs.setRootGrandparentId(savedDocs.getId());
            savedDocs = docsRepository.save(savedDocs);
        }

        return DocsMapper.toDto(savedDocs, 0);
    }

    @Override
    public List<DocsDTO> getAllDocs() {
        return DocsMapper.toDtoList(docsRepository.findAll());
    }

    @Override
    public DocsDTO getDocsById(String id) {
        return DocsMapper.toDto(findDocsById(id), 0);
    }

    @Override
    @Transactional
    public DocsDTO updateDocs(String id, DocsDTO docsDTO) {
        Docs existingDocs = findDocsById(id);
        existingDocs.setTitle(docsDTO.getTitle());
        existingDocs.setContent(docsDTO.getContent());
        return DocsMapper.toDto(docsRepository.save(existingDocs), 0);
    }

    @Override
    @Transactional
    public void deleteDocsById(String id) {
        Docs docs = findDocsById(id);
        if (docs.getParent() != null) {
            docs.getParent().removeChild(docs);
        }
        docsRepository.delete(docs);
    }

    @Override
    public List<DocsDTO> getRootDocs() {
        return DocsMapper.toDtoList(docsRepository.findByParentIsNull());
    }

    @Override
    public List<DocsDTO> getChildDocs(String parentId) {
        Docs parent = findDocsById(parentId);
        return DocsMapper.toDtoList(parent.getChildren());
    }

    @Override
    public DocsDTO getDocHierarchy(String rootId) {
        Docs root = findDocsById(rootId);
        return buildHierarchy(root, 0);
    }

    @Override
    @Transactional
    public DocsDTO moveDoc(String id, String newParentId) {
        Docs doc = findDocsById(id);
        Docs newParent = findDocsById(newParentId);

        if (isCircularReference(newParent, id)) {
            throw new IllegalArgumentException("Cannot move document to its own descendant");
        }

        if (doc.getParent() != null) {
            doc.getParent().removeChild(doc);
        }
        newParent.addChild(doc);
        return DocsMapper.toDto(docsRepository.save(doc), 0);
    }

    @Override
    public List<DocsDTO> searchDocs(String query, String parentId) {
        List<Docs> results;
        if (parentId != null) {
            results = docsRepository.findByTitleContainingIgnoreCaseAndRootGrandparentId(query, parentId);
        } else {
            results = docsRepository.findByTitleContainingIgnoreCase(query);
        }
        return DocsMapper.toDtoList(results);
    }

    @Override
    public List<DocsDTO> getDocsByTeamId(String teamId) {
        return DocsMapper.toDtoList(docsRepository.findByTeamId(teamId));
    }

    @Override
    public List<DocsDTO> getDocsByOfficeId(String officeId) {
        return DocsMapper.toDtoList(docsRepository.findByOfficeId(officeId));
    }

    private Docs findDocsById(String id) {
        return docsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
    }

    private DocsDTO buildHierarchy(Docs doc, int level) {
        DocsDTO dto = DocsMapper.toDto(doc, level);
        if (!doc.getChildren().isEmpty()) {
            dto.setChildren(doc.getChildren().stream()
                    .map(child -> buildHierarchy(child, level + 1))
                    .toList());
        }
        return dto;
    }

    private boolean isCircularReference(Docs newParent, String docId) {
        while (newParent != null) {
            if (newParent.getId().equals(docId)) {
                return true;
            }
            newParent = newParent.getParent();
        }
        return false;
    }
}
