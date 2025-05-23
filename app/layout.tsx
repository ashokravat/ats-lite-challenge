import './globals.css';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ATS Challenge',
  description: 'A transparent applicant tracking system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="">
        <Toaster
          position="bottom-center"
          reverseOrder={false}
        />
        {children}
      </body>
    </html>
  );
}