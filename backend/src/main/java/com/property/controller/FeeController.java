package com.property.controller;

import com.property.dto.MessageResponse;
import com.property.entity.Bill;
import com.property.entity.FeeType;
import com.property.mapper.FeeMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeMapper feeMapper;

    public FeeController(FeeMapper feeMapper) {
        this.feeMapper = feeMapper;
    }

    @GetMapping("/types")
    public List<FeeType> listTypes() {
        return feeMapper.findAllTypes();
    }

    @PostMapping("/types")
    public ResponseEntity<?> createType(@RequestBody FeeType feeType) {
        if (feeType.getName() == null || feeType.getUnitPrice() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "名称和单价不能为空"));
        }
        if (feeType.getUnit() == null) feeType.setUnit("元/月");
        feeMapper.insertType(feeType);
        return ResponseEntity.status(HttpStatus.CREATED).body(feeType);
    }

    @GetMapping("/bills")
    public List<Bill> listBills(@RequestParam(required = false) String status,
                                @RequestParam(required = false) Integer unit_id) {
        return feeMapper.findAllBills(status, unit_id);
    }

    @PostMapping("/bills")
    public ResponseEntity<?> createBill(@RequestBody Bill bill) {
        if (bill.getUnitId() == null || bill.getFeeTypeId() == null || bill.getAmount() == null || bill.getPeriod() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "房屋、费用类型、金额和账期不能为空"));
        }
        feeMapper.insertBill(bill);
        return ResponseEntity.status(HttpStatus.CREATED).body(feeMapper.findBillById(bill.getId()));
    }

    @PostMapping("/bills/{id}/pay")
    public ResponseEntity<?> payBill(@PathVariable Integer id) {
        Bill bill = feeMapper.findBillById(id);
        if (bill == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "账单不存在"));
        if ("已缴".equals(bill.getStatus())) return ResponseEntity.badRequest().body(Map.of("message", "账单已缴纳"));
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        feeMapper.payBill(id, now);
        return ResponseEntity.ok(feeMapper.findBillById(id));
    }

    @DeleteMapping("/bills/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Integer id) {
        if (feeMapper.deleteBill(id) == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "账单不存在"));
        }
        return ResponseEntity.ok(new MessageResponse("删除成功"));
    }
}
