package site.paircoding.paircoding.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.dto.MypageDto;
import site.paircoding.paircoding.global.exception.NotFoundException;
import site.paircoding.paircoding.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;

  public void deleteUser(Integer userId) {
    userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User Not Found"));
    userRepository.deleteById(userId);
  }
}
