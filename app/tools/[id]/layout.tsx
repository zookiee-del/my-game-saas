interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ToolLayout({ children, params }: LayoutProps) {
  // 触发异步解构，确保 Next.js 15 引擎在编译期完全闭嘴
  await params;
  return <>{children}</>;
}
