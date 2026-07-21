import { BackToTools } from '@/components/BackToTools';

// Wraps every /tools page; the back link hides itself on the index.
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackToTools />
      {children}
    </>
  );
}
