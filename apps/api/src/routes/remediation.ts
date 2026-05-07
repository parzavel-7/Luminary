import { Router } from 'express';

const router = Router();

// Generate AI Remediation for a specific violation
router.post('/generate', async (req, res) => {
  const { html, violation, context } = req.body;

  if (!html || !violation) {
    return res.status(400).json({ error: 'Missing html or violation details' });
  }

  try {
    // In a real production app, you would call OpenAI/Gemini here.
    // Since we are building the high-fidelity UI first, we'll use a sophisticated 
    // generator that mimics the AI behavior for the specific violation.
    
    let fixedCode = html;
    let explanation = "Adjusting attributes for better accessibility.";
    let impact = "High";

    // "AI" logic based on violation type
    if (violation.toLowerCase().includes('alt')) {
      fixedCode = html.replace('>', ' alt="Description of the image content">');
      explanation = "Added a descriptive `alt` attribute to the image. This ensures screen readers can convey the image's purpose to visually impaired users.";
      impact = "Critical";
    } else if (violation.toLowerCase().includes('contrast')) {
      fixedCode = html.replace('style="', 'style="color: #212121; background-color: #ffffff; ');
      explanation = "Updated the color contrast ratio to meet WCAG AA standards (4.5:1). This improves readability for all users, especially those with low vision.";
      impact = "Medium";
    } else if (violation.toLowerCase().includes('label') || violation.toLowerCase().includes('form')) {
      fixedCode = `<label for="input-field">Field Label</label>\n${html.replace('<input', '<input id="input-field"')}`;
      explanation = "Associated the input with a proper `<label>` element. This allows screen readers to announce the field name when focused.";
      impact = "High";
    } else {
      fixedCode = html.replace('>', ' aria-label="Accessible element">');
      explanation = "Applied a semantic `aria-label` to provide context where visible labels are missing.";
    }

    // Simulate network delay for that "AI Thinking" feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({
      fixedCode,
      explanation,
      impact
    });
  } catch (error) {
    console.error('Remediation error:', error);
    res.status(500).json({ error: 'Failed to generate remediation' });
  }
});

export default router;
