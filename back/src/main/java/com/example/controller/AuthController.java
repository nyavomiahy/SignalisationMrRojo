package com.example.controller;
import com.example.entities.*;
import com.example.service.*;
import com.example.firebase.*;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private FirebaseAuthService firebaseAuthService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestHeader("Authorization") String token) {
        try {
            FirebaseToken decoded = firebaseAuthService.verifyToken(token);
            User user = userService.createIfNotExists(
                    decoded.getUid(),
                    decoded.getEmail()
            );

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token invalide");
        }
    }
}
