package site.paircoding.paircoding.util;

import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisUtil {

  private final RedisTemplate<String, Object> redisTemplate;

  /**
   * Redis에 키-값 쌍을 저장합니다.
   *
   * @param key   값이 저장될 키
   * @param value 저장할 값
   */
  public void set(String key, Object value) {
    redisTemplate.opsForValue().set(key, value);
  }

  /**
   * 주어진 키에 해당하는 값을 Redis에서 가져옵니다.
   *
   * @param key 값을 가져올 키
   * @return 지정된 키에 해당하는 값, 키가 존재하지 않으면 null
   */
  public Object get(String key) {
    return redisTemplate.opsForValue().get(key);
  }

  /**
   * 주어진 키에 해당하는 키-값 쌍을 Redis에서 삭제합니다.
   *
   * @param key 삭제할 키
   */
  public void delete(String key) {
    redisTemplate.delete(key);
  }

  /**
   * 만료 시간을 설정하여 키-값 쌍을 Redis에 저장합니다.
   *
   * @param key     값이 저장될 키
   * @param value   저장할 값
   * @param timeout 만료 시간(초 단위)
   */
  public void setex(String key, Object value, long timeout) {
    redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.SECONDS);
  }

  public long getExpire(String key) {
    return redisTemplate.getExpire(key, TimeUnit.SECONDS);
  }
}