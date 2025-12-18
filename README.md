# WorkSync

WorkSync is a modern, AI-powered task management and collaboration platform designed for the future of work.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/WebSync-1.git
    cd WebSync-1
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory and add your Firebase configuration:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛡️ Security Updates

This project is kept up-to-date with the latest security patches.
- **Next.js**: Updated to the latest stable version to address CVE-2025-55182.
- **Firebase**: Rules are configured for strict ownership access.

## 🧪 How to Test Features

### 1. Inbox & Collaboration
To test the "Inbox" and task assignment feature locally:
1.  Open the app in your main browser window and log in as **User A**.
2.  Open an **Incognito/Private** window and log in as **User B** (create a new account if needed).
3.  As **User A**, create a new task. In the "Assignee" field, enter the email address of **User B**.
4.  As **User B**, go to the **Dashboard** or **Tasks** page. You should see the task in your **Inbox** tab.
5.  Accept or Decline the task to see the status update in real-time.

### 2. Magic Parser
- Go to the Sidebar > Magic Parser.
- Paste a rough text (e.g., "Meeting tomorrow at 10am with John #urgent").
- Click "Parse Tasks" to see AI extraction in action.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Shadcn UI
- **Backend**: Firebase (Auth, Firestore)
- **AI**: Google Genkit (Experimental)

## 📄 License
MIT
