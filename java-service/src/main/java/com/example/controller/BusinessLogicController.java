package com.example.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/business")
public class BusinessLogicController {
    @PostMapping("/moderate-comment")
    public ResponseEntity<Map<String, Object>> moderateComment(@RequestBody Map<String, String> body) {
        String comment = body.getOrDefault("comment", "");
        boolean isClean = !comment.toLowerCase().contains("badword"); // Example moderation
        return ResponseEntity.ok(Map.of(
            "comment", comment,
            "isClean", isClean,
            "reason", isClean ? "OK" : "Inappropriate language detected"
        ));
    }
}
