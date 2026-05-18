import type { RepoData } from './github';

export const getApiKey = () => {
  return localStorage.getItem('gemini_api_key') || '';
};

export const setApiKey = (key: string) => {
  localStorage.setItem('gemini_api_key', key);
};

export const generateReadmePrompt = (data: RepoData): string => {
  const { owner, repo, description, language, files, packageJson } = data;

  let prompt = `You are an expert technical writer and developer. Generate a comprehensive and professional README.md for the following repository:\n`;
  prompt += `Repository: ${owner}/${repo}\n`;
  if (description) prompt += `Description: ${description}\n`;
  if (language) prompt += `Primary Language: ${language}\n`;

  const keyFiles = files.filter(f => 
    !f.includes('node_modules') && 
    !f.includes('.git') && 
    !f.includes('dist') &&
    !f.includes('build') &&
    (f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.go') || f.endsWith('.tsx') || f.endsWith('.md'))
  ).slice(0, 30);

  prompt += `Repository File Structure:\n- ${keyFiles.join('\n- ')}\n\n`;

  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const depNames = Object.keys(deps);
    prompt += `Dependencies include: ${depNames.join(', ')}\n\n`;
  }

  prompt += `Please structure the README with the following sections:
1. Project Title and Badges
2. Description
3. Key Features
4. Tech Stack
5. Installation
6. Usage
7. Contributing
8. License

Use modern markdown formatting, emojis, and make it look extremely professional. Return ONLY the markdown code, no other text.`;

  return prompt;
};

export const generateReadme = async (data: RepoData, onProgress: (step: string) => void): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your Gemini API key in the settings.');
  }

  onProgress('Initializing AI model...');
  const prompt = generateReadmePrompt(data);

  onProgress('Generating intelligent content (this may take a few seconds)...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to generate README from API.');
    }

    onProgress('Writing documentation...');
    const result = await response.json();
    let text = result.candidates[0].content.parts[0].text;
    
    if (text.startsWith('```markdown')) {
      text = text.replace(/^```markdown\n/, '');
      text = text.replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '');
      text = text.replace(/\n```$/, '');
    }
    
    return text;
  } catch (error: any) {
    throw new Error(`AI Generation failed: ${error.message}`);
  }
};

export const generateReadmeFromCode = async (code: string, onProgress: (step: string) => void): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your Gemini API key in the settings.');
  }

  onProgress('Analyzing code snippet...');
  const prompt = `You are an expert technical writer and developer. Generate a comprehensive README.md component documentation for the following code snippet:\n\n\`\`\`\n${code}\n\`\`\`\n\nPlease include: Title, Overview, Key Features, Tech Stack, Integration/Usage Instructions. Return ONLY the markdown code.`;
  
  onProgress('Generating intelligent content (this may take a few seconds)...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to generate README from API.');
    }

    onProgress('Writing documentation...');
    const result = await response.json();
    let text = result.candidates[0].content.parts[0].text;
    
    if (text.startsWith('```markdown')) {
      text = text.replace(/^```markdown\n/, '');
      text = text.replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '');
      text = text.replace(/\n```$/, '');
    }
    
    return text;
  } catch (error: any) {
    throw new Error(`AI Generation failed: ${error.message}`);
  }
};
