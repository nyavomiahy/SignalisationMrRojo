package com.example.service;


import com.example.entities.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createIfNotExists(String uid, String email) {
        return userRepository.findByFirebaseUid(uid)
                .orElseGet(() -> {
                    User user = new User();
                    user.setFirebaseUid(uid);
                    user.setEmail(email);
                    user.setRole("USER");
                    return userRepository.save(user);
                });
    }

    public User findByUid(String uid) {
        return userRepository.findByFirebaseUid(uid)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
