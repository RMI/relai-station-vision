export const metadata = {
  title: 'Relai Station',
  description: 'Relai Station – Project updates and natural language search'
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
