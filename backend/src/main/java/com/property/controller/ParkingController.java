package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.ParkingSpace;
import com.property.mapper.ParkingMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    private final ParkingMapper parkingMapper;

    public ParkingController(ParkingMapper parkingMapper) {
        this.parkingMapper = parkingMapper;
    }

    @GetMapping
    public List<ParkingSpace> list(@RequestParam(required = false) Integer community_id,
                                   @RequestParam(required = false) String status) {
        return parkingMapper.findAll(community_id, status);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ParkingSpace space) {
        if (space.getCommunityId() == null || space.getSpaceNumber() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "小区和车位号不能为空"));
        }
        if (space.getType() == null) space.setType("地上");
        if (space.getStatus() == null) space.setStatus("空闲");
        if (space.getMonthlyFee() == null) space.setMonthlyFee(0.0);
        parkingMapper.insert(space);
        return ResponseEntity.status(HttpStatus.CREATED).body(parkingMapper.findById(space.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody ParkingSpace space) {
        if (parkingMapper.findById(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "车位不存在"));
        }
        space.setId(id);
        parkingMapper.update(space);
        return ResponseEntity.ok(parkingMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (parkingMapper.deleteById(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "车位不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
