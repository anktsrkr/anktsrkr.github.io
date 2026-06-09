const copyWithFallback = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  document.body.append(textarea);
  textarea.select();
  const legacyCopy = Reflect.get(document, 'execCommand') as ((commandId: string) => boolean) | undefined;
  legacyCopy?.call(document, 'copy');
  textarea.remove();
};

const getCodeLanguage = (block: HTMLElement) => {
  const explicitLanguage = block.getAttribute('data-language');
  if (explicitLanguage) {
    return explicitLanguage;
  }

  const code = block.querySelector('code');
  const languageClass = Array.from(code?.classList ?? [])
    .find((className) => className.startsWith('language-'));

  return languageClass?.replace('language-', '') ?? 'Code';
};

const createCopyButton = (block: HTMLElement) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-button';
  button.setAttribute('aria-label', 'Copy code to clipboard');
  button.innerHTML = '<span class="code-copy-icon" aria-hidden="true"></span><span class="code-copy-label">Copy</span>';

  const label = button.querySelector('.code-copy-label');
  let resetTimer: number | undefined;

  button.addEventListener('click', async () => {
    if (!label) {
      return;
    }

    const code = block.querySelector('code')?.textContent ?? block.textContent ?? '';

    try {
      await copyWithFallback(code.trimEnd());
      button.classList.add('code-copy-button-copied');
      label.textContent = 'Copied';
      button.setAttribute('aria-label', 'Code copied to clipboard');

      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }

      resetTimer = window.setTimeout(() => {
        button.classList.remove('code-copy-button-copied');
        label.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
      }, 1800);
    } catch (error) {
      console.error('Unable to copy code block', error);
      label.textContent = 'Failed';
      button.setAttribute('aria-label', 'Unable to copy code');
    }
  });

  return button;
};

const enhanceCodeBlocks = () => {
  const blocks = document.querySelectorAll<HTMLElement>('.article-content pre:not([data-code-copy-ready])');

  blocks.forEach((block) => {
    if (block.getAttribute('data-language') === 'mermaid') {
      return;
    }

    block.setAttribute('data-code-copy-ready', 'true');

    let title: HTMLElement | null = block.previousElementSibling?.classList.contains('code-title')
      ? block.previousElementSibling as HTMLElement
      : null;

    if (!title) {
      title = document.createElement('div');
      title.className = 'code-title code-title-generated';
      title.textContent = getCodeLanguage(block);
      block.before(title);
    }

    if (title.querySelector('.code-copy-button')) {
      return;
    }

    title.append(createCopyButton(block));
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceCodeBlocks, { once: true });
} else {
  enhanceCodeBlocks();
}
