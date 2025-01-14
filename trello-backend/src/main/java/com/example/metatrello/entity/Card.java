package com.example.metatrello.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString(exclude = {"board", "boardList", "comments", "todos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "cards")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Card {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private String id;

    private String title;
    private String description;

    @Column(name = "card_order")
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    @JsonBackReference("board-cards") // Unique identifier for this relationship
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id")
    @JsonBackReference("list-cards") // Matches with @JsonManagedReference in BoardList
    private BoardList boardList;

    @ElementCollection
    @CollectionTable(name = "card_user_ids", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "user_id")
    private List<String> userIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "card_labels", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "label")
    private List<String> labels = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("card-comments")
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("card-todos")
    private List<Todo> todos = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "card_links", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "link")
    private List<String> links = new ArrayList<>();

    private LocalDateTime dateTo;
    private Boolean isCompleted = false;

    @ElementCollection
    @CollectionTable(name = "card_tracked_times", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "tracked_time")
    private List<String> trackedTimes = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
