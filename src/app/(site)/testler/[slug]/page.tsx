import TestRunner from "@/components/TestRunner";

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <TestRunner slug={slug} />
    </div>
  );
}
