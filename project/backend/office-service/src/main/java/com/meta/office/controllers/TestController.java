package com.meta.office.controllers;

import com.meta.office.utils.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/os/v1/test")
public class TestController {

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public String test() {
        return jwtUtil.getUserIdFromToken();

    }

}
