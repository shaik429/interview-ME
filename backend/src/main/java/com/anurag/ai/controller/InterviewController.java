
package com.anurag.ai.controller;

import com.anurag.ai.dto.CreateInterviewRequest;
import com.anurag.ai.dto.EvaluateAnswerRequest;
import com.anurag.ai.dto.InterviewAnswerResponse;
import com.anurag.ai.dto.InterviewResponse;
import com.anurag.ai.service.InterviewService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    // Create a new interview
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse createInterview(
            @Valid @RequestBody CreateInterviewRequest request) {

        return interviewService.createInterview(request);
    }

    // Get all interview sessions
    @GetMapping
    public List<InterviewResponse> getAllInterviews() {

        return interviewService.getAllInterviews();
    }

    // Get one interview session
    @GetMapping("/{id}")
    public InterviewResponse getInterview(@PathVariable Long id) {

        return interviewService.getInterview(id);
    }

    // Evaluate an answer and save it in MySQL
    @PostMapping("/evaluate")
    public Map<String, String> evaluateAnswer(
            @Valid @RequestBody EvaluateAnswerRequest request) {

        String feedback = interviewService.evaluateAnswer(request);

        return Map.of("feedback", feedback);
    }

    // Get saved answers and AI feedback for an interview
    @GetMapping("/{id}/answers")
    public List<InterviewAnswerResponse> getInterviewAnswers(
            @PathVariable Long id) {

        return interviewService.getInterviewAnswers(id);
    }
}
