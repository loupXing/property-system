package com.property.mapper;

import com.property.entity.Community;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CommunityMapper {
    List<Community> findAllWithStats();
    Community findById(Integer id);
    int insert(Community community);
    int update(Community community);
    int deleteById(Integer id);
}
