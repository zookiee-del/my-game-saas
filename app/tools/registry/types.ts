export interface ToolField {
  key: string;
  label: string;
  type: "number" | "select";
  defaultValue: number;
  options?: { label: string; value: number }[];
}

export interface Calculator {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  category: "finance" | "tax" | "gaming";
  fields: ToolField[];
  compute: (inputs: Record<string, number>) => { label: string; value: string; color?: string }[];
}
