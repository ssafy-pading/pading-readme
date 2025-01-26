package site.paircoding.paircoding.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.paircoding.paircoding.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

}
