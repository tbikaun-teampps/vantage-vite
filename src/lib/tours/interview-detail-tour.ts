// Interview detail tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const interviewDetailSteps: DriveStep[] = [
  {
    element: '[data-tour="interview-main"]',
    popover: {
      title: 'Interview Session',
      description: 'Welcome to the interview session! This is where you conduct detailed assessments by answering questions and providing ratings for each item.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-progress"]',
    popover: {
      title: 'Progress & Navigation',
      description: 'Track your overall progress through the interview. Use Previous/Next buttons to navigate between questions, and Save to store your current response.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-navigation"]',
    popover: {
      title: 'Question Navigation',
      description: 'Jump directly to any question in the interview. Questions are organized by sections, and answered questions are marked with a green checkmark.',
      side: 'right',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-question"]',
    popover: {
      title: 'Current Question',
      description: 'This displays the current question you\'re answering, including the question text, context, and your answer status.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-rating"]',
    popover: {
      title: 'Rating Scale',
      description: 'Select a rating for the current question. Each rating has a specific meaning - hover over the buttons to see detailed descriptions.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-comments"]',
    popover: {
      title: 'Comments & Evidence',
      description: 'Provide specific examples and evidence to support your rating. This is crucial for documenting the rationale behind your assessment.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-roles"]',
    popover: {
      title: 'Applicable Roles',
      description: 'Select which roles this question and rating applies to. You can select multiple roles if the assessment item is relevant to different positions.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="interview-actions"]',
    popover: {
      title: 'Save & Continue',
      description: 'Save your current response and navigate to the next question. When you reach the last question, you can complete the entire interview.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="help-icon"]',
    popover: {
      title: 'Interview Tour Complete!',
      description: 'You now know how to conduct thorough interviews with ratings, evidence, and role assignments! Use this help icon anytime to restart the tour.',
      side: 'bottom',
      align: 'end'
    }
  }
];

// Register the interview detail tour
tourManager.registerTour({
  id: 'interview-detail',
  steps: interviewDetailSteps
});

export { interviewDetailSteps };