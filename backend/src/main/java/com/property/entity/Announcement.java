package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class Announcement {
    private Integer id;
    private String title;
    private String content;
    private String type;
    private String author;
    private Boolean isPinned;
    private LocalDateTime createdAt;
}
