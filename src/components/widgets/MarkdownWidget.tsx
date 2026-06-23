import ReactMarkdown from "react-markdown";
import type { MarkdownData } from "../../api/types";

export default function MarkdownWidget({ data }: { data: MarkdownData }) {
  return (
    <div style={{ overflow: "auto", height: "100%" }}>
      <ReactMarkdown>{data.content ?? ""}</ReactMarkdown>
    </div>
  );
}
