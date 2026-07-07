package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.Building;
import com.property.mapper.BuildingMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingMapper buildingMapper;

    public BuildingController(BuildingMapper buildingMapper) {
        this.buildingMapper = buildingMapper;
    }

    @GetMapping
    public List<Building> list(@RequestParam(required = false) Integer community_id) {
        return buildingMapper.findAll(community_id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Building building) {
        if (building.getCommunityId() == null || building.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "小区和楼栋名称不能为空"));
        }
        if (building.getFloors() == null) building.setFloors(1);
        if (building.getUnitsPerFloor() == null) building.setUnitsPerFloor(1);
        buildingMapper.insert(building);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildingMapper.findById(building.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Building building) {
        if (buildingMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "楼栋不存在"));
        }
        building.setId(id);
        buildingMapper.update(building);
        return ResponseEntity.ok(buildingMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (buildingMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "楼栋不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
