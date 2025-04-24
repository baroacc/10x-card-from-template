# 10x-cards

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-repo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Table of Contents
- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Name
**10x-cards**

## Project Description
**10x-cards** is a web application designed to streamline the creation of high-quality educational flashcards. The project offers two primary modes of flashcard creation:
- **AI-assisted generation:** Users can input a text (ranging from 1000 to 10000 characters) and let the AI generate flashcard candidates. These flashcards are then presented for review where users can accept, edit, or reject them. Only accepted flashcards are saved in the database.
- **Manual creation:** Users can manually create flashcards using a simple form with character limits (front: up to 200 characters; back: up to 500 characters).

Additional features include:
- Viewing, editing, and deleting flashcards.
- Storing flashcards within a user account.
- Integration with an open-source spaced repetition algorithm to enhance learning efficiency.

## Tech Stack
The project leverages a modern tech stack for both frontend and backend development:
- **Frontend:**
  - **Astro 5:** For building fast, efficient web pages with minimal JavaScript.
  - **React 19:** For interactive UI components.
  - **TypeScript 5:** Provides static typing for safer code.
  - **Tailwind CSS 4:** For convenient and responsive styling.
  - **Shadcn/ui:** A library of accessible React components.
- **Backend:**
  - **Supabase:** Serves as a comprehensive backend solution offering a PostgreSQL database, built-in user authentication, and real-time capabilities.
- **AI Integration:**
  - **Openrouter.ai:** Enables integration with multiple AI models (OpenAI, Anthropic, Google, etc.) while managing API key costs.
- **Testing:**
  - **Vitest:** For fast and efficient unit testing of components and utility functions.
  - **React Testing Library:** For component testing with a focus on user interactions.
  - **Playwright:** For comprehensive end-to-end testing across multiple browsers.
- **CI/CD and Hosting:**
  - **GitHub Actions:** For continuous integration and deployment pipelines.
  - **DigitalOcean:** For hosting using Docker containers.

## Getting Started Locally
To set up the project on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/10x-cards.git
   cd 10x-cards
   ```

2. **Install Node.js:**
   Ensure you have Node.js version `22.14.0` installed. You can use [nvm](https://github.com/nvm-sh/nvm) to install the correct version:
   ```bash
   nvm install 22.14.0
   nvm use 22.14.0
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## Available Scripts
From the project root, you can run:

- **`npm run dev`**: Starts the Astro development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build locally.
- **`npm run astro`**: Runs Astro CLI commands.
- **`npm run lint`**: Lints the project files.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats code using Prettier.
- **`npm run test`**: Runs unit tests with Vitest.
- **`npm run test:watch`**: Runs unit tests in watch mode.
- **`npm run test:e2e`**: Runs end-to-end tests with Playwright.

## Project Scope
The key functionalities of **10x-cards** include:
- **AI-generated Flashcards:** Users input text and the AI generates flashcard candidates which then undergo a review process (accept, edit, or reject).
- **Manual Flashcard Creation:** Users can manually create flashcards via a form.
- **Flashcard Management:** A comprehensive interface for viewing, editing, searching, and deleting flashcards.
- **User Account Management:** Secure registration, login, and account deletion with associated flashcard data.
- **Spaced Repetition Integration:** Utilizes an open-source spaced repetition algorithm for better learning outcomes.

**Note:** This project is developed as an MVP. Features like advanced spaced repetition algorithms, import from external formats, flashcard sharing, and mobile applications are planned for future releases.

## Project Status
**10x-cards** is currently in the MVP stage. Core functionalities are implemented, and further enhancements will be added based on user feedback and testing.

## License
This project is licensed under the [MIT License](LICENSE).

For additional documentation, please refer to the [project documentation](./docs). 