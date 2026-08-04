import { QuestionType, WorksheetFormat, WorksheetOrientation } from './database.types';

export interface BuilderSelectionState {
  gradeId: string;
  unitId: string;
  lessonId: string;
  difficulty: number;
  questionCount: number;
  questionTypes: QuestionType[];
}

export interface BuilderLayoutSettings {
  title: string;
  showLogo: boolean;
  showTeacherName: boolean;
  showSchoolName: boolean;
  watermarkText: string;
  instructions: string;
  format: WorksheetFormat;
  orientation: WorksheetOrientation;
}

export interface BuilderQuestionItem {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  choices: { id: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  orderNumber: number;
}
