# Activity Points Web Application

[![Vercel Deploy](https://vercel.com/button)](https://activity-points.vercel.app/)

## Overview
A web application to efficiently track, validate, and manage student participation in co-curricular and non-co-curricular activities. The app automates activity point assignment and provides analysis and reports for advisors and administrators.

- **Live Demo:** [activity-points.vercel.app](https://activity-points.vercel.app/)
- **GitHub Repo:** [1518manu/ActivityPoints](https://github.com/1518manu/ActivityPoints)

## Features
- Student certificate upload and tracking
- Faculty validation and point assignment
- Admin user management and analytics
- Club event management
- Notification system
- PDF and Excel report generation
- Duty leave application
- Role-based dashboards (Student, Faculty, Admin, Club)

## Tech Stack
- **Frontend:** React 18, Vite, React Router
- **Backend/DB:** Firebase (Auth, Firestore, Storage)
- **Testing:** Cypress (E2E)
- **Charts/Reports:** Chart.js, react-chartjs-2, xlsx, exceljs, jsPDF

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
```bash
cd client
npm install
```

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Copy your Firebase config to `src/firebaseFile/firebaseConfig.jsx` (already present, but replace with your own for production).
3. (Optional) To use Firebase emulators locally:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Run: `firebase emulators:start`

### Running the App
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Lint code with ESLint

### Testing
- **E2E Tests:**
  - Run Cypress UI: `npx cypress open`
  - Run headless: `npx cypress run`
- Test files are in `cypress/e2e/`

## Advanced Testing Strategies

To ensure high code quality and reliability, consider the following testing strategies:

### 1. Unit Testing
- **Purpose:** Test individual functions or components in isolation.
- **Recommended Tool:** [Jest](https://jestjs.io/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
- **Location:** Place unit tests in `client/tests/unit/`.
- **Example:**
  - `tests/unit/components/Button.test.jsx`

### 2. Integration Testing
- **Purpose:** Test how multiple components or modules work together (e.g., form submission, API calls).
- **Recommended Tool:** Jest + React Testing Library.
- **Location:** Place integration tests in `client/tests/integration/`.
- **Example:**
  - `tests/integration/StudentFormFlow.test.jsx`

### 3. End-to-End (E2E) Testing
- **Purpose:** Test the entire application as a user would, simulating real user interactions.
- **Tool:** [Cypress](https://www.cypress.io/)
- **Location:** Cypress tests are in `client/cypress/e2e/` by default.

### 4. Manual & Exploratory Testing
- **Purpose:** Catch edge cases and usability issues not covered by automated tests.
- **How:** Regularly use the app as different user roles and try unexpected inputs or flows.

## Test Folder Structure
Organize your tests for clarity and scalability:
```
client/
  ├── tests/
  │   ├── unit/
  │   │   └── ...
  │   └── integration/
  │       └── ...
  ├── cypress/
  │   └── e2e/
  │       └── ...
  └── ...
```

## Running Unit & Integration Tests
1. Install Jest and React Testing Library:
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   ```
2. Add test scripts to your `package.json`:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watchAll"
   }
   ```
3. Run tests:
   ```bash
   npm run test
   ```

---

**Tip:** Aim for a mix of unit, integration, and E2E tests for robust coverage. Keep tests up to date as you add new features or refactor code.

## Project Structure
```
client/
  ├── public/                # Static assets
  ├── src/
  │   ├── components/        # Shared components
  │   ├── Users/             # Role-based dashboards
  │   ├── firebaseFile/      # Firebase config
  │   └── ...
  ├── cypress/               # E2E tests
  ├── package.json           # Project metadata & scripts
  └── ...
```

## Deployment
- **Vercel:** Project is ready for Vercel deployment (see `vercel.json`).
- **Firebase Hosting:** You can also deploy using Firebase Hosting.

## Contributing
1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and submit a pull request

## License
[MIT](../LICENSE)

## Acknowledgements
- [React](https://react.dev/)
- [Firebase](https://firebase.google.com/)
- [Vite](https://vitejs.dev/)
- [Cypress](https://www.cypress.io/)
- [Chart.js](https://www.chartjs.org/)

---

For any questions or support, please open an issue on GitHub.
