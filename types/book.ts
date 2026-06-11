export type QuizAnswers = {
  lifeFocus: string;
  readingTone: string;
  currentChallenge: string;
  personalIntention: string;
};

export type CustomerData = {
  fullName: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  quizAnswers: QuizAnswers;
};

export type BirthChartData = {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  dominantElement: string;
  chartSummary: string;
  placements: Array<{
    planet: string;
    sign: string;
    house: string;
    meaning: string;
  }>;
};

export type BookSection = {
  title: string;
  body: string;
};

export type BookContent = {
  title: string;
  subtitle: string;
  introduction: string;
  sections: BookSection[];
  closingNote: string;
};

export type GenerateBookRequest = CustomerData;

export type GenerateBookSuccessResponse = {
  success: true;
  message: string;
};

export type GenerateBookErrorResponse = {
  success: false;
  error: string;
};
