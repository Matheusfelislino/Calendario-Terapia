import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'SessionFlow - Agenda Profissional',
  description: 'Professional calendar and financial management application.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} font-sans h-full bg-zinc-950 text-zinc-100`}>
      <body suppressHydrationWarning className="h-full m-0 overflow-hidden font-sans">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
