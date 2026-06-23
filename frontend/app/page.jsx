import ArticlePage from '../components/ArticlePage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getPageData() {
  try {
    const res = await fetch(`${API_URL}/page-data`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getPageData();

  if (!data || !data.profile) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-serifHead mb-3">Can&apos;t reach the API</h1>
        <p className="text-wiki-subtle">
          Make sure the backend is running and <code className="bg-wiki-panel px-1">NEXT_PUBLIC_API_URL</code> points
          to it, then refresh this page.
        </p>
      </main>
    );
  }

  return <ArticlePage data={data} />;
}
