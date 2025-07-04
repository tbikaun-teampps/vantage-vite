// Questionnaire editor tour configuration
import { type DriveStep } from 'driver.js';
import { tourManager } from './tour-manager';

const questionnaireEditorSteps: DriveStep[] = [
  {
    element: '[data-tour="questionnaire-editor-main"]',
    popover: {
      title: 'Questionnaire Editor',
      description: 'Welcome to the questionnaire editor! This is where you can configure all aspects of your questionnaire including settings, rating scales, and questions.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-header-actions"]',
    popover: {
      title: 'Header Actions',
      description: 'Use these controls to manage your questionnaire status, duplicate it, save changes, or delete it. The status dropdown changes the questionnaire\'s lifecycle state.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-general-settings"]',
    popover: {
      title: 'General Settings',
      description: 'Configure basic questionnaire information like name, description, and guidelines. The completion badge shows if all required fields are filled.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="questionnaire-rating-scales"]',
    popover: {
      title: 'Rating Scales',
      description: 'Define the rating scales that will be used for responses. You can add multiple rating scales and configure their values and labels.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="questionnaire-rating-actions"]',
    popover: {
      title: 'Rating Scale Actions',
      description: 'Use the "Add Rating" button to create new rating scales for your questionnaire responses.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-questions"]',
    popover: {
      title: 'Questions Section',
      description: 'This is where you build the structure of your questionnaire with sections, steps, and questions. The badge shows the total number of questions.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="questionnaire-question-actions"]',
    popover: {
      title: 'Question Management',
      description: 'Add new sections manually or import pre-built sections from the template library to quickly build comprehensive questionnaires.',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="questionnaire-editor-main"]',
    popover: {
      title: 'Questionnaire Editor Complete!',
      description: 'You now know how to use the questionnaire editor! Build comprehensive questionnaires by configuring settings, adding rating scales, and creating structured questions.',
      side: 'bottom',
      align: 'center'
    }
  }
];

// Register the questionnaire editor tour
tourManager.registerTour({
  id: 'questionnaire-editor',
  steps: questionnaireEditorSteps
});

export { questionnaireEditorSteps };