package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.Resident;
import com.property.mapper.ResidentMapper;
import com.property.mapper.UnitMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    private final ResidentMapper residentMapper;
    private final UnitMapper unitMapper;

    public ResidentController(ResidentMapper residentMapper, UnitMapper unitMapper) {
        this.residentMapper = residentMapper;
        this.unitMapper = unitMapper;
    }

    @GetMapping
    public List<Resident> list(@RequestParam(required = false) Integer unit_id,
                               @RequestParam(required = false) String status) {
        return residentMapper.findAll(unit_id, status);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Resident resident) {
        if (resident.getName() == null || resident.getPhone() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "姓名和电话不能为空"));
        }
        if (resident.getType() == null) resident.setType("业主");
        if (resident.getStatus() == null) resident.setStatus("在住");
        residentMapper.insert(resident);
        if (resident.getUnitId() != null) {
            unitMapper.updateStatus(resident.getUnitId(), "已入住");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(residentMapper.findById(resident.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Resident resident) {
        if (residentMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "住户不存在"));
        }
        resident.setId(id);
        residentMapper.update(resident);
        return ResponseEntity.ok(residentMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (residentMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "住户不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
