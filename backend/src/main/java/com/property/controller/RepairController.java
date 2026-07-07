package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.RepairOrder;
import com.property.mapper.RepairMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairMapper repairMapper;

    public RepairController(RepairMapper repairMapper) {
        this.repairMapper = repairMapper;
    }

    @GetMapping
    public List<RepairOrder> list(@RequestParam(required = false) String status,
                                  @RequestParam(required = false) String category) {
        return repairMapper.findAll(status, category);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RepairOrder order) {
        if (order.getTitle() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "标题不能为空"));
        }
        if (order.getCategory() == null) order.setCategory("其他");
        if (order.getPriority() == null) order.setPriority("普通");
        repairMapper.insert(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(repairMapper.findById(order.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody RepairOrder order) {
        if (repairMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "工单不存在"));
        }
        order.setId(id);
        if ("已完成".equals(order.getStatus())) {
            order.setCompletedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        repairMapper.update(order);
        return ResponseEntity.ok(repairMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (repairMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "工单不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
