# Quiz APIs Documentation

This document covers all Quiz-related APIs with accurate response DTO shapes.

**Base URL:** `/sis_api` (e.g., `https://your-host/sis_api`)

---

## Table of Contents

1. [Quiz APIs](#1-quiz-apis)
2. [QuizAttempt APIs](#2-quizattempt-apis)
3. [QuizSection APIs](#3-quizsection-apis)
4. [QuizAnswer APIs](#4-quizanswer-apis)
5. [QuizQuestion APIs](#5-quizquestion-apis)
6. [QuizGradeSync APIs](#6-quizgradesync-apis)
7. [DTO Reference](#7-dto-reference)
8. [Enums Reference](#8-enums-reference)

---

## 1. Quiz APIs

### 1.1 GET /Quiz — Get All Quizzes

```
GET /sis_api/Quiz
```

**Response DTO:** `objects: QuizDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "title": "Midterm Exam",
      "description": "Chapter 1-5",
      "universityId": 1,
      "courseDegreeDevisionCourseId": 1,
      "courseId": 100,
      "courseTitle": "Intro to Programming",
      "createdByPersonId": 50,
      "totalMark": 20.0,
      "passingMark": 10.0,
      "timeLimitMinutes": 60,
      "maxAttempts": 2,
      "shuffleQuestions": true,
      "shuffleOptions": true,
      "showResultAfterSubmit": true,
      "showCorrectAnswers": false,
      "showCorrectAnswersAfterAttempt": false,
      "allowBackNavigation": true,
      "autoSubmitOnTimeout": true,
      "availableFrom": "2025-03-01T09:00:00",
      "availableTo": "2025-03-15T23:59:00",
      "status": 2,
      "isGradePublished": false,
      "publishedToFinalGrade": false
    }
  ]
}
```

---

### 1.2 POST /Quiz — Create Quiz

```
POST /sis_api/Quiz
Content-Type: application/json
```

**Payload (QuizCreateDto):**
```json
{
  "title": "Midterm Exam",
  "description": "Chapter 1-5",
  "courseId": 100,
  "totalMark": 20,
  "passingMark": 10,
  "timeLimitMinutes": 60,
  "maxAttempts": 2,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showResultAfterSubmit": true,
  "showCorrectAnswers": false,
  "showCorrectAnswersAfterAttempt": false,
  "allowBackNavigation": true,
  "autoSubmitOnTimeout": true
}
```

**Response DTO:** `singleObject: QuizDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الإنشاء بنجاح",
  "statusCode": null,
  "singleObject": {
    "id": 1,
    "title": "Midterm Exam",
    "description": "Chapter 1-5",
    "universityId": 1,
    "courseDegreeDevisionCourseId": 1,
    "courseId": 100,
    "courseTitle": null,
    "createdByPersonId": 50,
    "totalMark": 20.0,
    "passingMark": 10.0,
    "timeLimitMinutes": 60,
    "maxAttempts": 2,
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "showResultAfterSubmit": true,
    "showCorrectAnswers": false,
    "showCorrectAnswersAfterAttempt": false,
    "allowBackNavigation": true,
    "autoSubmitOnTimeout": true,
    "availableFrom": null,
    "availableTo": null,
    "status": 1,
    "isGradePublished": false,
    "publishedToFinalGrade": false
  }
}
```

---

### 1.3 PUT /Quiz — Update Quiz

```
PUT /sis_api/Quiz
Content-Type: application/json
```

**Payload (QuizUpdateDto):**
```json
{
  "id": 1,
  "title": "Midterm Exam - Updated",
  "description": "Chapter 1-6",
  "totalMark": 25,
  "passingMark": 12,
  "timeLimitMinutes": 90,
  "maxAttempts": 2,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showResultAfterSubmit": true,
  "showCorrectAnswers": false,
  "showCorrectAnswersAfterAttempt": false,
  "allowBackNavigation": true,
  "autoSubmitOnTimeout": true,
  "status": 1
}
```

**Response DTO:** `singleObject: QuizDto` (same shape as [1.2](#12-post-quiz--create-quiz))

---

### 1.4 DELETE /Quiz/{id} — Delete Quiz

```
DELETE /sis_api/Quiz/1?softDelete=true
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الحذف بنجاح",
  "statusCode": null
}
```

---

### 1.5 GET /Quiz/{id} — Get Quiz by ID (with Sections and Questions)

```
GET /sis_api/Quiz/1
```

**Response DTO:** `singleObject: QuizDetailDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "id": 1,
    "title": "Midterm Exam",
    "description": "Chapter 1-5",
    "universityId": 1,
    "courseDegreeDevisionCourseId": 1,
    "courseId": 100,
    "courseTitle": "Intro to Programming",
    "createdByPersonId": 50,
    "totalMark": 20.0,
    "courseDivisionMark": 20.0,
    "passingMark": 10.0,
    "timeLimitMinutes": 60,
    "maxAttempts": 2,
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "showResultAfterSubmit": true,
    "showCorrectAnswers": false,
    "showCorrectAnswersAfterAttempt": false,
    "allowBackNavigation": true,
    "autoSubmitOnTimeout": true,
    "availableFrom": "2025-03-01T09:00:00",
    "availableTo": "2025-03-15T23:59:00",
    "status": 2,
    "isGradePublished": false,
    "publishedToFinalGrade": false,
    "sections": [
      {
        "id": 1,
        "quizId": 1,
        "title": "Section 1",
        "instructions": "Choose the correct answer",
        "sortOrder": 1,
        "totalMarks": 20.0,
        "autoGenerate": false,
        "autoGenQuestionCount": null,
        "autoGenQuestionType": null,
        "autoGenDifficultyLevelId": null,
        "questions": [
          {
            "id": 1,
            "quizId": 1,
            "quizSectionId": 1,
            "questionId": 101,
            "sortOrder": 1,
            "marks": 10.0,
            "isRequired": true,
            "version": 1,
            "questionText": "What is 2 + 2?",
            "questionType": 1,
            "options": [
              { "id": 1, "optionText": "3", "isCorrect": false, "sortOrder": 1 },
              { "id": 2, "optionText": "4", "isCorrect": true, "sortOrder": 2 }
            ],
            "matchPairs": [],
            "prompts": null,
            "answers": null
          }
        ]
      }
    ],
    "questionsWithoutSection": []
  }
}
```

---

### 1.6 GET /Quiz/ByCourse/{courseId} — Get Quizzes by Course

```
GET /sis_api/Quiz/ByCourse/100
```

**Response DTO:** `objects: QuizDto[]` (same shape as [1.1](#11-get-quiz--get-all-quizzes))

---

### 1.7 GET /Quiz/Available — Get Available Quizzes for Student

```
GET /sis_api/Quiz/Available
```
*Uses claims: PersonId, UniversityId, PersonType.*

**Response DTO:** `objects: QuizDto[]` (same shape as [1.1](#11-get-quiz--get-all-quizzes))

---

### 1.8 GET /Quiz/Assigned — Get Assigned Quizzes for Student

```
GET /sis_api/Quiz/Assigned
```
*Uses claims: PersonId, UniversityId, PersonType.*

**Response DTO:** `objects: StudentAssignedQuizDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "title": "Midterm Exam",
      "description": "Chapter 1-5",
      "courseId": 100,
      "courseTitle": "Intro to Programming",
      "courseSemesterSectionId": 15,
      "availableFrom": "2025-03-01T09:00:00",
      "availableTo": "2025-03-15T23:59:00",
      "status": 2,
      "attemptStatus": 2,
      "totalMark": 20.0,
      "passingMark": 10.0,
      "timeLimitMinutes": 60,
      "maxAttempts": 2,
      "isGradePublished": false,
      "publishedToFinalGrade": false,
      "attemptCount": 1,
      "isAvailableNow": true
    }
  ]
}
```

---

### 1.9 GET /Quiz/Assigned/ByCourse/{courseId} — Get Assigned Quizzes in Course for Student

```
GET /sis_api/Quiz/Assigned/ByCourse/100
```
*Uses claims: PersonId, UniversityId, PersonType.*

**Response DTO:** `objects: StudentAssignedQuizDto[]` (same shape as [1.8](#18-get-quizassigned--get-assigned-quizzes-for-student))

---

### 1.10 POST /Quiz/Bulk — Create Quiz with Sections and Questions

```
POST /sis_api/Quiz/Bulk
Content-Type: application/json
```

**Payload (QuizBulkCreateDto):**
```json
{
  "title": "Full Quiz",
  "description": "All chapters",
  "courseDegreeDevisionCourseId": 1,
  "courseId": 100,
  "totalMark": 50,
  "passingMark": 25,
  "timeLimitMinutes": 120,
  "maxAttempts": 1,
  "shuffleQuestions": true,
  "shuffleOptions": true,
  "showResultAfterSubmit": true,
  "showCorrectAnswers": false,
  "showCorrectAnswersAfterAttempt": false,
  "allowBackNavigation": true,
  "autoSubmitOnTimeout": true,
  "sections": [
    {
      "title": "Section 1 - Multiple Choice",
      "instructions": "Choose the correct answer",
      "sortOrder": 1,
      "totalMarks": 30,
      "autoGenerate": false,
      "autoGenQuestionCount": null,
      "autoGenQuestionType": null,
      "autoGenDifficultyLevelId": null
    }
  ],
  "questions": [
    {
      "questionId": 101,
      "sectionIndex": 0,
      "sortOrder": 1,
      "marks": 10,
      "isRequired": true
    }
  ]
}
```

**Response DTO:** `singleObject: QuizDto` (same shape as [1.2](#12-post-quiz--create-quiz))

---

### 1.11 PUT /Quiz/Bulk/{id} — Update Quiz (Bulk Replace)

```
PUT /sis_api/Quiz/Bulk/1
Content-Type: application/json
```

**Payload:** Same as `POST /Quiz/Bulk`. Replaces existing sections and questions.

**Response DTO:** `singleObject: QuizDto` (same shape as [1.2](#12-post-quiz--create-quiz))

---

### 1.12 PUT /Quiz/Publish/{id} — Publish Quiz

```
PUT /sis_api/Quiz/Publish/1
Content-Type: application/json
```

**Payload (QuizPublishDto):**
```json
{
  "courseSemesterSectionId": 15,
  "availableFrom": "2025-03-01T09:00:00",
  "availableTo": "2025-03-15T23:59:00"
}
```
*Duplicates the draft quiz into a new Published quiz, copies sections and questions, assigns to the specified course section, and inserts `CourseSemesterSectionQuiz` rows. Returns the new published quiz (new `id`).*

**Response DTO:** `singleObject: QuizDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم نشر الامتحان بنجاح",
  "statusCode": null,
  "singleObject": {
    "id": 2,
    "title": "Midterm Exam",
    "description": "Chapter 1-5",
    "universityId": 1,
    "courseDegreeDevisionCourseId": 1,
    "courseId": 100,
    "courseTitle": "Intro to Programming",
    "createdByPersonId": 50,
    "totalMark": 20.0,
    "passingMark": 10.0,
    "timeLimitMinutes": 60,
    "maxAttempts": 2,
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "showResultAfterSubmit": true,
    "showCorrectAnswers": false,
    "showCorrectAnswersAfterAttempt": false,
    "allowBackNavigation": true,
    "autoSubmitOnTimeout": true,
    "availableFrom": "2025-03-01T09:00:00",
    "availableTo": "2025-03-15T23:59:00",
    "status": 2,
    "isGradePublished": false,
    "publishedToFinalGrade": false
  }
}
```
*Note: The returned quiz has a new `id` (the duplicated published quiz), not the original draft id.*

---

### 1.13 PUT /Quiz/Close/{id} — Close Quiz

```
PUT /sis_api/Quiz/Close/1
```

**Response DTO:** `singleObject: QuizDto` (same shape as [1.2](#12-post-quiz--create-quiz), `status` will be `3`)

---

### 1.14 GET /Quiz/WithAttemptData/{quizId} — Get Quiz with Student Attempt Answers

```
GET /sis_api/Quiz/WithAttemptData/1
Content-Type: application/json  (optional body: personId as int)
```

*Student: logged user must be assigned to the quiz. Correct answers shown only if `quiz.ShowCorrectAnswers`.*
*Teacher: pass `personId` in body to view that student's attempt with correct answers.*

**Response DTO:** `singleObject: QuizWithAttemptDataDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "id": 1,
    "title": "Midterm Exam",
    "description": "Chapter 1-5",
    "universityId": 1,
    "courseDegreeDevisionCourseId": 1,
    "courseId": 100,
    "courseTitle": "Intro to Programming",
    "createdByPersonId": 50,
    "totalMark": 20.0,
    "courseDivisionMark": 20.0,
    "passingMark": 10.0,
    "timeLimitMinutes": 60,
    "maxAttempts": 2,
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "showResultAfterSubmit": true,
    "showCorrectAnswers": false,
    "allowBackNavigation": true,
    "autoSubmitOnTimeout": true,
    "availableFrom": "2025-03-01T09:00:00",
    "availableTo": "2025-03-15T23:59:00",
    "status": 2,
    "isGradePublished": false,
    "publishedToFinalGrade": false,
    "attemptId": 5,
    "attemptNumber": 1,
    "viewedPersonId": null,
    "includeCorrectAnswers": false,
    "sections": [
      {
        "id": 1,
        "quizId": 1,
        "title": "Section 1",
        "instructions": "Choose the correct answer",
        "sortOrder": 1,
        "totalMarks": 20.0,
        "autoGenerate": false,
        "autoGenQuestionCount": null,
        "autoGenQuestionType": null,
        "autoGenDifficultyLevelId": null,
        "questions": [
          {
            "id": 1,
            "quizId": 1,
            "quizSectionId": 1,
            "questionId": 101,
            "sortOrder": 1,
            "marks": 10.0,
            "isRequired": true,
            "version": 1,
            "questionText": "What is 2 + 2?",
            "questionType": 1,
            "options": [
              { "id": 1, "optionText": "3", "isCorrect": false, "sortOrder": 1 },
              { "id": 2, "optionText": "4", "isCorrect": false, "sortOrder": 2 }
            ],
            "matchPairs": [],
            "prompts": null,
            "answers": null,
            "studentAnswer": {
              "id": 10,
              "quizAttemptId": 5,
              "quizQuestionId": 1,
              "selectedOptionId": 2,
              "selectedOptionIds": null,
              "textAnswer": null,
              "matchingAnswer": null,
              "orderingAnswer": null,
              "isCorrect": true,
              "score": 10.0,
              "maxScore": 10.0,
              "answeredAt": "2025-03-10T09:15:00",
              "marked": false
            }
          }
        ]
      }
    ],
    "questionsWithoutSection": []
  }
}
```

---

### 1.15 GET /Quiz/StudentsStatus/{quizId} — Get Students Status for Teacher

```
GET /sis_api/Quiz/StudentsStatus/1
```
*Logged user must be the quiz creator. Returns all assigned students with their attempt status.*

**Response DTO:** `objects: TeacherQuizStudentStatusItemDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "personId": 200,
      "studentEnrollmentId": 100,
      "studentNameAr": "محمد أحمد",
      "studentNameEn": "Mohamed Ahmed",
      "hasAttempted": true,
      "attemptStatus": 2,
      "attemptStatusDisplay": "تم التسليم",
      "attemptCount": 1,
      "lastAttemptAt": "2025-03-10T10:05:00",
      "bestScore": 15.0,
      "maxPossibleScore": 20.0
    },
    {
      "personId": 201,
      "studentEnrollmentId": 101,
      "studentNameAr": "فاطمة علي",
      "studentNameEn": "Fatima Ali",
      "hasAttempted": false,
      "attemptStatus": null,
      "attemptStatusDisplay": "لم يدخل الامتحان",
      "attemptCount": 0,
      "lastAttemptAt": null,
      "bestScore": null,
      "maxPossibleScore": null
    }
  ]
}
```

---

### 1.16 GET /Quiz/LastAttemptForManualGrading/{quizId}/{personId} — Get Attempt for Manual Grading

```
GET /sis_api/Quiz/LastAttemptForManualGrading/1/200
```
*Teacher only. Returns the last attempt with questions where `IsCorrect == null` (pending manual grading).*

**Response DTO:** `singleObject: TeacherQuizAttemptForGradingDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "quizId": 1,
    "quizTitle": "Midterm Exam",
    "attemptId": 5,
    "attemptNumber": 1,
    "startedAt": "2025-03-10T09:00:00",
    "submittedAt": "2025-03-10T10:05:00",
    "timeSpentSeconds": 3900,
    "status": 2,
    "totalScore": 15.0,
    "maxPossibleScore": 20.0,
    "scorePercent": 75.0,
    "isPassed": true,
    "totalQuestionsCount": 10,
    "autoGradedCount": 8,
    "manualGradedCount": 1,
    "pendingManualGradingCount": 1,
    "studentPersonId": 200,
    "studentNameAr": "محمد أحمد",
    "studentNameEn": "Mohamed Ahmed",
    "questionsForManualGrading": [
      {
        "id": 3,
        "quizId": 1,
        "quizSectionId": 1,
        "questionId": 103,
        "sortOrder": 3,
        "marks": 5.0,
        "isRequired": true,
        "version": 1,
        "questionText": "Explain the concept of recursion.",
        "questionType": 3,
        "options": [],
        "matchPairs": [],
        "prompts": null,
        "answers": null,
        "studentAnswer": {
          "id": 12,
          "quizAttemptId": 5,
          "quizQuestionId": 3,
          "selectedOptionId": null,
          "selectedOptionIds": null,
          "textAnswer": "Recursion is a function calling itself...",
          "matchingAnswer": null,
          "orderingAnswer": null,
          "isCorrect": null,
          "score": null,
          "maxScore": 5.0,
          "answeredAt": "2025-03-10T09:30:00",
          "marked": false
        }
      }
    ]
  }
}
```

---

### 1.17 POST /Quiz/SubmitManualGrading/{quizId}/{personId} — Submit Manual Grading

```
POST /sis_api/Quiz/SubmitManualGrading/1/200
Content-Type: application/json
```
*Teacher only. Updates `QuizAnswer` rows and recalculates the attempt totals.*

**Payload (ManualGradingSubmitDto):**
```json
{
  "gradingItems": [
    {
      "quizQuestionId": 3,
      "score": 4.0,
      "isCorrect": true,
      "manualGraderComment": "Good explanation, minor points deducted."
    }
  ]
}
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم التصحيح بنجاح",
  "statusCode": null
}
```

---

## 2. QuizAttempt APIs

### 2.1 GET /QuizAttempt — Get All Quiz Attempts

```
GET /sis_api/QuizAttempt
```

**Response DTO:** `objects: QuizAttemptDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "quizId": 1,
      "studentEnrollmentId": 100,
      "attemptNumber": 1,
      "startedAt": "2025-03-10T09:00:00",
      "submittedAt": "2025-03-10T10:05:00",
      "timeSpentSeconds": 3900,
      "status": 2,
      "totalScore": 15.0,
      "maxPossibleScore": 20.0,
      "finalScore": 15.0,
      "scorePercent": 75.0,
      "isPassed": true,
      "isAutoGraded": true,
      "gradedByPersonId": null,
      "gradedAt": null,
      "ipAddress": "192.168.1.1",
      "browserInfo": "Chrome"
    }
  ]
}
```

---

### 2.2 POST /QuizAttempt — Start Attempt

```
POST /sis_api/QuizAttempt
Content-Type: application/json
```

**Payload (QuizAttemptCreateDto):**
```json
{
  "quizId": 1
}
```

**Response DTO:** `singleObject: QuizAttemptDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الإنشاء بنجاح",
  "statusCode": null,
  "singleObject": {
    "id": 1,
    "quizId": 1,
    "studentEnrollmentId": 100,
    "attemptNumber": 1,
    "startedAt": "2025-03-10T09:00:00",
    "submittedAt": null,
    "timeSpentSeconds": null,
    "status": 1,
    "totalScore": null,
    "maxPossibleScore": null,
    "finalScore": null,
    "scorePercent": null,
    "isPassed": null,
    "isAutoGraded": false,
    "gradedByPersonId": null,
    "gradedAt": null,
    "ipAddress": null,
    "browserInfo": null
  }
}
```

---

### 2.3 PUT /QuizAttempt — Update Quiz Attempt

```
PUT /sis_api/QuizAttempt
Content-Type: application/json
```

**Payload (QuizAttemptUpdateDto):**
```json
{
  "id": 1,
  "submittedAt": "2025-03-10T10:05:00",
  "timeSpentSeconds": 3900,
  "status": 2,
  "totalScore": 15,
  "maxPossibleScore": 20,
  "finalScore": 15,
  "scorePercent": 75,
  "isPassed": true,
  "isAutoGraded": true,
  "gradedByPersonId": 50,
  "gradedAt": "2025-03-10T10:10:00"
}
```

**Response DTO:** `singleObject: QuizAttemptDto` (same shape as [2.1](#21-get-quizattempt--get-all-quiz-attempts))

---

### 2.4 DELETE /QuizAttempt/{id} — Delete Quiz Attempt

```
DELETE /sis_api/QuizAttempt/1?softDelete=true
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الحذف بنجاح",
  "statusCode": null
}
```

---

### 2.5 GET /QuizAttempt/GetDataForStartAttempt/{quizId} — Get Quiz Start Page Data

```
GET /sis_api/QuizAttempt/GetDataForStartAttempt/1
```
*Validates that the logged-in user is a student assigned to the quiz. Returns quiz info, previous attempts, and whether a new attempt can be started.*

**Response DTO:** `singleObject: QuizStartAttemptDataDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "quizId": 1,
    "title": "Midterm Exam",
    "courseTitle": "Intro to Programming",
    "courseSectionContext": "Intro to Programming - Section A",
    "timeLimitMinutes": 60,
    "questionCount": 10,
    "totalMark": 20.0,
    "gradingMethod": "Highest Grade",
    "availableFrom": "2025-03-01T09:00:00",
    "availableTo": "2025-03-15T23:59:00",
    "previousAttempts": [
      {
        "attemptNumber": 1,
        "state": "Finished",
        "grade": 15.0,
        "maxGrade": 20.0,
        "date": "2025-03-10T10:05:00"
      }
    ],
    "canStartNewAttempt": true,
    "attemptsUsed": 1,
    "maxAttempts": 2
  }
}
```

---

### 2.6 POST /QuizAttempt/GetNextQuestion — Get Next Question

```
POST /sis_api/QuizAttempt/GetNextQuestion
Content-Type: application/json
```
*Saves current answer (if provided) then returns the next unanswered question.*

**Payload (GetNextQuestionRequestDto — optional):**
```json
{
  "quizQuestionId": 10,
  "selectedOptionId": 42,
  "selectedOptionIds": null,
  "textAnswer": null,
  "matchingAnswer": null,
  "orderingAnswer": null
}
```
*Pass `null` body to navigate without saving an answer.*

**Answer field usage by question type:**
| QuestionType | Field to use |
|---|---|
| MCQ (1), TrueFalse (2) | `selectedOptionId` |
| MultiAnswer (7) | `selectedOptionIds` (comma-separated IDs, e.g. `"201,203"`) |
| Essay (3), FillBlank (5) | `textAnswer` |
| Matching (4) | `matchingAnswer` (JSON: `{"promptId":answerId,...}`) |
| Ordering (6) | `orderingAnswer` (comma-separated IDs in student's order) |

**Response DTO:** `singleObject: GetNextQuestionResponseDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "quizTitle": "Midterm Exam",
    "quizDescription": "Chapter 1-5",
    "totalQuestions": 10,
    "questionStatuses": {
      "1": { "id": 8, "answered": true, "marked": false },
      "2": { "id": 9, "answered": false, "marked": true },
      "3": { "id": 10, "answered": false, "marked": false }
    },
    "timeLeftSeconds": 3240,
    "timeLimitSeconds": 3600,
    "showCorrectAnswers": false,
    "nextQuestion": {
      "quizQuestionId": 10,
      "questionId": 105,
      "questionText": "What is 2 + 2?",
      "questionType": 1,
      "marks": 2.0,
      "marked": false,
      "editable": true,
      "options": [
        { "id": 201, "optionText": "3", "sortOrder": 1 },
        { "id": 202, "optionText": "4", "sortOrder": 2 }
      ],
      "matchPairs": null,
      "prompts": null,
      "answers": null,
      "studentAnswer": null,
      "attachments": []
    },
    "correction": null
  }
}
```

**When all questions are answered** (`nextQuestion` is null):
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "quizTitle": "Midterm Exam",
    "quizDescription": "Chapter 1-5",
    "totalQuestions": 10,
    "questionStatuses": {
      "1": { "id": 8, "answered": true, "marked": false }
    },
    "timeLeftSeconds": 1800,
    "timeLimitSeconds": 3600,
    "showCorrectAnswers": false,
    "nextQuestion": null,
    "correction": null
  }
}
```

**When `showCorrectAnswers` is enabled** (`correction` is populated):
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "singleObject": {
    "quizTitle": "Midterm Exam",
    "quizDescription": null,
    "totalQuestions": 10,
    "questionStatuses": { "1": { "id": 8, "answered": true, "marked": false } },
    "timeLeftSeconds": 3000,
    "timeLimitSeconds": 3600,
    "showCorrectAnswers": true,
    "nextQuestion": { "...": "..." },
    "correction": {
      "quizQuestionId": 10,
      "questionType": 1,
      "isCorrect": false,
      "score": 0.0,
      "maxScore": 2.0,
      "comment": null,
      "correctOptionId": 202,
      "correctOptionIds": null,
      "correctMatchPairs": null,
      "correctOrder": null,
      "correctFillBlanks": null
    }
  }
}
```

---

### 2.7 POST /QuizAttempt/GetPreviousQuestion — Get Previous Question

```
POST /sis_api/QuizAttempt/GetPreviousQuestion
Content-Type: application/json
```
*Accepts optional current answer to save before navigating back. If no answers exist, returns the first question.*

**Payload:** Same as [2.6](#26-post-quizattemptgetnextquestion--get-next-question) (optional).

**Response DTO:** `singleObject: GetNextQuestionResponseDto` (same shape as [2.6](#26-post-quizattemptgetnextquestion--get-next-question))

---

### 2.8 POST /QuizAttempt/GetQuestionById/{quizQuestionId} — Get Question by ID

```
POST /sis_api/QuizAttempt/GetQuestionById/10
Content-Type: application/json
```
*Accepts optional current answer to save before jumping. Returns the question including the student's existing answer.*

**Payload:** Same as [2.6](#26-post-quizattemptgetnextquestion--get-next-question) (optional).

**Response DTO:** `singleObject: GetNextQuestionResponseDto` — `nextQuestion.studentAnswer` will be populated if the student already answered this question.

---

### 2.9 GET /QuizAttempt/GetCurrentQuestion — Get Current Question

```
GET /sis_api/QuizAttempt/GetCurrentQuestion
```
*Returns the last answered question (or first question if none answered yet) for the active attempt.*

**Response DTO:** `singleObject: GetNextQuestionResponseDto` (same shape as [2.6](#26-post-quizattemptgetnextquestion--get-next-question))

---

### 2.10 POST /QuizAttempt/ShowCorrectAnswer — Show Correct Answer

```
POST /sis_api/QuizAttempt/ShowCorrectAnswer
Content-Type: application/json
```
*Only when `quiz.ShowCorrectAnswers` is enabled. Saves the answer, grades it, and returns the correction.*

**Payload (GetNextQuestionRequestDto — required):**
```json
{
  "quizQuestionId": 10,
  "selectedOptionId": 201,
  "selectedOptionIds": null,
  "textAnswer": null,
  "matchingAnswer": null,
  "orderingAnswer": null
}
```

**Response DTO:** `singleObject: GetNextQuestionResponseDto` — `correction` field is always populated.

---

### 2.11 PUT /QuizAttempt/SetMarked/{quizQuestionId} — Mark Question for Review

```
PUT /sis_api/QuizAttempt/SetMarked/10
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم وضع علامة للمراجعة",
  "statusCode": null
}
```

---

### 2.12 POST /QuizAttempt/CloseAttempt — Submit and Close Attempt

```
POST /sis_api/QuizAttempt/CloseAttempt
Content-Type: application/json
```
*Accepts optional last answer to save before closing. Sets `SubmittedAt`, `TimeSpentSeconds`, `Status=Submitted`, and runs auto-grading.*

**Payload:** Same as [2.6](#26-post-quizattemptgetnextquestion--get-next-question) (optional).

**Response DTO:** `singleObject: QuizAttemptDto`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم تسليم المحاولة بنجاح",
  "statusCode": null,
  "singleObject": {
    "id": 1,
    "quizId": 1,
    "studentEnrollmentId": 100,
    "attemptNumber": 1,
    "startedAt": "2025-03-10T09:00:00",
    "submittedAt": "2025-03-10T10:05:00",
    "timeSpentSeconds": 3900,
    "status": 2,
    "totalScore": 15.0,
    "maxPossibleScore": 20.0,
    "finalScore": 15.0,
    "scorePercent": 75.0,
    "isPassed": true,
    "isAutoGraded": true,
    "gradedByPersonId": null,
    "gradedAt": null,
    "ipAddress": null,
    "browserInfo": null
  }
}
```

---

## 3. QuizSection APIs

### 3.1 GET /QuizSection — Get All Quiz Sections

```
GET /sis_api/QuizSection
```

**Response DTO:** `objects: QuizSectionDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "quizId": 1,
      "title": "Section 1 - Multiple Choice",
      "instructions": "Choose the correct answer",
      "sortOrder": 1,
      "totalMarks": 30.0,
      "autoGenerate": false,
      "autoGenQuestionCount": null,
      "autoGenQuestionType": null,
      "autoGenDifficultyLevelId": null
    }
  ]
}
```

---

### 3.2 POST /QuizSection — Create Quiz Section

```
POST /sis_api/QuizSection
Content-Type: application/json
```

**Payload (QuizSectionCreateDto):**
```json
{
  "quizId": 1,
  "title": "Section 1 - Multiple Choice",
  "instructions": "Choose the correct answer",
  "sortOrder": 1,
  "totalMarks": 30,
  "autoGenerate": false,
  "autoGenQuestionCount": null,
  "autoGenQuestionType": null,
  "autoGenDifficultyLevelId": null
}
```

**Response DTO:** `singleObject: QuizSectionDto` (same shape as [3.1](#31-get-quizsection--get-all-quiz-sections))

---

### 3.3 PUT /QuizSection — Update Quiz Section

```
PUT /sis_api/QuizSection
Content-Type: application/json
```

**Payload (QuizSectionUpdateDto):**
```json
{
  "id": 1,
  "title": "Section 1 - Updated Title",
  "instructions": "Updated instructions",
  "sortOrder": 2,
  "totalMarks": 35,
  "autoGenerate": false,
  "autoGenQuestionCount": null,
  "autoGenQuestionType": null,
  "autoGenDifficultyLevelId": null
}
```

**Response DTO:** `singleObject: QuizSectionDto` (same shape as [3.1](#31-get-quizsection--get-all-quiz-sections))

---

### 3.4 DELETE /QuizSection/{id} — Delete Quiz Section

```
DELETE /sis_api/QuizSection/1?softDelete=true
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الحذف بنجاح",
  "statusCode": null
}
```

---

## 4. QuizAnswer APIs

### 4.1 GET /QuizAnswer — Get All Quiz Answers

```
GET /sis_api/QuizAnswer
```

**Response DTO:** `objects: QuizAnswerDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "quizAttemptId": 1,
      "quizQuestionId": 10,
      "selectedOptionId": 42,
      "selectedOptionIds": null,
      "textAnswer": null,
      "matchingAnswer": null,
      "orderingAnswer": null,
      "isCorrect": true,
      "score": 2.0,
      "maxScore": 2.0,
      "isAutoGraded": true,
      "manualGraderComment": null,
      "answeredAt": "2025-03-10T09:15:00",
      "timeTakenSeconds": 45,
      "marked": false
    }
  ]
}
```

---

### 4.2 POST /QuizAnswer — Create Quiz Answer

```
POST /sis_api/QuizAnswer
Content-Type: application/json
```

**Payload (QuizAnswerCreateDto):**
```json
{
  "quizAttemptId": 1,
  "quizQuestionId": 10,
  "selectedOptionId": 42,
  "selectedOptionIds": null,
  "textAnswer": null,
  "matchingAnswer": null,
  "defaultOrderingAnswer": null,
  "isCorrect": null,
  "score": null,
  "maxScore": null,
  "isAutoGraded": false,
  "manualGraderComment": null,
  "answeredAt": "2025-03-10T09:15:00",
  "timeTakenSeconds": 45
}
```

**Response DTO:** `singleObject: QuizAnswerDto` (same shape as [4.1](#41-get-quizanswer--get-all-quiz-answers))

---

### 4.3 PUT /QuizAnswer — Update Quiz Answer

```
PUT /sis_api/QuizAnswer
Content-Type: application/json
```

**Payload (QuizAnswerUpdateDto):**
```json
{
  "id": 1,
  "selectedOptionId": 43,
  "selectedOptionIds": null,
  "textAnswer": null,
  "matchingAnswer": null,
  "orderingAnswer": null,
  "isCorrect": true,
  "score": 2,
  "manualGraderComment": null
}
```

**Response DTO:** `singleObject: QuizAnswerDto` (same shape as [4.1](#41-get-quizanswer--get-all-quiz-answers))

---

### 4.4 DELETE /QuizAnswer/{id} — Delete Quiz Answer

```
DELETE /sis_api/QuizAnswer/1?softDelete=true
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الحذف بنجاح",
  "statusCode": null
}
```

---

## 5. QuizQuestion APIs

### 5.1 GET /QuizQuestion — Get All Quiz Questions

```
GET /sis_api/QuizQuestion
```

**Response DTO:** `objects: QuizQuestionDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "quizId": 1,
      "quizSectionId": 5,
      "questionId": 101,
      "sortOrder": 1,
      "marks": 10.0,
      "isRequired": true
    }
  ]
}
```

---

### 5.2 POST /QuizQuestion — Create Quiz Question

```
POST /sis_api/QuizQuestion
Content-Type: application/json
```

**Payload (QuizQuestionCreateDto):**
```json
{
  "quizId": 1,
  "quizSectionId": 5,
  "questionId": 101,
  "sortOrder": 1,
  "marks": 10,
  "isRequired": true
}
```

**Response DTO:** `singleObject: QuizQuestionDto` (same shape as [5.1](#51-get-quizquestion--get-all-quiz-questions))

---

### 5.3 PUT /QuizQuestion — Update Quiz Question

```
PUT /sis_api/QuizQuestion
Content-Type: application/json
```

**Payload (QuizQuestionUpdateDto):**
```json
{
  "id": 1,
  "quizSectionId": 5,
  "quizQuestionId": 1,
  "sortOrder": 2,
  "marks": 15,
  "isRequired": true
}
```

**Response DTO:** `singleObject: QuizQuestionDto` (same shape as [5.1](#51-get-quizquestion--get-all-quiz-questions))

---

### 5.4 DELETE /QuizQuestion/{id} — Delete Quiz Question

```
DELETE /sis_api/QuizQuestion/1?softDelete=true
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الحذف بنجاح",
  "statusCode": null
}
```

---

## 6. QuizGradeSync APIs

### 6.1 GET /QuizGradeSync — Get All Quiz Grade Syncs

```
GET /sis_api/QuizGradeSync
```

**Response DTO:** `objects: QuizGradeSyncDto[]`
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": null,
  "statusCode": null,
  "objects": [
    {
      "id": 1,
      "quizId": 1,
      "finalGradeId": 50,
      "quizAttemptId": 1,
      "syncedScore": 15.0,
      "syncedByPersonId": 50,
      "syncedAt": "2025-03-10T11:00:00",
      "syncType": 1
    }
  ]
}
```

---

### 6.2 POST /QuizGradeSync — Create Quiz Grade Sync

```
POST /sis_api/QuizGradeSync
Content-Type: application/json
```

**Payload (QuizGradeSyncCreateDto):**
```json
{
  "quizId": 1,
  "finalGradeId": 50,
  "quizAttemptId": 1,
  "syncedScore": 15,
  "syncedByPersonId": 50,
  "syncedAt": "2025-03-10T11:00:00",
  "syncType": 1
}
```

**Response DTO:** `singleObject: QuizGradeSyncDto` (same shape as [6.1](#61-get-quizgradesync--get-all-quiz-grade-syncs))

---

### 6.3 PUT /QuizGradeSync — Update Quiz Grade Sync

```
PUT /sis_api/QuizGradeSync
Content-Type: application/json
```

**Payload (QuizGradeSyncUpdateDto):**
```json
{
  "id": 1,
  "finalGradeId": 50,
  "syncedScore": 16,
  "syncType": 1
}
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم التحديث بنجاح",
  "statusCode": null
}
```

---

### 6.4 DELETE /QuizGradeSync/{id} — Delete Quiz Grade Sync

```
DELETE /sis_api/QuizGradeSync/1?softDelete=true
```

**Response:** No object returned.
```json
{
  "errorCode": 0,
  "isDone": true,
  "returnMessage": "تم الحذف بنجاح",
  "statusCode": null
}
```

---

## 7. DTO Reference

### QuizDto
Returned by most Quiz list/create/update/publish/close endpoints.

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `title` | string | |
| `description` | string? | |
| `universityId` | int | |
| `courseDegreeDevisionCourseId` | int | |
| `courseId` | int | |
| `courseTitle` | string? | |
| `createdByPersonId` | int | |
| `totalMark` | decimal | |
| `passingMark` | decimal? | |
| `timeLimitMinutes` | int? | |
| `maxAttempts` | int | |
| `shuffleQuestions` | bool | |
| `shuffleOptions` | bool | |
| `showResultAfterSubmit` | bool | |
| `showCorrectAnswers` | bool | Show correct answer immediately after each question |
| `showCorrectAnswersAfterAttempt` | bool | Show correct answers after attempt is submitted |
| `allowBackNavigation` | bool | |
| `autoSubmitOnTimeout` | bool | |
| `availableFrom` | DateTime? | |
| `availableTo` | DateTime? | |
| `status` | int (QuizStatus) | |
| `isGradePublished` | bool | |
| `publishedToFinalGrade` | bool | |

---

### QuizDetailDto
Returned by `GET /Quiz/{id}`. All `QuizDto` fields plus:

| Field | Type | Notes |
|---|---|---|
| `courseDivisionMark` | decimal? | |
| `sections` | QuizSectionDetailDto[] | Ordered by `sortOrder` |
| `questionsWithoutSection` | QuizQuestionDetailDto[] | Questions with no section |

**QuizSectionDetailDto:**

| Field | Type |
|---|---|
| `id` | int |
| `quizId` | int |
| `title` | string |
| `instructions` | string? |
| `sortOrder` | int |
| `totalMarks` | decimal |
| `autoGenerate` | bool |
| `autoGenQuestionCount` | int? |
| `autoGenQuestionType` | int? (QuestionType) |
| `autoGenDifficultyLevelId` | int? |
| `questions` | QuizQuestionDetailDto[] |

**QuizQuestionDetailDto:**

| Field | Type | Notes |
|---|---|---|
| `id` | int | QuizQuestion record ID |
| `quizId` | int | |
| `quizSectionId` | int? | |
| `questionId` | int | Question bank ID |
| `sortOrder` | int | |
| `marks` | decimal | |
| `isRequired` | bool | |
| `version` | int | Snapshot version |
| `questionText` | string | |
| `questionType` | int (QuestionType) | |
| `options` | QuestionOptionDetailDto[] | Includes `isCorrect` |
| `matchPairs` | QuestionMatchPairDetailDto[] | For Matching type |
| `prompts` | MatchPairPromptDetailDto[]? | For Matching type (shuffled) |
| `answers` | string[]? | For Matching type (shuffled answer texts) |

**QuestionOptionDetailDto:**

| Field | Type |
|---|---|
| `id` | int |
| `optionText` | string |
| `isCorrect` | bool |
| `sortOrder` | int |

---

### StudentAssignedQuizDto
Returned by `GET /Quiz/Assigned` and `GET /Quiz/Assigned/ByCourse/{courseId}`.

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `title` | string | |
| `description` | string? | |
| `courseId` | int | |
| `courseTitle` | string? | |
| `courseSemesterSectionId` | int | |
| `availableFrom` | DateTime? | |
| `availableTo` | DateTime? | |
| `status` | int (QuizStatus) | Quiz status |
| `attemptStatus` | int (QuizAttemptStatus) | Status of the student's latest attempt |
| `totalMark` | decimal | |
| `passingMark` | decimal? | |
| `timeLimitMinutes` | int? | |
| `maxAttempts` | int | |
| `isGradePublished` | bool | |
| `publishedToFinalGrade` | bool | |
| `attemptCount` | int | Number of attempts used |
| `isAvailableNow` | bool | True if Published and within date range |

---

### QuizWithAttemptDataDto
Returned by `GET /Quiz/WithAttemptData/{quizId}`.

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `title` | string | |
| `description` | string? | |
| `universityId` | int | |
| `courseDegreeDevisionCourseId` | int | |
| `courseId` | int | |
| `courseTitle` | string? | |
| `createdByPersonId` | int | |
| `totalMark` | decimal | |
| `courseDivisionMark` | decimal? | |
| `passingMark` | decimal? | |
| `timeLimitMinutes` | int? | |
| `maxAttempts` | int | |
| `shuffleQuestions` | bool | |
| `shuffleOptions` | bool | |
| `showResultAfterSubmit` | bool | |
| `showCorrectAnswers` | bool | |
| `allowBackNavigation` | bool | |
| `autoSubmitOnTimeout` | bool | |
| `availableFrom` | DateTime? | |
| `availableTo` | DateTime? | |
| `status` | int (QuizStatus) | |
| `isGradePublished` | bool | |
| `publishedToFinalGrade` | bool | |
| `attemptId` | int | The attempt being viewed |
| `attemptNumber` | int | |
| `viewedPersonId` | int? | Teacher view: the student's personId |
| `includeCorrectAnswers` | bool | Whether `isCorrect` is populated in options |
| `sections` | QuizSectionWithAnswersDto[] | |
| `questionsWithoutSection` | QuizQuestionWithAnswerDto[] | |

**QuizSectionWithAnswersDto** — same fields as `QuizSectionDetailDto` but with `questions: QuizQuestionWithAnswerDto[]`.

**QuizQuestionWithAnswerDto** — same fields as `QuizQuestionDetailDto` plus:

| Field | Type | Notes |
|---|---|---|
| `studentAnswer` | QuizAnswerForReviewDto? | Student's answer; null if not answered |

**QuizAnswerForReviewDto:**

| Field | Type |
|---|---|
| `id` | int |
| `quizAttemptId` | int |
| `quizQuestionId` | int |
| `selectedOptionId` | int? |
| `selectedOptionIds` | string? |
| `textAnswer` | string? |
| `matchingAnswer` | string? |
| `orderingAnswer` | string? |
| `isCorrect` | bool? |
| `score` | decimal? |
| `maxScore` | decimal? |
| `answeredAt` | DateTime? |
| `marked` | bool |

---

### QuizAttemptDto
Returned by QuizAttempt CRUD endpoints and `CloseAttempt`.

| Field | Type |
|---|---|
| `id` | int |
| `quizId` | int |
| `studentEnrollmentId` | int |
| `attemptNumber` | int |
| `startedAt` | DateTime |
| `submittedAt` | DateTime? |
| `timeSpentSeconds` | int? |
| `status` | int (QuizAttemptStatus) |
| `totalScore` | decimal? |
| `maxPossibleScore` | decimal? |
| `finalScore` | decimal? |
| `scorePercent` | decimal? |
| `isPassed` | bool? |
| `isAutoGraded` | bool |
| `gradedByPersonId` | int? |
| `gradedAt` | DateTime? |
| `ipAddress` | string? |
| `browserInfo` | string? |

---

### QuizStartAttemptDataDto
Returned by `GET /QuizAttempt/GetDataForStartAttempt/{quizId}`.

| Field | Type | Notes |
|---|---|---|
| `quizId` | int | |
| `title` | string | |
| `courseTitle` | string? | |
| `courseSectionContext` | string? | e.g. "Intro to Physics - Section A" |
| `timeLimitMinutes` | int? | |
| `questionCount` | int | |
| `totalMark` | decimal | |
| `gradingMethod` | string | e.g. `"Highest Grade"` |
| `availableFrom` | DateTime? | |
| `availableTo` | DateTime? | |
| `previousAttempts` | QuizPreviousAttemptDto[] | |
| `canStartNewAttempt` | bool | |
| `attemptsUsed` | int | |
| `maxAttempts` | int | |

**QuizPreviousAttemptDto:**

| Field | Type | Notes |
|---|---|---|
| `attemptNumber` | int | |
| `state` | string | `"Finished"` or `"In Progress"` |
| `grade` | decimal? | |
| `maxGrade` | decimal | |
| `date` | DateTime? | Submission time |

---

### GetNextQuestionResponseDto
Returned by `GetNextQuestion`, `GetPreviousQuestion`, `GetQuestionById`, `GetCurrentQuestion`, `ShowCorrectAnswer`.

| Field | Type | Notes |
|---|---|---|
| `quizTitle` | string | |
| `quizDescription` | string? | |
| `totalQuestions` | int | |
| `questionStatuses` | Dictionary\<int, QuestionStatusItemDto\> | Key = 1-based display order |
| `timeLeftSeconds` | int? | Null if no time limit |
| `timeLimitSeconds` | int? | Total quiz time in seconds; null if no limit |
| `showCorrectAnswers` | bool | |
| `nextQuestion` | QuestionForAttemptDto? | Null when all questions are answered |
| `correction` | QuestionCorrectionDto? | Only when `showCorrectAnswers = true` and answer was submitted |

**QuestionStatusItemDto:**

| Field | Type |
|---|---|
| `id` | int (QuizQuestionId) |
| `answered` | bool |
| `marked` | bool |

**QuestionForAttemptDto:**

| Field | Type | Notes |
|---|---|---|
| `quizQuestionId` | int | |
| `questionId` | int | Question bank ID |
| `questionText` | string | |
| `questionType` | int (QuestionType) | |
| `marks` | decimal | |
| `marked` | bool | Marked for review |
| `editable` | bool | False when already graded (`isCorrect != null`) |
| `options` | OptionForAttemptDto[] | No `isCorrect` field during attempt |
| `matchPairs` | QuestionMatchPairForAttemptDto[]? | Deprecated; use `prompts` + `answers` |
| `prompts` | MatchPairPromptItemDto[]? | Matching type: shuffled prompts with Id |
| `answers` | string[]? | Matching type: shuffled answer texts |
| `studentAnswer` | StudentAnswerForAttemptDto? | Previously saved answer; null if none |
| `attachments` | QuestionAttachmentDto[] | `presignedUrl` populated by server |

**OptionForAttemptDto:**

| Field | Type |
|---|---|
| `id` | int |
| `optionText` | string |
| `sortOrder` | int |

**StudentAnswerForAttemptDto:**

| Field | Type |
|---|---|
| `selectedOptionId` | int? |
| `selectedOptionIds` | string? |
| `textAnswer` | string? |
| `matchingAnswer` | string? |
| `orderingAnswer` | string? |

**QuestionAttachmentDto:**

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `questionId` | int | |
| `fileUrl` | string | MinIO object key |
| `presignedUrl` | string? | Temporary read URL; populated by controller |
| `fileType` | int (AttachmentFileType) | |
| `displayOrder` | int | |
| `altText` | string? | |

**QuestionCorrectionDto** (only when `showCorrectAnswers = true`):

| Field | Type | Notes |
|---|---|---|
| `quizQuestionId` | int | |
| `questionType` | int (QuestionType) | |
| `isCorrect` | bool? | Null for Essay (manual grading) |
| `score` | decimal | Points awarded |
| `maxScore` | decimal | |
| `comment` | string? | |
| `correctOptionId` | int? | MCQ / TrueFalse |
| `correctOptionIds` | int[]? | MultiAnswer |
| `correctMatchPairs` | MatchPairCorrectionDto[]? | Matching (`promptId` + `correctAnswerText`) |
| `correctOrder` | int[]? | Ordering (option IDs in correct order) |
| `correctFillBlanks` | FillBlankCorrectionDto[]? | FillBlank (`blankIndex`, `correctAnswer`, `acceptedAnswers`) |

---

### TeacherQuizStudentStatusItemDto
Returned by `GET /Quiz/StudentsStatus/{quizId}`.

| Field | Type | Notes |
|---|---|---|
| `personId` | int | |
| `studentEnrollmentId` | int | |
| `studentNameAr` | string | |
| `studentNameEn` | string? | |
| `hasAttempted` | bool | |
| `attemptStatus` | int? (QuizAttemptStatus) | Null when `hasAttempted = false` |
| `attemptStatusDisplay` | string | `"لم يدخل الامتحان"` when no attempt |
| `attemptCount` | int | |
| `lastAttemptAt` | DateTime? | |
| `bestScore` | decimal? | |
| `maxPossibleScore` | decimal? | |

---

### TeacherQuizAttemptForGradingDto
Returned by `GET /Quiz/LastAttemptForManualGrading/{quizId}/{personId}`.

| Field | Type |
|---|---|
| `quizId` | int |
| `quizTitle` | string |
| `attemptId` | int |
| `attemptNumber` | int |
| `startedAt` | DateTime |
| `submittedAt` | DateTime? |
| `timeSpentSeconds` | int? |
| `status` | int (QuizAttemptStatus) |
| `totalScore` | decimal? |
| `maxPossibleScore` | decimal? |
| `scorePercent` | decimal? |
| `isPassed` | bool? |
| `totalQuestionsCount` | int? |
| `autoGradedCount` | int? |
| `manualGradedCount` | int? |
| `pendingManualGradingCount` | int? |
| `studentPersonId` | int |
| `studentNameAr` | string |
| `studentNameEn` | string? |
| `questionsForManualGrading` | QuizQuestionWithAnswerDto[] |

---

### QuizSectionDto
Returned by QuizSection CRUD endpoints.

| Field | Type |
|---|---|
| `id` | int |
| `quizId` | int |
| `title` | string |
| `instructions` | string? |
| `sortOrder` | int |
| `totalMarks` | decimal |
| `autoGenerate` | bool |
| `autoGenQuestionCount` | int? |
| `autoGenQuestionType` | int? (QuestionType) |
| `autoGenDifficultyLevelId` | int? |

---

### QuizQuestionDto
Returned by QuizQuestion CRUD endpoints.

| Field | Type |
|---|---|
| `id` | int |
| `quizId` | int |
| `quizSectionId` | int? |
| `questionId` | int |
| `sortOrder` | int |
| `marks` | decimal |
| `isRequired` | bool |

---

### QuizAnswerDto
Returned by QuizAnswer CRUD endpoints.

| Field | Type |
|---|---|
| `id` | int |
| `quizAttemptId` | int |
| `quizQuestionId` | int |
| `selectedOptionId` | int? |
| `selectedOptionIds` | string? |
| `textAnswer` | string? |
| `matchingAnswer` | string? |
| `orderingAnswer` | string? |
| `isCorrect` | bool? |
| `score` | decimal? |
| `maxScore` | decimal? |
| `isAutoGraded` | bool |
| `manualGraderComment` | string? |
| `answeredAt` | DateTime? |
| `timeTakenSeconds` | int? |
| `marked` | bool |

---

### QuizGradeSyncDto
Returned by QuizGradeSync CRUD endpoints.

| Field | Type |
|---|---|
| `id` | int |
| `quizId` | int |
| `finalGradeId` | int? |
| `quizAttemptId` | int |
| `syncedScore` | decimal |
| `syncedByPersonId` | int |
| `syncedAt` | DateTime |
| `syncType` | int (QuizSyncType) |

---

## 8. Enums Reference

| Enum | Values |
|---|---|
| **QuizStatus** | Draft=1, Published=2, Closed=3 |
| **QuizAttemptStatus** | InProgress=1, Submitted=2 |
| **QuestionType** | MCQ=1, TrueFalse=2, Essay=3, Matching=4, FillBlank=5, Ordering=6, MultiAnswer=7 |
| **QuizSyncType** | BestAttempt=1, LastAttempt=2, Average=3, Manual=4 |
| **AttachmentFileType** | Image=1, Audio=2, Video=3, Document=4 |

---

## Error Response Format

```json
{
  "errorCode": 400,
  "isDone": false,
  "returnMessage": "معرف الجامعة مطلوب",
  "statusCode": 400
}
```

| `errorCode` | Meaning |
|---|---|
| `0` | No error |
| `400` | Missing or invalid values |
| `404` | Object not found |
| `500` | Database failure |
