package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.Unit;
import com.property.mapper.UnitMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    private final UnitMapper unitMapper;

    public UnitController(UnitMapper unitMapper) {
        this.unitMapper = unitMapper;
    }

    @GetMapping
    public List<Unit> list(@RequestParam(required = false) Integer building_id,
                           @RequestParam(required = false) String status) {
        return unitMapper.findAll(building_id, status);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Unit unit) {
        if (unit.getBuildingId() == null || unit.getUnitNumber() == null || unit.getArea() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "楼栋、房号和面积不能为空"));
        }
        if (unit.getFloor() == null) unit.setFloor(1);
        if (unit.getType() == null) unit.setType("住宅");
        if (unit.getStatus() == null) unit.setStatus("空置");
        unitMapper.insert(unit);
        return ResponseEntity.status(HttpStatus.CREATED).body(unitMapper.findById(unit.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Unit unit) {
        if (unitMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "房屋不存在"));
        }
        unit.setId(id);
        unitMapper.update(unit);
        return ResponseEntity.ok(unitMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (unitMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "房屋不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
