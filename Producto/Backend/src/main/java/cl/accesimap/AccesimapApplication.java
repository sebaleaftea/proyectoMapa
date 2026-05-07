package cl.accesimap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AccesimapApplication {

    public static void main(String[] args) {
        SpringApplication.run(AccesimapApplication.class, args);
    }
}
