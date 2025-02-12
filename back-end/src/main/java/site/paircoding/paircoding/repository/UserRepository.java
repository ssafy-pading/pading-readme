package site.paircoding.paircoding.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
  Optional<User> findByEmail(String email);
  Optional<User> findByProviderAndProviderId(String provider, String providerId);
}