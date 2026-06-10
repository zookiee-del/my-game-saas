import { notFound } from "next/navigation";
import { calculatorsRegistry } from "@/app/tools/registry";
import CalculatorClient from "./CalculatorClient";

// 这一步是关键！告诉 Next.js 你的 [id] 都有谁
export async function generateStaticParams() {
  return Object.keys(calculatorsRegistry).map((id) => ({ id }));
}

export default async function ToolPage(props: any) {
  const resolvedParams = await props.params;
  const tool = calculatorsRegistry[resolvedParams?.id];
  
  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{tool.title}</h1>
        <CalculatorClient toolId={resolvedParams?.id} />
      </div>
    </div>
  );
}// Force cache invalidation 2026-06-08