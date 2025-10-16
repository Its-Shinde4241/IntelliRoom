function escapeForPrompt(input: string): string {
    return input
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t");
}

export function createImprovedPrompt(userPrompt: string): string {
    const safe = escapeForPrompt(userPrompt);

    return `
Create a complete, functional, and visually appealing website based on this description: "${safe}"
            
CRITICAL REQUIREMENTS:
1. Return ONLY a valid JSON object with no extra text, explanations, or markdown blocks
2. Use proper JSON escaping for all content (escape quotes, newlines, etc.)
3. Create a fully responsive and modern design
4. Include working JavaScript functionality
5. Ensure all code is syntactically correct and complete
            
JSON STRUCTURE (EXACT format required):
{
    "html": "complete HTML content here",
    "css": "complete CSS styles here", 
    "js": "complete JavaScript code here"
}
            
HTML REQUIREMENTS:
- Complete HTML5 document with proper DOCTYPE
- Include viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Use semantic HTML elements (header, main, section, article, footer, etc.)
- Include proper title and meta description
- All elements must have proper closing tags
- No incomplete or malformed tags
    + - LINK the CSS as an external file using: <link rel="stylesheet" href="styles.css">
    + - LINK the JavaScript as an external file using: <script src="script.js"></script>
    + - Do NOT include <style> or <script> blocks inside the HTML
            
CSS REQUIREMENTS:
- Modern, responsive design with mobile-first approach
- Use CSS Grid or Flexbox for layouts
- Include attractive background gradients or colors
- Add smooth transitions and hover effects
- Ensure proper typography with web-safe fonts
- Include proper spacing and padding
- Make it visually appealing with modern design trends
- Add box-shadows, border-radius for modern look
- Ensure good contrast and readability
            
JAVASCRIPT REQUIREMENTS:
- Write complete, syntactically correct JavaScript
- Use modern ES6+ syntax
- Include proper event listeners
- Add interactive functionality relevant to the website purpose
- Ensure all functions are complete with proper opening/closing braces
- No syntax errors or incomplete statements
- Add form validation if forms are present
- Include smooth animations or interactions
            
DESIGN PRINCIPLES:
- Create an engaging, professional design
- Use modern color schemes and typography
- Ensure the design matches the website purpose
- Add visual hierarchy with proper heading sizes
- Include call-to-action buttons with attractive styling
- Make it look professional and polished
            
IMPORTANT NOTES:
- Escape all special characters properly in JSON
- Replace newlines with \\n in the JSON strings
- Escape quotes with \\"
- Ensure the JSON is valid and parseable
- Do not include any text outside the JSON object
- Make sure all JavaScript code is complete (no hanging statements)
- Test that all CSS selectors have corresponding HTML elements
            
Generate a website that looks professional, modern, and fully functional. The design should be impressive and user-friendly.
`.trim();
}

export function cleanAIResponse(response: string): string {
    // remove code fences and leading/trailing stray text, then extract the first {...} block
    let r = response.replace(/```(?:json|html|css|js|javascript)?\s*/g, "");
    r = r.replace(/```/g, "").trim();

    const first = r.indexOf("{");
    const last = r.lastIndexOf("}");
    if (first !== -1 && last !== -1 && first < last) {
        r = r.substring(first, last + 1);
    }

    return r;
}