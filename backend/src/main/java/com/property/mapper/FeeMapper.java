package com.property.mapper;

import com.property.entity.Bill;
import com.property.entity.FeeType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface FeeMapper {
    List<FeeType> findAllTypes();
    int insertType(FeeType feeType);
    List<Bill> findAllBills(@Param("communityId") Integer communityId,
                            @Param("status") String status,
                            @Param("unitId") Integer unitId);
    Bill findBillById(Integer id);
    int insertBill(Bill bill);
    int payBill(@Param("id") Integer id, @Param("paidAt") String paidAt);
    int deleteBill(Integer id);
    Map<String, Object> countUnpaidAmount();
    Map<String, Object> countPaidAmount();
}
