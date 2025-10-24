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
    <div className="w-full">
      <Plate editor={editor} onChange={({ value }) => onChange(value)}>
        <FixedToolbar className="flex justify-start gap-1 rounded-t-xl border-0 bg-gray-50 px-3 py-2">
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
        <EditorContainer className="min-h-[120px] w-full rounded-b-xl border-0 bg-gray-50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10">
          <Editor
            className="min-h-[120px] w-full text-base"
            placeholder={placeholder}
            variant="none"
          />
        </EditorContainer>
      </Plate>
    </div>
  );
}
