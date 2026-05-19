package com.educore.service;

import com.educore.dto.QuestionRequestDTO;
import com.educore.dto.QuizRequestDTO;
import com.educore.dto.QuizResponseDTO;
import com.educore.dto.QuizSubmissionDTO;
import com.educore.entity.Lecture;
import com.educore.entity.Question;
import com.educore.entity.Quiz;
import com.educore.repository.LectureRepository;
import com.educore.repository.QuestionRepository;
import com.educore.repository.QuizRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final LectureRepository lectureRepository;

    public QuizResponseDTO createQuiz(Long lectureId, QuizRequestDTO request) {
        Lecture lecture = lectureRepository.findById(lectureId)
            .orElseThrow(() -> new RuntimeException("Lecture not found"));

        if (quizRepository.findByLecture_Id(lectureId).isPresent()) {
            throw new RuntimeException("Quiz already exists for this lecture");
        }

        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setLecture(lecture);

        Quiz savedQuiz = quizRepository.save(quiz);

        return mapToQuizResponseDTO(savedQuiz, List.of());
    }

    public QuizResponseDTO addQuestion(Long quizId, QuestionRequestDTO request) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found"));

        String normalizedCorrectAnswer = request.getCorrectAnswer().trim().toUpperCase();
        if (!List.of("A", "B", "C", "D").contains(normalizedCorrectAnswer)) {
            throw new RuntimeException("Correct answer must be A, B, C, or D");
        }

        Question question = new Question();
        question.setQuestion(request.getQuestion());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(normalizedCorrectAnswer);
        question.setQuiz(quiz);

        questionRepository.save(question);

        List<Question> updatedQuestions = questionRepository.findByQuiz_Id(quizId);
        return mapToQuizResponseDTO(quiz, updatedQuestions);
    }

    public QuizResponseDTO getQuizByLecture(Long lectureId) {
        Quiz quiz = quizRepository.findByLecture_Id(lectureId)
            .orElseThrow(() -> new RuntimeException("Quiz not found for this lecture"));

        List<Question> questions = questionRepository.findByQuiz_Id(quiz.getId());
        return mapToQuizResponseDTO(quiz, questions);
    }

    public Map<String, Object> submitQuiz(Long quizId, QuizSubmissionDTO submissionDTO) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<Question> questions = questionRepository.findByQuiz_Id(quiz.getId());

        if (questions.isEmpty()) {
            throw new RuntimeException("No questions found for this quiz");
        }

        int score = 0;
        Map<Long, String> answers = submissionDTO.getAnswers();

        for (Question question : questions) {
            String submittedAnswer = answers.get(question.getId());

            if (submittedAnswer != null
                && question.getCorrectAnswer().equalsIgnoreCase(submittedAnswer.trim())) {
                score++;
            }
        }

        int totalQuestions = questions.size();
        double percentage = ((double) score / totalQuestions) * 100;

        return Map.of(
            "quizId", quiz.getId(),
            "score", score,
            "totalQuestions", totalQuestions,
            "percentage", percentage
        );
    }

    private QuizResponseDTO mapToQuizResponseDTO(Quiz quiz, List<Question> questions) {
        List<QuizResponseDTO.QuestionItemDTO> questionItems = questions.stream()
            .map(question -> new QuizResponseDTO.QuestionItemDTO(
                question.getId(),
                question.getQuestion(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD()
            ))
            .toList();

        return new QuizResponseDTO(
            quiz.getId(),
            quiz.getTitle(),
            quiz.getLecture().getId(),
            questionItems
        );
    }
}
