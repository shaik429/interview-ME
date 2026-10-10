
package com.anurag.ai.dto;

import java.time.LocalDateTime;

public record InterviewAnswerResponse(
        Long id,
        Long sessionId,
        String question,
        String answer,
        String feedback,
        LocalDateTime createdAt
) {}
