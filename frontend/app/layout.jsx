import './globals.css';

export const metadata = {
  title: 'Harsha BM — Wikipedia-style portfolio',
  description: 'Computer science undergraduate and AI engineer, Bangalore, India.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-white text-wiki-text antialiased">
        {children}
      </body>
    </html>
  );
}
