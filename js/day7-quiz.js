import { supabase } from "./supabase.js";

const PASS_MARK = 70;
const POINTS_PER_QUESTION = 10;
const FESTIVAL = "halloween_2026";

const QUESTIONS = [
  {
    question: "In Hollow Frequency: Code Zero, what is the title of the first chapter?",
    options: [
      "Dark Transmission",
      "The File",
      "Unknown Signal",
      "Black Star"
    ],
    answer: [1]
  },
  {
    question: "According to the published announcement, on which day of the week was a new Hollow Frequency: Code Zero chapter scheduled?",
    options: [
      "Every Sunday",
      "Every Monday",
      "Every Thursday",
      "Every Friday"
    ],
    answer: [2]
  },
  {
    question: "What is the school named in the published announcement for When Sakura Meets the Storm Season 1?",
    options: [
      "Shirottiya School",
      "Valkeria Academy",
      "Masmer School",
      "Sky Heaven Magic Academy"
    ],
    answer: [2]
  },
  {
    question: "What does the Zero Vector: Code Black Star announcement call the beginning of?",
    options: [
      "The RuneBound Trilogy",
      "The Multiverse Saga",
      "The Sky Heaven Championship",
      "The Hollow Frequency Logs"
    ],
    answer: [1]
  },
  {
    question: "What is the full subtitle of RuneBound Part I on Vidlyra's published announcement?",
    options: [
      "The File",
      "Legacy of the Forgotten Swords",
      "Resonance of the Soul",
      "The Last Princess"
    ],
    answer: [1]
  },
  {
    question: "Which genres are listed for Your Voice, My Tomorrow? Select every correct answer.",
    options: [
      "Space Western",
      "Romance",
      "Music",
      "Slice of Life"
    ],
    answer: [1, 2, 3],
    multiple: true
  },
  {
    question: "According to the published synopsis, what major threat does the hero face in Sharing Man?",
    options: [
      "A school championship",
      "An alien invasion",
      "A magical sword tournament",
      "A haunted well"
    ],
    answer: [1]
  },
  {
    question: "In the published synopsis of Ghost of My Only Love, what drives the young man's dangerous journey after the girl dies?",
    options: [
      "To stop a weekly radio broadcast",
      "To win a school championship",
      "To revive the only love he has known",
      "To find forgotten swords"
    ],
    answer: [2]
  },
  {
    question: "The published When Sakura Meets the Storm Season 1 announcement lists hidden underground labs among its settings.",
    options: ["True", "False"],
    answer: [0]
  },
  {
    question: "The published RuneBound Part I announcement describes the series as a modern school romance about music.",
    options: ["True", "False"],
    answer: [1]
  }
];

const form = document.getElementById("quizForm");
const questionText = document.getElementById("questionText");
const questionHint = document.getElementById("questionHint");
const optionsContainer = document.getElementById("optionsContainer");
const questionCounter = document.getElementById("questionCounter");
const scorePreview = document.getElementById("scorePreview");
const progressFill = document.getElementById("progressFill");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("nextButton");

const quizPanel = document.getElementById("quizPanel");
const resultPanel = document.getElementById("resultPanel");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const finalScore = document.getElementById("finalScore");
const resultMessage = document.getElementById("resultMessage");
const saveStatus = document.getElementById("saveStatus");
const continueButton = document.getElementById("continueButton");
const retryButton = document.getElementById("retryButton");

let questionOrder = [];
let currentIndex = 0;
let score = 0;
let selectedAnswers = new Set();
let locked = false;
let signedInUser = null;
let alreadyPassed = false;

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function makeQuestionOrder() {
  return shuffle(QUESTIONS.map((_, index) => index));
}

function renderQuestion() {
  locked = false;
  selectedAnswers = new Set();

  const originalIndex = questionOrder[currentIndex];
  const question = QUESTIONS[originalIndex];

  questionCounter.textContent =
    `QUESTION ${currentIndex + 1} OF ${QUESTIONS.length}`;

  scorePreview.textContent = `${score} POINTS`;

  progressFill.style.width =
    `${((currentIndex + 1) / QUESTIONS.length) * 100}%`;

  questionText.textContent = question.question;
  questionHint.textContent = question.multiple
    ? "Select all correct answers before confirming."
    : "Choose one answer.";

  feedback.textContent = "";
  nextButton.disabled = false;
  nextButton.textContent =
    currentIndex === QUESTIONS.length - 1
      ? "FINISH QUIZ →"
      : "CONFIRM ANSWER →";

  // Shuffle the answer choices while preserving the correct answer.
  const shuffledOptions = shuffle(
    question.options.map((text, index) => ({
      text,
      originalIndex: index
    }))
  );

  optionsContainer.replaceChildren();

  shuffledOptions.forEach((option, displayIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.setAttribute("aria-pressed", "false");

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + displayIndex);

    const label = document.createElement("span");
    label.textContent = option.text;

    button.append(letter, label);

    button.addEventListener("click", () => {
      if (locked) return;

      if (question.multiple) {
        if (selectedAnswers.has(option.originalIndex)) {
          selectedAnswers.delete(option.originalIndex);
          button.classList.remove("selected");
          button.setAttribute("aria-pressed", "false");
        } else {
          selectedAnswers.add(option.originalIndex);
          button.classList.add("selected");
          button.setAttribute("aria-pressed", "true");
        }
      } else {
        selectedAnswers.clear();
        selectedAnswers.add(option.originalIndex);

        optionsContainer.querySelectorAll(".option").forEach((item) => {
          item.classList.remove("selected");
          item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
      }

      feedback.textContent = "";
    });

    optionsContainer.appendChild(button);
  });
}

function isCorrect(question) {
  if (selectedAnswers.size !== question.answer.length) {
    return false;
  }

  return question.answer.every((answer) => selectedAnswers.has(answer));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (locked) return;

  if (selectedAnswers.size === 0) {
    feedback.textContent = "Please select an answer first.";
    return;
  }

  locked = true;
  nextButton.disabled = true;

  const question = QUESTIONS[questionOrder[currentIndex]];

  if (isCorrect(question)) {
    score += POINTS_PER_QUESTION;
    feedback.textContent = "✓ Correct answer!";
  } else {
    feedback.textContent = "Not quite — moving to the next question.";
  }

  scorePreview.textContent = `${score} POINTS`;

  // Briefly show feedback before proceeding.
  window.setTimeout(() => {
    currentIndex += 1;

    if (currentIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }, 450);
});

async function getProgressRow() {
  if (!signedInUser) {
    throw new Error("Please sign in before saving your quiz result.");
  }

  const { data, error } = await supabase
    .from("festival_progress")
    .select("id, day7_quiz_completed")
    .eq("user_id", signedInUser.id)
    .eq("festival", FESTIVAL)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      "Your festival progress record was not found. Complete the festival setup first."
    );
  }

  return data;
}

