import type { Question } from "@/lib/quiz";

/** Quick checks for the DSA lessons. Every question is about something the lesson says in plain words. */
export const DSA_QUIZZES: Record<string, Question[]> = {
  "/dsa/lesson-1": [
    {
      q: "What does this line print?",
      code: `console.log("10 + 5");`,
      options: ["15", "10 + 5", "105", "An error"],
      answer: 1,
      why: "Quotes turn the maths into text, so the computer prints exactly those characters. Without quotes it would calculate and print 15.",
    },
    {
      q: "A computer follows your program exactly. What does it do?",
      options: ["What you meant", "What you wrote", "What is most common", "Whatever finishes fastest"],
      answer: 1,
      why: "It does what you wrote, not what you meant. A spelling mistake stops the program with an error.",
    },
    {
      q: "What does this line print?",
      code: `console.log("2" + "3");`,
      options: ["5", "23", "\"2\" + \"3\"", "An error"],
      answer: 1,
      why: "Both values are text, so + joins them: \"2\" and \"3\" become \"23\". This joining is called concatenation.",
    },
    {
      q: "The error says: ReferenceError: consol is not defined. What does it mean?",
      options: ["The file is too long", "You used a name the computer does not know", "The quotes are missing", "Node.js is not installed"],
      answer: 1,
      why: "A ReferenceError means a name is unknown. Here console was misspelled as consol.",
    },
    {
      q: "What is a dry run?",
      options: ["Running the program with no input", "Following the code by hand to predict the output", "Running it on a slow computer", "Deleting the comments"],
      answer: 1,
      why: "In a dry run you act like the computer and follow the code line by line. Interviewers often ask for it.",
    },
  ],
  "/dsa/lesson-2": [
    {
      q: "Which keyword makes a box that cannot be given a new value?",
      options: ["let", "var", "const", "type"],
      answer: 2,
      why: "const is the default choice. Use let only when the value must change, such as a counter or a total.",
    },
    {
      q: "What is 17 % 5?",
      options: ["3", "2", "3.4", "12"],
      answer: 1,
      why: "5 fits into 17 three times (15), and 2 is left over. % gives the remainder.",
    },
    {
      q: "Which expression gives the last digit of the whole number n?",
      options: ["n / 10", "n % 10", "Math.floor(n / 10)", "n - 10"],
      answer: 1,
      why: "n % 10 is the remainder after dividing by 10, which is the last digit. Math.floor(n / 10) removes the last digit instead.",
    },
    {
      q: "What does this print?",
      code: `console.log("5" + 3);`,
      options: ["8", "53", "An error", "NaN"],
      answer: 1,
      why: "If either side of + is a string, JavaScript joins instead of adding. Convert with Number(x) first when you need maths.",
    },
    {
      q: "What does Math.floor(-2.9) give?",
      options: ["-2", "-3", "2", "-2.9"],
      answer: 1,
      why: "Math.floor always rounds down, towards smaller numbers. Math.trunc(-2.9) would give -2.",
    },
    {
      q: "What is the difference between undefined and null?",
      options: [
        "They are the same",
        "undefined is set by JavaScript when nothing was put in the box; null is set by you on purpose",
        "null is a number and undefined is text",
        "undefined is an error",
      ],
      answer: 1,
      why: "undefined means nothing was put here yet. null means you chose to put nothing here.",
    },
  ],
  "/dsa/lesson-3": [
    {
      q: "Which operator compares both the value and the type?",
      options: ["=", "==", "===", "=>"],
      answer: 2,
      why: "=== compares value and type. == changes the type first, which causes hard-to-see bugs, so use === and !== every time.",
    },
    {
      q: "In an else if chain, how many blocks can run?",
      options: ["Every block whose condition is true", "At most one", "Always two", "None until you add default"],
      answer: 1,
      why: "The computer runs the first block whose condition is true and skips the rest of the chain.",
    },
    {
      q: "What is wrong with this code?",
      code: `if (x = 5) {\n  console.log("five");\n}`,
      options: ["Nothing", "= assigns a value; === compares", "The brackets are wrong", "x must be a string"],
      answer: 1,
      why: "One equals sign assigns 5 to x, so the condition is always true. Write x === 5 to compare.",
    },
    {
      q: "Is 1 < x < 5 a correct way to check that x is between 1 and 5?",
      options: [
        "Yes, it works like in maths",
        "No: it compares true or false with 5. Write x > 1 && x < 5",
        "Yes, but only for whole numbers",
        "No: it needs ||",
      ],
      answer: 1,
      why: "JavaScript first works out 1 < x, which is true or false, and then compares that result with 5.",
    },
    {
      q: "Which of these values is falsy?",
      options: ["The text \"0\"", "The number 0", "An empty array []", "The text \"false\""],
      answer: 1,
      why: "The number 0 is falsy. The text \"0\", the text \"false\" and an empty array are all truthy.",
    },
    {
      q: "What happens in a switch case without break?",
      options: ["An error", "The code continues into the next case (falling through)", "The switch restarts", "Nothing runs"],
      answer: 1,
      why: "Without break the code falls through into the next case. That is useful only when several values share one result.",
    },
  ],
};
