// models
import quizSubmissionModel from "../models/QuizSubmission.model.js";
import { Student } from "../models/Student.model.js";
import Teacher from "../models/Teacher.model.js";
import { courseModel } from "../models/Course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import quizModel from "../models/Quiz.model.js";
// utils
import { calculateScore } from "../utils/calculateScore.js";
import { createNotification } from "../utils/createNotification.js";

// submit quiz
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { _id, role, organizationId } = req.user;
    const { answers } = req.body;

    const quiz = await quizModel.findOne({
      _id: quizId,
      organizationId,
      status: { $nin: ["closed", "draft"] },
      $or: [
        { dueDate: { $exists: false } },
        { dueDate: null },
        { dueDate: { $gte: new Date() } },
      ],
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found or closed",
      });
    }
    const course = await courseModel.findOne({
      _id: quiz.courseId,
      organizationId,
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "course no longer exist",
      });
    }

    const isStudent = role.includes("student");

    if (isStudent) {
      let student = await Student.findOne({
        userId: _id,
      });
      if (!student) {
        student = await Student.create({
          userId: _id,
          organizationId,
        });
      }
      const isEnrollCourse = await enrollmentModel.findOne({
        courseId: course._id,
        studentId: student._id,
        organizationId,
        status: { $nin: ["dropped", "cancelled"] },
      });
      if (!isEnrollCourse) {
        return res.status(401).json({
          success: false,
          message: "you not enroll this course",
        });
      }
      const isSubmit = await quizSubmissionModel.findOne({
        quizId,
        studentId: student._id,
        organizationId,
      });
      if (isSubmit) {
        return res.status(400).json({
          success: false,
          message: "you already submit this quiz",
        });
      }

      let quizSubmissionData = {
        quizId,
        organizationId,
        studentId: student._id,
        courseId: isEnrollCourse.courseId,
      };

      const gradedAnswers = calculateScore(answers || [], quiz.questions || []);

      const quizScore = gradedAnswers.reduce(
        (sum, a) => sum + (a.pointsObtained || 0),
        0,
      );

      if (quizScore > quiz.totalMarks) {
        quizSubmissionData.score = quiz.totalMarks;
        quizSubmissionData.bonusPoints = quizScore - quiz.totalMarks;
        quizSubmissionData.totalScore = quizScore;
      } else {
        quizSubmissionData.score = quizScore;
        quizSubmissionData.bonusPoints = 0;
        quizSubmissionData.totalScore = quizScore;
      }

      quizSubmissionData.isPassed = quizScore >= (quiz.passingMarks || 0);
      quizSubmissionData.submittedAt = new Date();
      quizSubmissionData.answers = gradedAnswers;

      const submit = await quizSubmissionModel.create(quizSubmissionData);

      const teacher = await Teacher.findById(course.teacherId);
      if (teacher && teacher.userId) {
        createNotification({
          organizationId,
          userId: teacher.userId,
          type: "quiz_submission",
          message: `A student submitted a quiz for "${quiz.title}"`,
          link: `/teacher/submissions/quiz/${submit._id}`,
          data: {
            courseId: quiz.courseId,
            quizId,
            submissionId: submit._id,
            studentId: student._id,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "quiz submitted successfully",
        submission: submit,
        submit,
      });
    }
    return res.status(403).json({
      success: false,
      message: "access forbidden",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get quiz's submissions
const getQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { _id, role, organizationId } = req.user;

    const quiz = await quizModel.findOne({
      _id: quizId,
      organizationId,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found",
      });
    }

    const STAFF = ["owner", "admin", "manager"];
    const isStaff = STAFF.some((s) => role.includes(s));
    const isTeacher = role.includes("teacher");

    if (!isStaff && isTeacher) {
      const teacher = await Teacher.findOne({
        userId: _id,
      });
      if (!teacher) {
        return res.status(401).json({
          success: false,
          message: "not authorize",
        });
      }
      if (teacher._id.toString() !== quiz.teacherId.toString()) {
        return res.status(403).json({
          success: false,
          message: "you can only view submissions for your own quizzes",
        });
      }
    }

    const submissions = await quizSubmissionModel
      .find({
        quizId,
        organizationId,
      })
      .populate("studentId")
      .populate("quizId");

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get submission
const getQuizSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { _id, role, organizationId } = req.user;

    const submission = await quizSubmissionModel
      .findOne({
        _id: submissionId,
        organizationId,
      })
      .populate("studentId")
      .populate("quizId");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "submission not found",
      });
    }

    const quiz = await quizModel.findOne({
      _id: submission.quizId?._id || submission.quizId,
      organizationId,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found",
      });
    }

    const STAFF = ["owner", "admin", "manager"];
    const isStaff = STAFF.some((s) => role.includes(s));
    const isTeacher = role.includes("teacher");

    if (!isStaff && isTeacher) {
      const teacher = await Teacher.findOne({
        userId: _id,
      });
      if (!teacher) {
        return res.status(401).json({
          success: false,
          message: "not authorize",
        });
      }
      if (teacher._id.toString() !== quiz.teacherId.toString()) {
        return res.status(403).json({
          success: false,
          message: "you can access only your quizzes",
        });
      }
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// update submission
const updateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { _id, role, organizationId } = req.user;

    const submission = await quizSubmissionModel.findOne({
      _id: submissionId,
      organizationId,
    });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "submission not found",
      });
    }
    const quiz = await quizModel.findOne({
      _id: submission.quizId,
      organizationId,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found",
      });
    }

    const STAFF = ["owner", "admin", "manager"];
    const isStaff = STAFF.some((s) => role.includes(s));
    const isTeacher = role.includes("teacher");

    if (!isStaff && isTeacher) {
      const teacher = await Teacher.findOne({
        userId: _id,
      });
      if (!teacher) {
        return res.status(401).json({
          success: false,
          message: "not authorize",
        });
      }
      if (teacher._id.toString() !== quiz.teacherId.toString()) {
        return res.status(403).json({
          success: false,
          message: "you can update submissions of your quizzes",
        });
      }
    }

    const newSubmissionData = {};
    const ALLOWEDFIELDS = ["isPassed", "bonusPoints", "totalScore", "score"];
    for (const key of ALLOWEDFIELDS) {
      if (req.body?.[key] !== undefined) {
        newSubmissionData[key] = req.body?.[key];
      }
    }

    if (Object.keys(newSubmissionData).length < 1) {
      return res.status(400).json({
        success: false,
        message: "nothing to update",
      });
    }

    const response = await quizSubmissionModel.findOneAndUpdate(
      {
        _id: submissionId,
        organizationId,
      },
      newSubmissionData,
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "submission updated successfully",
      submission: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// degree answer
const degreeAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { _id, role, organizationId } = req.user;
    const { pointsObtained, isCorrect, questionId } = req.body;
    if (pointsObtained === undefined || isCorrect === undefined || !questionId) {
      return res.status(400).json({
        success: false,
        message: "these fields required 'pointsObtained isCorrect questionId'",
      });
    }

    const submission = await quizSubmissionModel.findOne({
      _id: submissionId,
      organizationId,
    });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "submission not found",
      });
    }

    const quiz = await quizModel.findOne({
      _id: submission.quizId,
      organizationId,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found",
      });
    }
    const STAFF = ["owner", "admin", "manager"];
    const isStaff = STAFF.some((s) => role.includes(s));
    const isTeacher = role.includes("teacher");

    if (!isStaff && isTeacher) {
      const teacher = await Teacher.findOne({
        userId: _id,
      });
      if (!teacher) {
        return res.status(401).json({
          success: false,
          message: "not authorize",
        });
      }
      if (teacher._id.toString() !== quiz.teacherId.toString()) {
        return res.status(403).json({
          success: false,
          message: "you can update submissions of your quizzes",
        });
      }
    }

    const newAnswers = submission.answers.map((a) => {
      if (a.questionId.toString() === questionId.toString()) {
        return { ...a, isCorrect: isCorrect, pointsObtained };
      }
      return a;
    });
    const newScore = newAnswers.reduce(
      (total, answer) => total + Number(answer.pointsObtained || 0),
      0,
    );
    const newTotalScore = newScore + Number(submission.bonusPoints || 0);

    const isPassed = newTotalScore >= quiz.passingMarks;

    submission.answers = newAnswers;
    submission.score = newScore;
    submission.isPassed = isPassed;
    submission.totalScore = newTotalScore;

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "answer degreed successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// delete submission
const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { _id, role, organizationId } = req.user;

    const submission = await quizSubmissionModel.findOne({
      _id: submissionId,
      organizationId,
    });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "submission not found",
      });
    }

    const quiz = await quizModel.findOne({
      _id: submission.quizId,
      organizationId,
    });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz no longer exist",
      });
    }

    const STAFF = ["owner", "admin", "manager"];
    const isStaff = STAFF.some((s) => role.includes(s));
    const isTeacher = role.includes("teacher");

    if (!isStaff && isTeacher) {
      const teacher = await Teacher.findOne({
        userId: _id,
      });
      if (!teacher) {
        return res.status(401).json({
          success: false,
          message: "not authorize",
        });
      }
      if (teacher._id.toString() !== quiz.teacherId.toString()) {
        return res.status(403).json({
          success: false,
          message: "you can delete submission from your quizzes",
        });
      }
    }

    await quizSubmissionModel.findByIdAndDelete(submissionId);

    return res.status(200).json({
      success: true,
      message: "submission deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get student's own submission for a specific quiz
const getMyQuizSubmission = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { _id, organizationId } = req.user;

    let student = await Student.findOne({ userId: _id });
    if (!student) {
      return res.status(200).json({
        success: true,
        submission: null,
      });
    }

    const submission = await quizSubmissionModel.findOne({
      quizId,
      studentId: student._id,
      organizationId,
    });

    return res.status(200).json({
      success: true,
      submission: submission || null,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// get all quiz submissions by logged in student
const getMyAllQuizSubmissions = async (req, res) => {
  try {
    const { _id, organizationId } = req.user;
    const student = await Student.findOne({ userId: _id });
    if (!student) {
      return res.status(200).json({ success: true, submissions: [] });
    }

    const submissions = await quizSubmissionModel
      .find({ studentId: student._id, organizationId })
      .populate("quizId")
      .populate("courseId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      submissions: submissions || [],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

export {
  getMyQuizSubmission,
  getMyAllQuizSubmissions,
  submitQuiz,
  getQuizSubmissions,
  getQuizSubmission,
  updateSubmission,
  degreeAnswer,
  deleteSubmission,
};
