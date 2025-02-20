package site.paircoding.paircoding.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import site.paircoding.paircoding.entity.ChatDocument;

@Repository
public interface ChatRepository extends MongoRepository<ChatDocument, String> {

  // 특정 채팅방의 메시지를 시간순으로 조회
  List<ChatDocument> findByProjectIdOrderByCreatedAtAsc(Integer chatRoomId);
}