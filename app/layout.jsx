import './globals.css';

export const metadata = {
  title: 'GMNova26',
  description: 'Plataforma de Streaming',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
