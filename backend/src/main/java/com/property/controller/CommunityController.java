package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.Community;
import com.property.mapper.CommunityMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityMapper communityMapper;

    public CommunityController(CommunityMapper communityMapper) {
        this.communityMapper = communityMapper;
    }

    @GetMapping
    public List<Community> list() {
        return communityMapper.findAllWithStats();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        Community community = communityMapper.findById(id);
        if (community == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "小区不存在"));
        return ResponseEntity.ok(community);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Community community) {
        if (community.getName() == null || community.getAddress() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "名称和地址不能为空"));
        }
        communityMapper.insert(community);
        return ResponseEntity.status(HttpStatus.CREATED).body(communityMapper.findById(community.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Community community) {
        if (communityMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "小区不存在"));
        }
        community.setId(id);
        communityMapper.update(community);
        return ResponseEntity.ok(communityMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (communityMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "小区不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
