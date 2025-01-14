package com.example.metatrello.service;

import com.example.metatrello.dto.CardDTO;
import com.example.metatrello.entity.Board;
import com.example.metatrello.entity.BoardList;
import com.example.metatrello.entity.Card;
import com.example.metatrello.entity.Comment;
import com.example.metatrello.entity.Todo;
import com.example.metatrello.entity.User;
import com.example.metatrello.exception.ResourceNotFoundException;
import com.example.metatrello.exception.ServiceException;
import com.example.metatrello.mapper.CardMapper;
import com.example.metatrello.mapper.CommentMapper;
import com.example.metatrello.mapper.TodoMapper;
import com.example.metatrello.repository.BoardListRepository;
import com.example.metatrello.repository.BoardRepository;
import com.example.metatrello.repository.CardRepository;
import com.example.metatrello.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardListRepository boardListRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CardMapper cardMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private TodoMapper todoMapper;

    /**
     * Creates a new card.
     *
     * @param cardDTO The DTO containing card details.
     * @return The created CardDTO.
     */
    public CardDTO createCard(CardDTO cardDTO) {
        try {
            // Map DTO to Entity
            Card card = cardMapper.toEntity(cardDTO);

            // Fetch and set associated Board and BoardList
            Board board = getBoardById(cardDTO.getBoardId());
            BoardList boardList = getBoardListById(cardDTO.getListId());

            card.setBoard(board);
            card.setBoardList(boardList);

            // Set order
            Integer maxOrder = cardRepository.findMaxOrderByListId(boardList.getId()).orElse(0);
            card.setOrder(maxOrder + 1);

            // Initialize lists if null
            if (card.getUserIds() == null) {
                card.setUserIds(new ArrayList<>());
            }
            if (card.getLabels() == null) {
                card.setLabels(new ArrayList<>());
            }
            if (card.getLinks() == null) {
                card.setLinks(new ArrayList<>());
            }
            if (card.getTrackedTimes() == null) {
                card.setTrackedTimes(new ArrayList<>());
            }
            if (card.getComments() == null) {
                card.setComments(new ArrayList<>());
            }
            if (card.getTodos() == null) {
                card.setTodos(new ArrayList<>());
            }

            // Set creation and update timestamps
            card.setCreatedAt(LocalDateTime.now());
            card.setUpdatedAt(LocalDateTime.now());

            // Save the card
            Card savedCard = cardRepository.save(card);

            // Optionally, add the card to Board and BoardList (if bidirectional relationships are managed)
            board.getCards().add(savedCard);
            boardList.getCards().add(savedCard);
            boardRepository.save(board);
            boardListRepository.save(boardList);

            return cardMapper.toDTO(savedCard);
        } catch (Exception e) {
            log.error("Error creating card: ", e);
            throw new ServiceException("Error creating card", e);
        }
    }

    /**
     * Retrieves a card by its ID.
     *
     * @param id The ID of the card.
     * @return The CardDTO.
     */
    public CardDTO getCardById(String id) {
        return cardRepository.findById(id)
                .map(cardMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + id));
    }

    /**
     * Updates an existing card.
     *
     * @param cardDTO The DTO containing updated card details.
     * @return The updated CardDTO.
     */
    public CardDTO updateCard(CardDTO cardDTO) {
        try {
            Card existingCard = cardRepository.findById(cardDTO.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardDTO.getId()));

            // Update fields
            existingCard.setTitle(cardDTO.getTitle());
            existingCard.setDescription(cardDTO.getDescription());
            existingCard.setBoardList(getBoardListById(cardDTO.getListId()));
            existingCard.setBoard(getBoardById(cardDTO.getBoardId()));
            existingCard.setUserIds(cardDTO.getUserIds() != null ? cardDTO.getUserIds() : new ArrayList<>());
            existingCard.setLabels(cardDTO.getLabels() != null ? cardDTO.getLabels() : new ArrayList<>());
            existingCard.setLinks(cardDTO.getLinks() != null ? cardDTO.getLinks() : new ArrayList<>());
            existingCard.setIsCompleted(cardDTO.getIsCompleted() != null ? cardDTO.getIsCompleted() : false);
            existingCard.setTrackedTimes(cardDTO.getTrackedTimes() != null ? cardDTO.getTrackedTimes() : new ArrayList<>());
            existingCard.setDateTo(cardDTO.getDateTo());

            existingCard.setUpdatedAt(LocalDateTime.now());

            // Save updated card
            Card updatedCard = cardRepository.save(existingCard);

            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card: ", e);
            throw new ServiceException("Error updating card", e);
        }
    }

    /**
     * Deletes a card by its ID and associated board ID.
     *
     * @param cardId  The ID of the card to delete.
     * @param boardId The ID of the board associated with the card.
     */
    public void deleteCard(String cardId, String boardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));



        cardRepository.delete(card);
    }

    /**
     * Retrieves all cards within a specific board list.
     *
     * @param listId The ID of the board list.
     * @return A list of CardDTOs.
     */
    public List<CardDTO> getCardsByBoardListId(String listId) {
        List<Card> cards = cardRepository.findByBoardListId(listId);
        return cards.stream()
                .map(cardMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Copies an existing card within the same board.
     *
     * @param cardId  The ID of the card to copy.
     * @param boardId The ID of the board where the card resides.
     * @return The copied CardDTO.
     */
    public CardDTO copyCard(String cardId, String boardId) {
        Card originalCard = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Original card not found with ID: " + cardId));



        // Determine the new order
        Integer maxOrder = cardRepository.findMaxOrderByListId(originalCard.getBoardList().getId()).orElse(0);
        int newOrder = maxOrder + 1;

        // Create the new card
        Card newCard = new Card();
        newCard.setTitle(originalCard.getTitle() + " - Copy");
        newCard.setDescription(originalCard.getDescription());
        newCard.setBoard(originalCard.getBoard());
        newCard.setBoardList(originalCard.getBoardList());
        newCard.setOrder(newOrder);
        newCard.setUserIds(new ArrayList<>(originalCard.getUserIds()));
        newCard.setLabels(new ArrayList<>(originalCard.getLabels()));
        newCard.setLinks(new ArrayList<>(originalCard.getLinks()));
        newCard.setIsCompleted(originalCard.getIsCompleted());
        newCard.setTrackedTimes(new ArrayList<>(originalCard.getTrackedTimes()));
        newCard.setDateTo(originalCard.getDateTo());
        newCard.setCreatedAt(LocalDateTime.now());
        newCard.setUpdatedAt(LocalDateTime.now());

        // Initialize lists if null
        if (newCard.getComments() == null) {
            newCard.setComments(new ArrayList<>());
        }
        if (newCard.getTodos() == null) {
            newCard.setTodos(new ArrayList<>());
        }

        // Save the new card
        Card savedCard = cardRepository.save(newCard);

        // Optionally, add the card to Board and BoardList
        originalCard.getBoard().getCards().add(savedCard);
        originalCard.getBoardList().getCards().add(savedCard);
        boardRepository.save(originalCard.getBoard());
        boardListRepository.save(originalCard.getBoardList());

        return cardMapper.toDTO(savedCard);
    }

    /**
     * Adds a member to a card.
     *
     * @param cardId The ID of the card.
     * @param userId The ID of the user to add.
     * @return The updated CardDTO.
     */
    public CardDTO addCardMember(String cardId, String userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Add user to card's userIds if not already present
        if (!card.getUserIds().contains(user.getId())) {
            card.getUserIds().add(user.getId());
            card.setUpdatedAt(LocalDateTime.now());
            cardRepository.save(card);
        }

        // Add card to user's cardIds if not already present
        if (!user.getCardIds().contains(card.getId())) {
            user.getCardIds().add(card.getId());
            userRepository.save(user);
        }

        return cardMapper.toDTO(card);
    }

    /**
     * Removes a member from a card.
     *
     * @param cardId The ID of the card.
     * @param userId The ID of the user to remove.
     * @return The updated CardDTO.
     */
    public CardDTO removeCardMember(String cardId, String userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        // Remove user from card's userIds
        if (card.getUserIds().remove(userId)) {
            card.setUpdatedAt(LocalDateTime.now());
            cardRepository.save(card);
        }

        return cardMapper.toDTO(card);
    }

    /**
     * Updates the labels of a card.
     *
     * @param cardId The ID of the card.
     * @param labels The new list of labels.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardLabel(String cardId, List<String> labels) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        card.setLabels(labels);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Updates the completion status of a card.
     *
     * @param cardId      The ID of the card.
     * @param isCompleted The new completion status.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardIsCompleted(String cardId, Boolean isCompleted) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        card.setIsCompleted(isCompleted);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Updates the comments of a card.
     *
     * @param cardId  The ID of the card.
     * @param comments The new list of comments.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardComments(String cardId, List<Comment> comments) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        // Set the card reference in each comment
        comments.forEach(comment -> comment.setCard(card));

        card.setComments(comments);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Updates the todos of a card.
     *
     * @param cardId The ID of the card.
     * @param todos  The new list of todos.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardTodos(String cardId, List<Todo> todos) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        // Set the card reference in each todo
        todos.forEach(todo -> todo.setCard(card));

        card.setTodos(todos);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Updates the links of a card.
     *
     * @param cardId The ID of the card.
     * @param links  The new list of links.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardLinks(String cardId, List<String> links) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        card.setLinks(links);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Updates the date of a card.
     *
     * @param cardId The ID of the card.
     * @param dateTo The new date.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardDate(String cardId, LocalDateTime dateTo) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        card.setDateTo(dateTo);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Adds a comment to a card.
     *
     * @param cardId  The ID of the card.
     * @param comment The comment to add.
     * @return The updated CardDTO.
     */
    public CardDTO addCardComment(String cardId, Comment comment) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        comment.setCard(card);
        card.getComments().add(comment);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Removes a comment from a card.
     *
     * @param cardId    The ID of the card.
     * @param commentId The ID of the comment to remove.
     * @return The updated CardDTO.
     */
    public CardDTO removeCardComment(String cardId, String commentId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        boolean removed = card.getComments().removeIf(comment -> comment.getId().equals(commentId));



        card.setUpdatedAt(LocalDateTime.now());
        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Reorders multiple cards based on the provided list of DTOs.
     *
     * @param cards A list of CardDTOs with updated order values.
     */
    public void reorderCards(List<CardDTO> cards) {
        try {
            for (CardDTO dto : cards) {
                Card existingCard = cardRepository.findById(dto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + dto.getId()));

                BoardList boardList = boardListRepository.findById(dto.getListId())
                        .orElseThrow(() -> new ResourceNotFoundException("BoardList not found with ID: " + dto.getListId()));

                existingCard.setOrder(dto.getOrder());
                existingCard.setBoardList(boardList);
                existingCard.setUpdatedAt(LocalDateTime.now());

                cardRepository.save(existingCard);
            }
        } catch (Exception e) {
            log.error("Error reordering cards: ", e);
            throw new ServiceException("Error reordering cards", e);
        }
    }

    /**
     * Retrieves a specific board list by its ID.
     *
     * @param listId The ID of the board list.
     * @return The BoardList entity.
     */
    public BoardList getBoardListById(String listId) {
        return boardListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("BoardList not found with ID: " + listId));
    }

    /**
     * Retrieves a specific board by its ID.
     *
     * @param boardId The ID of the board.
     * @return The Board entity.
     */
    public Board getBoardById(String boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found with ID: " + boardId));
    }
}
