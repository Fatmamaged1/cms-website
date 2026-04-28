/**
 * AI Service - OpenAI Integration for Content Generation
 */
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate blog content using AI
 */
async function generateBlogContent(prompt, language = 'en') {
  const systemPrompt = language === 'ar'
    ? `أنت كاتب محتوى طبي محترف. قم بإنشاء محتوى مدونة طبية احترافي وجذاب باللغة العربية.
       يجب أن يكون المحتوى دقيقاً علمياً ومفيداً للقراء.
       قم بإرجاع JSON فقط بالتنسيق المحدد.`
    : `You are a professional medical content writer. Create engaging, professional medical blog content.
       The content should be scientifically accurate and helpful for readers.
       Return JSON only in the specified format.`;

  const userPrompt = `Generate a blog post about: "${prompt}"

  Return a JSON object with this exact structure:
  {
    "title": "Blog title",
    "subtitle": "Optional subtitle",
    "excerpt": "A brief 2-3 sentence summary",
    "content": "Full blog content in HTML format with proper headings, paragraphs, and lists",
    "tags": ["tag1", "tag2", "tag3"],
    "categories": ["category1"],
    "seo": {
      "metaTitle": "SEO optimized title (max 60 chars)",
      "metaDescription": "SEO meta description (max 160 chars)",
      "metaKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Generate service content using AI
 */
async function generateServiceContent(prompt, language = 'en') {
  const systemPrompt = language === 'ar'
    ? `أنت خبير في كتابة محتوى الخدمات الطبية. قم بإنشاء محتوى خدمة طبية احترافي باللغة العربية.
       قم بإرجاع JSON فقط بالتنسيق المحدد.`
    : `You are a medical services content expert. Create professional medical service content.
       Return JSON only in the specified format.`;

  const userPrompt = `Generate service content about: "${prompt}"

  Return a JSON object with this exact structure:
  {
    "title": "Service title",
    "subtitle": "Service tagline",
    "excerpt": "Brief service description (2-3 sentences)",
    "content": "Detailed service description in HTML format",
    "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "offerings": [
      { "title": "Offering 1", "description": "Description of offering 1" },
      { "title": "Offering 2", "description": "Description of offering 2" },
      { "title": "Offering 3", "description": "Description of offering 3" }
    ],
    "steps": [
      { "title": "Step 1", "description": "Description of step 1" },
      { "title": "Step 2", "description": "Description of step 2" },
      { "title": "Step 3", "description": "Description of step 3" }
    ],
    "faq": [
      { "question": "Common question 1?", "answer": "Answer to question 1" },
      { "question": "Common question 2?", "answer": "Answer to question 2" },
      { "question": "Common question 3?", "answer": "Answer to question 3" }
    ],
    "tags": ["tag1", "tag2", "tag3"],
    "seo": {
      "metaTitle": "SEO optimized title (max 60 chars)",
      "metaDescription": "SEO meta description (max 160 chars)",
      "metaKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Generate career/job posting content using AI
 */
async function generateCareerContent(prompt, language = 'en') {
  const systemPrompt = language === 'ar'
    ? `أنت خبير موارد بشرية في المجال الطبي. قم بإنشاء إعلان وظيفي احترافي باللغة العربية.
       قم بإرجاع JSON فقط بالتنسيق المحدد.`
    : `You are a medical HR expert. Create professional job posting content.
       Return JSON only in the specified format.`;

  const userPrompt = `Generate a job posting for: "${prompt}"

  Return a JSON object with this exact structure:
  {
    "title": "Job title",
    "description": "Detailed job description in HTML format",
    "requirements": "Job requirements in HTML format with bullet points",
    "responsibilities": "Key responsibilities in HTML format with bullet points",
    "benefits": "Benefits and perks in HTML format with bullet points",
    "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
    "preferredSkills": ["Preferred skill 1", "Preferred skill 2", "Preferred skill 3"],
    "seo": {
      "metaTitle": "SEO optimized title (max 60 chars)",
      "metaDescription": "SEO meta description (max 160 chars)",
      "metaKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Generate about page content using AI
 */
async function generateAboutContent(prompt, language = 'en') {
  const systemPrompt = language === 'ar'
    ? `أنت خبير في كتابة محتوى الشركات الطبية. قم بإنشاء محتوى صفحة "من نحن" باللغة العربية.
       قم بإرجاع JSON فقط بالتنسيق المحدد.`
    : `You are a medical company content expert. Create professional "About Us" page content.
       Return JSON only in the specified format.`;

  const userPrompt = `Generate about page content for: "${prompt}"

  Return a JSON object with this exact structure:
  {
    "proud": {
      "title": "Why Choose Us / What We're Proud Of",
      "description": "A paragraph about company pride and achievements",
      "features": [
        { "title": "Feature 1", "subtitle": "Brief description" },
        { "title": "Feature 2", "subtitle": "Brief description" },
        { "title": "Feature 3", "subtitle": "Brief description" },
        { "title": "Feature 4", "subtitle": "Brief description" }
      ]
    },
    "mission": {
      "title": "Our Mission",
      "description": "Company mission statement (2-3 sentences)"
    },
    "vision": {
      "title": "Our Vision",
      "description": "Company vision statement (2-3 sentences)"
    },
    "stats": [
      { "num": 500, "title": "Happy Clients" },
      { "num": 50, "title": "Expert Team" },
      { "num": 100, "title": "Projects Completed" },
      { "num": 15, "title": "Years Experience" }
    ]
  }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = {
  generateBlogContent,
  generateServiceContent,
  generateCareerContent,
  generateAboutContent
};
