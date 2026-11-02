const fs = require('fs');
const apiCode = fs.readFileSync('C:\\Users\\hp\\.gemini\\antigravity\\scratch\\gurug\\frontend\\js\\api.js', 'utf8');

// Mock browser window with KaTeX
global.window = {
  katex: {
    renderToString: (expr, opts) => `<span class="mock-katex-${opts.displayMode ? 'display' : 'inline'}">[FORMULA: ${expr}]</span>`
  }
};

eval(apiCode.slice(apiCode.indexOf('function sanitizeMathExpression')));

const userExample = `Derivative is:
\\[
\\frac{d}{dx}\\,F(x)=\\sinx.
\\]
and hypotenuse is $c = \\sqrt{a^2 + b^2}$.`;

console.log(formatMarkdown(userExample));
