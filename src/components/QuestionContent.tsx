import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

interface Props {
  text: string;
  figureUrl?: string | null;
  className?: string;
}

/**
 * Randează conținutul unei probleme de admitere:
 *  - Markdown + GFM (tabele, liste)
 *  - LaTeX inline ($...$) și block ($$...$$) prin KaTeX
 *  - Blocuri de cod cu syntax highlighting
 *  - Figură/diagramă opțională sub enunț
 */
export function QuestionContent({ text, figureUrl, className = "" }: Props) {
  return (
    <div
      className={
        "max-w-none [&_p]:my-2 [&_p]:leading-relaxed [&_pre]:my-2 " +
        "[&_code]:font-mono [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc " +
        "[&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_.katex-display]:my-3 " +
        "[&_.katex]:text-[1.02em] " +
        className
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Avoid <div> inside <pre> (invalid HTML → hydration mismatch #418).
          // Our `code` renderer already emits a full block wrapper, so drop <pre>.
          pre: ({ children }: any) => <>{children}</>,
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1] || "cpp";
            const value = String(children).replace(/\n$/, "");
            if (!inline && (value.includes("\n") || match)) {
              return (
                <div className="my-3 overflow-hidden rounded-lg border border-border bg-[#282c34] text-sm shadow-sm">
                  <div className="flex items-center justify-between bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-300">
                    <span>{lang}</span>
                    <span className="opacity-60">cod</span>
                  </div>
                  <SyntaxHighlighter
                    language={lang}
                    style={oneDark}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: "0.85rem 1rem", background: "transparent", fontSize: "0.85rem" }}
                    codeTagProps={{ style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] text-foreground" {...props}>
                {children}
              </code>
            );
          },
          img({ src, alt }: any) {
            return (
              <img
                src={src}
                alt={alt || ""}
                loading="lazy"
                className="my-3 max-h-96 w-auto rounded-md border border-border bg-white"
              />
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>

      {figureUrl && (
        <figure className="my-4">
          <img
            src={figureUrl}
            alt="Figură problemă"
            loading="lazy"
            className="max-h-[28rem] w-auto rounded-md border border-border bg-white shadow-sm"
          />
        </figure>
      )}
    </div>
  );
}