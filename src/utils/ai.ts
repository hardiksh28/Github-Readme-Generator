import type { RepoData } from './github';

export const generateReadmePrompt = (data: RepoData): string => {
  const { owner, repo, description, language, files, packageJson } = data;

  let prompt = `Generate a comprehensive and professional README.md for the following repository:\n`;
  prompt += `Repository: ${owner}/${repo}\n`;
  if (description) prompt += `Description: ${description}\n`;
  if (language) prompt += `Primary Language: ${language}\n`;

  const keyFiles = files.filter(f => 
    !f.includes('node_modules') && 
    !f.includes('.git') && 
    (f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.go') || f.endsWith('.tsx'))
  ).slice(0, 15);

  prompt += `Key Files (up to 15):\n- ${keyFiles.join('\n- ')}\n\n`;

  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const depNames = Object.keys(deps).slice(0, 10);
    prompt += `Dependencies include: ${depNames.join(', ')}\n\n`;
  }

  prompt += `Please structure the README with the following sections:
1. Project Title and Badges
2. Description
3. Key Features
4. Installation
5. Usage
6. Technologies Used
7. Contributing
8. License

Use modern markdown formatting, emojis, and make it look professional.`;

  return prompt;
};

// Mock AI generation based on repository features
export const generateReadme = async (data: RepoData, onProgress: (step: string) => void): Promise<string> => {
  onProgress('Initializing AI model...');
  await new Promise(r => setTimeout(r, 1000));
  
  onProgress('Generating README structure...');
  await new Promise(r => setTimeout(r, 1500));

  onProgress('Writing documentation...');
  await new Promise(r => setTimeout(r, 1500));

  const { owner, repo, description, language, packageJson } = data;
  
  const formattedRepoName = repo.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const defaultDesc = `A powerful, open-source project built with ${language || 'modern web technologies'}.`;

  let deps: string[] = [];
  let installCommand = 'npm install';
  let startCommand = 'npm start';

  if (packageJson) {
    deps = Object.keys({ ...packageJson.dependencies });
    if (filesContain(data.files, 'yarn.lock')) {
      installCommand = 'yarn install';
      startCommand = 'yarn dev';
    } else if (filesContain(data.files, 'pnpm-lock.yaml')) {
      installCommand = 'pnpm install';
      startCommand = 'pnpm dev';
    } else {
      installCommand = 'npm install';
      startCommand = 'npm run dev';
    }
  }

  const techStack = deps.slice(0, 5).map(d => `- **${d}**`).join('\n');
  const fallbackTechStack = language ? `- **${language}**\n- **Node.js**` : `- **Modern Web Technologies**`;

  return `
<div align="center">
  
# ✨ ${formattedRepoName} ✨

[![GitHub license](https://img.shields.io/github/license/${owner}/${repo})](https://github.com/${owner}/${repo}/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/${owner}/${repo})](https://github.com/${owner}/${repo}/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/${owner}/${repo})](https://github.com/${owner}/${repo}/issues)

${description || defaultDesc}

[Report Bug](https://github.com/${owner}/${repo}/issues) · [Request Feature](https://github.com/${owner}/${repo}/issues)

</div>

## 🚀 About The Project

${description ? description : `**${formattedRepoName}** is an innovative project designed to solve complex problems effortlessly. Built with clean code practices and scalability in mind, it provides a solid foundation for your next big idea.`}

### 🎯 Key Features

* **Blazing Fast Performance**: Optimized for speed and efficiency.
* **Developer Friendly**: Clean architecture and highly maintainable codebase.
* **Modern Stack**: Built using industry-standard technologies.
* **Extensible**: Easy to add new features and integrations.

## 💻 Technologies Used

${techStack || fallbackTechStack}

## 🛠️ Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* Node.js (v16 or higher recommended)
* Git

### Installation

1. Clone the repo
   \`\`\`sh
   git clone https://github.com/${owner}/${repo}.git
   \`\`\`
2. Navigate to the project directory
   \`\`\`sh
   cd ${repo}
   \`\`\`
3. Install NPM packages
   \`\`\`sh
   ${installCommand}
   \`\`\`

## 📖 Usage

To start the development server, run:

\`\`\`sh
${startCommand}
\`\`\`

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See \`LICENSE\` for more information.

## ✉️ Contact

Project Link: [https://github.com/${owner}/${repo}](https://github.com/${owner}/${repo})
`;
};

function filesContain(files: string[], filename: string): boolean {
  return files.some(f => f.endsWith(filename));
}

// Mock AI generation based on raw code snippet
export const generateReadmeFromCode = async (code: string, onProgress: (step: string) => void): Promise<string> => {
  onProgress('Analyzing code snippet...');
  await new Promise(r => setTimeout(r, 1000));
  
  onProgress('Generating intelligent content...');
  await new Promise(r => setTimeout(r, 1500));

  onProgress('Writing documentation...');
  await new Promise(r => setTimeout(r, 1500));

  // Try to detect what the code is roughly about
  const isReact = code.includes('import React') || code.includes('useState') || code.includes('className=');
  const isPython = code.includes('def ') || code.includes('import sys') || code.includes('print(');
  const isNode = code.includes('require(') || code.includes('module.exports');

  let title = "Code Snippet Component";
  let tech = "- **JavaScript / TypeScript**";
  let description = "A robust and reusable code snippet designed for high performance and maintainability.";
  
  if (isReact) {
    title = "React UI Component";
    tech = "- **React**\n- **TypeScript**\n- **CSS/SCSS**";
    description = "A responsive and dynamic React component ready to be integrated into modern web applications.";
  } else if (isPython) {
    title = "Python Utility Script";
    tech = "- **Python 3**";
    description = "A high-efficiency Python script providing core utilities and processing logic.";
  } else if (isNode) {
    title = "Node.js Module";
    tech = "- **Node.js**";
    description = "A backend Node.js module built for scalability and fast execution.";
  }

  return `
<div align="center">
  
# ✨ ${title} ✨

A documented breakdown of the provided code snippet.

</div>

## 🚀 Overview

${description}

### 🎯 Key Highlights

* **Clean Implementation**: Easy to read and well structured.
* **Modular**: Can be easily dropped into existing codebases.
* **Optimized**: Designed for performance out of the box.

## 💻 Tech Stack

${tech}

## 🛠️ Integration

To use this code in your project, simply copy the source files into your \`src\` or \`utils\` directory and import it where necessary.

\`\`\`javascript
// Example Import
import { ComponentOrFunction } from './path/to/code';
\`\`\`

## 📖 Usage Example

Here is a basic example of how to implement this code:

\`\`\`javascript
// Initialize or mount the code
const result = ComponentOrFunction();
console.log("Execution successful", result);
\`\`\`

## 📝 Code Analysis

The provided code was automatically analyzed. Based on the structure, it appears to handle core logic operations efficiently. Make sure to install any required peer dependencies.
`;
};
