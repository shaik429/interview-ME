package com.anurag.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient;
    private final String model;

    public OllamaService(
            RestClient ollamaRestClient,
            @Value("${ollama.model}") String model) {
        this.restClient = ollamaRestClient;
        this.model = model;
    }

    public String generate(String prompt) {

        Map<String, Object> request = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        OllamaResponse response = restClient.post()
                .uri("/api/generate")
                .body(request)
                .retrieve()
                .body(OllamaResponse.class);

        if (response == null || response.response() == null) {
            throw new IllegalStateException(
                    "Ollama returned an empty response");
        }

        return response.response();
    }

    private record OllamaResponse(String response) {
    }
}