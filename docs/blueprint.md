# **App Name**: AINoteSummarize

## Core Features:

- Text Input: A large text area where users can input the long text they want to summarize.
- AI Text Summarization: Send the input text to the Gemini API, along with a system prompt, to generate a summary. The system prompt directs the LLM to act as an AI summarizer that can condense texts in Indonesian to a maximum of 30% of the original length. Uses the function-calling tool, `copyedit`, so that Gemini always incorporates an appropriate editing style to the results. 
- Loading Indicator: Display a loading indicator while waiting for the summary to be generated.
- Summary Display: Display the summary of the given text in a readable output area.
- Copy Summary Button: Implement a "Copy Summary" button to allow users to quickly copy the summarized text to their clipboard.
- Word Counter: Display the word count for both the input text and the generated summary.
- Dark Mode: Offer a dark mode option for user interface customization.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) to evoke a sense of calm and intelligence.
- Secondary color: Light, airy white (#FFFFFF) for backgrounds to ensure readability and a clean aesthetic.
- Accent color: A slightly darker shade of blue (#75A9FF) for interactive elements, providing a subtle but noticeable highlight.
- Font pairing: 'Roboto' (sans-serif) for both headlines and body text, ensuring a modern and readable experience.
- Code font: 'Source Code Pro' for displaying code snippets, maintaining clarity and readability.
- Use simple, line-based icons in a blue tone to maintain consistency and clarity for actions like copying text and toggling dark mode.
- Single-page layout with a clear, top-to-bottom flow: Input text area at the top, followed by the summary display and additional options like the copy button and dark mode toggle, ensuring ease of use.
- Subtle animations for loading indicators and button hover effects to enhance the user experience, providing feedback and engagement.