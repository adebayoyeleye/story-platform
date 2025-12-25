package com.storyplatform.contentservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI contentServiceApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Story Platform – Content Service")
                        .version("v1")
                        .description("Stories, chapters, and publishing lifecycle"));
    }
}