async function saveQuizPass() {
  const row = await getProgressRow();

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_quiz_completed: true })
    .eq("id", row.id)
    .eq("user_id", signedInUser.id)
    .eq("festival", FESTIVAL);

  if (error) throw error;

  // Verify the database actually saved the pass.
  const { data, error: verifyError } = await supabase
    .from("festival_progress")
    .select("day7_quiz_completed")
    .eq("id", row.id)
    .single();

  if (verifyError) throw verifyError;

  if (data?.day7_quiz_completed !== true) {
    throw new Error("Quiz pass could not be verified in the database.");
  }
}

async function showResult() {
  quizPanel.hidden = true;
  resultPanel.hidden = false;

  finalScore.textContent = `${score}/100`;

  const passed = score >= PASS_MARK;

  resultIcon.textContent = passed ? "🏆" : "🎃";
  resultTitle.textContent = passed ? "Quiz Passed!" : "Not Quite Yet";
  resultMessage.textContent = passed
    ? "You passed the Vidlyra Universe Quiz. The Image Puzzle is your next challenge."
    : `You scored ${score}/100. You need ${PASS_MARK} points to unlock the Image Puzzle. Try again!`;

  continueButton.hidden = true;
  retryButton.hidden = true;
  saveStatus.textContent = "";

  if (!passed) {
    retryButton.hidden = false;
    return;
  }

  if (!signedInUser) {
    saveStatus.textContent =
      "Your score is ready, but sign in is required to save your progress.";
    return;
  }

  saveStatus.textContent = "Saving your quiz result...";

  try {
    await saveQuizPass();

    alreadyPassed = true;
    saveStatus.textContent =
      "✓ Quiz pass saved to your festival progress.";

    continueButton.hidden = false;
  } catch (error) {
    console.error("Quiz progress save failed:", error);

    saveStatus.textContent =
      `Your score is ${score}/100, but saving failed. ${error.message}`;

    retryButton.hidden = false;
    retryButton.textContent = "RETRY SAVE";
  }
}

function startQuiz() {
  currentIndex = 0;
  score = 0;
  locked = false;
  selectedAnswers = new Set();
  questionOrder = makeQuestionOrder();

  resultPanel.hidden = true;
  quizPanel.hidden = false;

  renderQuestion();
}

continueButton.addEventListener("click", () => {
  if (!alreadyPassed) return;

  // The next page must independently verify the saved quiz pass.
  window.location.href = "day7-puzzle.html";
});

retryButton.addEventListener("click", async () => {
  if (score >= PASS_MARK && signedInUser) {
    retryButton.disabled = true;
    saveStatus.textContent = "Retrying save...";

    try {
      await saveQuizPass();
      alreadyPassed = true;
      saveStatus.textContent = "✓ Quiz pass saved successfully.";
      continueButton.hidden = false;
      retryButton.hidden = true;
    } catch (error) {
      saveStatus.textContent = `Save failed: ${error.message}`;
    } finally {
      retryButton.disabled = false;
    }

    return;
  }

  startQuiz();
});

async function initialize() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    signedInUser = data?.user ?? null;

    if (!signedInUser) {
      questionText.textContent = "Please sign in to begin.";
      questionHint.textContent =
        "Your quiz result must be saved to your festival account.";
      optionsContainer.replaceChildren();

      nextButton.disabled = true;
      feedback.textContent = "Sign in, then reload this page.";
      return;
    }

    const row = await getProgressRow();

    if (row.day7_quiz_completed === true) {
      alreadyPassed = true;
      quizPanel.hidden = true;
      resultPanel.hidden = false;

      resultIcon.textContent = "🏆";
      resultTitle.textContent = "Quiz Already Passed!";
      finalScore.textContent = "✓";
      resultMessage.textContent =
        "Your quiz pass is already saved. Continue to the Image Puzzle.";
      saveStatus.textContent = "Festival progress restored.";
      continueButton.hidden = false;

      return;
    }

    startQuiz();
  } catch (error) {
    console.error("Quiz initialization failed:", error);

    questionText.textContent = "Unable to load the quiz.";
    questionHint.textContent =
      "Check your Supabase configuration and festival progress record.";
    optionsContainer.replaceChildren();
    nextButton.disabled = true;
    feedback.textContent = error.message;
  }
}

initialize();
