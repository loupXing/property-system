package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.Announcement;
import com.property.mapper.AnnouncementMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementMapper announcementMapper;

    public AnnouncementController(AnnouncementMapper announcementMapper) {
        this.announcementMapper = announcementMapper;
    }

    @GetMapping
    public List<Announcement> list() {
        return announcementMapper.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Announcement announcement) {
        if (announcement.getTitle() == null || announcement.getContent() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "标题和内容不能为空"));
        }
        if (announcement.getType() == null) announcement.setType("通知");
        if (announcement.getIsPinned() == null) announcement.setIsPinned(false);
        announcementMapper.insert(announcement);
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementMapper.findById(announcement.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Announcement announcement) {
        if (announcementMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "公告不存在"));
        }
        announcement.setId(id);
        if (announcement.getIsPinned() == null) announcement.setIsPinned(false);
        announcementMapper.update(announcement);
        return ResponseEntity.ok(announcementMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (announcementMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "公告不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
