package com.property.mapper;

import com.property.entity.Announcement;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AnnouncementMapper {
    List<Announcement> findAll();
    Announcement findById(Integer id);
    int insert(Announcement announcement);
    int update(Announcement announcement);
    int deleteById(Integer id);
}
