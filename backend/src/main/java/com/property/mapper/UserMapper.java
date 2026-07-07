package com.property.mapper;

import com.property.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(String username);

    @Select("SELECT id, username, name, role, phone FROM users WHERE id = #{id}")
    User findById(Integer id);

    int count();

    int insert(User user);
}
