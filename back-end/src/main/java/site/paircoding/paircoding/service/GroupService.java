package site.paircoding.paircoding.service;

import java.util.List;
import java.util.UnknownFormatConversionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.Group;
import site.paircoding.paircoding.global.error.ErrorCode;
import site.paircoding.paircoding.global.exception.BadRequestException;
import site.paircoding.paircoding.repository.GroupRepository;
import site.paircoding.paircoding.repository.GroupUserRepository;
import site.paircoding.paircoding.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class GroupService {
  private final GroupRepository groupRepository;
  private final GroupUserRepository groupUserRepository;
  private final UserRepository userRepository;


  public void getGroups() {
  }
}
