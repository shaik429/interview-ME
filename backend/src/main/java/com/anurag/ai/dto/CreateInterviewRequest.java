package com.anurag.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateInterviewRequest(
        @NotBlank String role,
        @NotBlank String difficulty,
        @Min(1) @Max(15) int questionCount
) {
}