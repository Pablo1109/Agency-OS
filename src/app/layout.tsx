import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel da Agencia",
  description: "Sistema interno para gestao de clientes, tarefas e financeiro."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
