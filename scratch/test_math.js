function sanitizeMath(expr) {
  if (!expr) return '';
  return expr
    // Fix function name attached to variable, e.g. \sinx -> \sin x, \cosx -> \cos x
    .replace(/\\(sin|cos|tan|cot|sec|csc|ln|log|exp|lim|arcsin|arccos|arctan)([a-zA-Z0-9])/g, '\\$1 $2')
    // Fix multiple backslashes that sometimes get double escaped in JSON
    .replace(/\\\\([a-zA-Z]+)/g, '\\$1')
    .trim();
}

function processMathAndMarkdown(text) {
  if (!text) return '';

  const mathEntries = [];

  // 1. Extract block math: \[ ... \]
  let out = text.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (match, eq) => {
    const id = mathEntries.length;
    mathEntries.push({ type: 'block', code: sanitizeMath(eq) });
    return `%%%MATH_TOKEN_${id}%%%`;
  });

  // 2. Extract block math: $$ ... $$
  out = out.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (match, eq) => {
    const id = mathEntries.length;
    mathEntries.push({ type: 'block', code: sanitizeMath(eq) });
    return `%%%MATH_TOKEN_${id}%%%`;
  });

  // 3. Extract LaTeX environments: \begin{...} ... \end{...}
  out = out.replace(/\\begin\{(equation|align|aligned|gather|matrix|pmatrix|bmatrix)\}([\s\S]*?)\\end\{\1\}/g, (match, env, body) => {
    const id = mathEntries.length;
    mathEntries.push({ type: 'block', code: sanitizeMath(match) });
    return `%%%MATH_TOKEN_${id}%%%`;
  });

  // 4. Extract inline math: \( ... \)
  out = out.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (match, eq) => {
    const id = mathEntries.length;
    mathEntries.push({ type: 'inline', code: sanitizeMath(eq) });
    return `%%%MATH_TOKEN_${id}%%%`;
  });

  // 5. Extract inline math: $ ... $
  out = out.replace(/\$([^\$\n\r]+?)\$/g, (match, eq) => {
    const id = mathEntries.length;
    mathEntries.push({ type: 'inline', code: sanitizeMath(eq) });
    return `%%%MATH_TOKEN_${id}%%%`;
  });

  // 6. Apply Markdown replacements to the non-math text
  let html = out
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-purple-300 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-4 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black/40 border border-white/10 rounded-lg p-3 my-3 text-sm text-cyan-300 font-mono overflow-x-auto"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-black/30 border border-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1">$1</li>')
    .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-gray-300 my-1"><span class="font-medium text-white">$1.</span> $2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  // 7. Substitute math tokens back
  for (let i = 0; i < mathEntries.length; i++) {
    const entry = mathEntries[i];
    const token = `%%%MATH_TOKEN_${i}%%%`;
    // Dummy render string for node test
    const dummyRender = entry.type === 'block' 
      ? `<div class="katex-display my-2 overflow-x-auto text-center">$$${entry.code}$$</div>`
      : `<span class="katex-inline">$${entry.code}$</span>`;
    html = html.replace(token, dummyRender);
  }

  return html;
}

const inputSample = `Here is the fundamental theorem of calculus:
\\[
\\frac{d}{dx}\\,F(x)=\\sinx.
\\]
Notice that for any right triangle:
$$a^2 + b^2 = c^2$$
And inline formula $E = mc^2$ with \\(f(x) = \\cosx\\).`;

console.log("=== INPUT ===");
console.log(inputSample);
console.log("\n=== OUTPUT ===");
console.log(processMathAndMarkdown(inputSample));
