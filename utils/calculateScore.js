const calculateScore = (answers, questions) => {
  let gradedAnswers = [];
  if (!answers || answers.length < 1) return [];
  for (const question of (questions || [])) {
    if (question.questionType === "short_answer") {
      const studentAnswer = answers.find(
        (a) => a.questionId && a.questionId.toString() === question._id.toString(),
      );
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: null,
        pointsObtained: 0,
        isCorrect: false,
        answerText: studentAnswer?.answerText || "",
      });
      continue;
    }
    const studentAnswer = answers.find(
      (a) => a.questionId && a.questionId.toString() === question._id.toString(),
    );
    // Student didn't answer
    if (!studentAnswer || !studentAnswer.selectedOptionId) {
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: null,
        pointsObtained: 0,
        isCorrect: false,
      });
      continue;
    }
    const correctAnswer = question.options?.find((o) => o.isCorrect);
    if (!correctAnswer) {
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: studentAnswer.selectedOptionId,
        pointsObtained: 0,
        isCorrect: false,
      });
      continue;
    }

    if (
      studentAnswer.selectedOptionId &&
      correctAnswer._id &&
      studentAnswer.selectedOptionId.toString() === correctAnswer._id.toString()
    ) {
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: studentAnswer.selectedOptionId,
        pointsObtained: question.points || 0,
        isCorrect: true,
      });
    } else {
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: studentAnswer.selectedOptionId,
        pointsObtained: 0,
        isCorrect: false,
      });
    }
  }
  return gradedAnswers;
};

export { calculateScore };
