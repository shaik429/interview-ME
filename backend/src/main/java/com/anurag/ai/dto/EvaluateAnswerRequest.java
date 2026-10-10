package com.anurag.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EvaluateAnswerRequest(

        @NotNull
        Long sessionId,

        @NotBlank
        String question,

        @NotBlank
        String answer

) {}
