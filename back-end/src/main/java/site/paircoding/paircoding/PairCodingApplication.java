package site.paircoding.paircoding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PairCodingApplication {

	public static void main(String[] args) {
		SpringApplication.run(PairCodingApplication.class, args);
	}

}
