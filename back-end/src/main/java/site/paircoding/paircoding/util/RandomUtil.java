package site.paircoding.paircoding.util;

import java.util.Random;

public class RandomUtil {

  private static final Random RANDOM = new Random();
  private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyz";

  public static String generateRandomCode(final char leftLimit, final char rightLimit,
      final int limit) {
    return RANDOM.ints(leftLimit, rightLimit + 1)
        .filter(i -> Character.isAlphabetic(i) || Character.isDigit(i))
        .limit(limit)
        .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
        .toString();
  }


  public static String generateRandomString() {
    Random random = new Random();
    StringBuilder randomString = new StringBuilder();

    // 4자리 알파벳 생성
    for (int i = 0; i < 4; i++) {
      randomString.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
    }

    return randomString.toString();
  }
}
