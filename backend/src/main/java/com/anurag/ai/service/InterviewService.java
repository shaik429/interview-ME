
package com.anurag.ai.service;

import com.anurag.ai.dto.CreateInterviewRequest;
import com.anurag.ai.dto.EvaluateAnswerRequest;
import com.anurag.ai.dto.InterviewAnswerResponse;
import com.anurag.ai.dto.InterviewResponse;
import com.anurag.ai.entity.InterviewAnswer;
import com.anurag.ai.entity.InterviewSession;
import com.anurag.ai.repository.InterviewAnswerRepository;
import com.anurag.ai.repository.InterviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository repository;
    private final InterviewAnswerRepository answerRepository;
    private final OllamaService ollamaService;

    public InterviewService(
            InterviewRepository repository,
            InterviewAnswerRepository answerRepository,
            OllamaService ollamaService) {

        this.repository = repository;
        this.answerRepository = answerRepository;
        this.ollamaService = ollamaService;
    }

    // Create an interview and save it in MySQL
    @Transactional
    public InterviewResponse createInterview(
            CreateInterviewRequest request) {

        String prompt = """
                You are an experienced technical interviewer.

                Create exactly %d interview questions for the role: %s.
                Difficulty: %s.

                Requirements:
                - Number each question.
                - Make questions relevant to the specified role.
                - Cover important technical concepts and practical scenarios.
                - Do not provide answers.
                - Return only the numbered questions.
                """.formatted(
                request.questionCount(),
                request.role(),
                request.difficulty()
        );

        String questions = ollamaService.generate(prompt);

        InterviewSession session = new InterviewSession();
        session.setRole(request.role());
        session.setDifficulty(request.difficulty());
        session.setQuestions(questions);

        InterviewSession saved = repository.save(session);

        return toResponse(saved);
    }

    // Retrieve all interview sessions
    @Transactional(readOnly = true)
    public List<InterviewResponse> getAllInterviews() {

        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Retrieve one interview session
    @Transactional(readOnly = true)
    public InterviewResponse getInterview(Long id) {

        InterviewSession session = repository.findById(id)
                .orElseThrow(() ->
                        new InterviewNotFoundException(id));

        return toResponse(session);
    }

    // Evaluate an answer and save it in MySQL
    @Transactional
    public String evaluateAnswer(EvaluateAnswerRequest request) {

        InterviewSession session = repository.findById(
                        request.sessionId())
                .orElseThrow(() ->
                        new InterviewNotFoundException(
                                request.sessionId()));

        String prompt = """
                You are a fair and experienced technical interview evaluator.

                Evaluate the candidate's answer.

                Question:
                %s

                Candidate's answer:
                %s

                Provide:
                1. Score out of 10.
                2. What was correct.
                3. What was missing or incorrect.
                4. A suggested improved answer.
                5. One practical tip for improvement.

                Be constructive and accurate.
                Do not award a high score merely because the answer is long.
                """.formatted(
                request.question(),
                request.answer()
        );

        String feedback = ollamaService.generate(prompt);

        InterviewAnswer interviewAnswer = new InterviewAnswer();
        interviewAnswer.setSession(session);
        interviewAnswer.setQuestion(request.question());
        interviewAnswer.setAnswer(request.answer());
        interviewAnswer.setFeedback(feedback);

        answerRepository.save(interviewAnswer);

        return feedback;
    }

    // Retrieve all saved answers for one interview
    @Transactional(readOnly = true)
    public List<InterviewAnswerResponse> getInterviewAnswers(
            Long sessionId) {

        // Verify that the interview exists
        if (!repository.existsById(sessionId)) {
            throw new InterviewNotFoundException(sessionId);
        }

        return answerRepository
                .findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(answer -> new InterviewAnswerResponse(
                        answer.getId(),
                        answer.getSession().getId(),
                        answer.getQuestion(),
                        answer.getAnswer(),
                        answer.getFeedback(),
                        answer.getCreatedAt()
                ))
                .toList();
    }

    // Convert interview entity to API response
    private InterviewResponse toResponse(InterviewSession session) {

        return new InterviewResponse(
                session.getId(),
                session.getRole(),
                session.getDifficulty(),
                session.getQuestions(),
                session.getCreatedAt()
        );
    }

    // Exception for missing interviews
    public static class InterviewNotFoundException
            extends RuntimeException {

        public InterviewNotFoundException(Long id) {
            super("Interview session not found: " + id);
        }
    }
}
