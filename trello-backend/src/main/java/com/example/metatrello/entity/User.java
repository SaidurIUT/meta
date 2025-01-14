package com.example.metatrello.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(nullable = false, updatable = false)
    private String id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String image;

    @ElementCollection
    @CollectionTable(name = "user_board_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "board_id")
    private List<String> boardIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_card_ids", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "card_id")
    private List<String> cardIds = new ArrayList<>();
}
