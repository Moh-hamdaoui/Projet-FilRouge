import "./styles/globals.css";
import Nav from "@/app/components/Nav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <Nav />
        {children}
      </body>
    </html>
  );
}
