"use client";

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { Bold, Italic, Underline } from "lucide-react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";

interface PlateEditorProps {
  value: Value;
  onChange: (value: Value) => void;
  placeholder?: string;
}

export function PlateEditor({
  value,
  onChange,
  placeholder,
}: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
    value,
  });

  return (
    <Plate editor={editor} onChange={({ value }) => onChange(value)}>
      <div className="w-full overflow-hidden rounded-xl border-0 bg-gray-50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10">
        <FixedToolbar className="flex justify-start gap-1 border-0 border-b border-gray-200 bg-transparent px-3 py-2">
          <MarkToolbarButton nodeType="bold" tooltip="粗体 (⌘+B)">
            <Bold size={16} />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="斜体 (⌘+I)">
            <Italic size={16} />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="下划线 (⌘+U)">
            <Underline size={16} />
          </MarkToolbarButton>
        </FixedToolbar>
        <EditorContainer className="w-full border-0 bg-transparent">
          <Editor
            className="min-h-[120px] w-full px-4 py-3 text-base"
            placeholder={placeholder}
            variant="none"
          />
        </EditorContainer>
      </div>
    </Plate>
  );
}
