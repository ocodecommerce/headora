// Rendered for notFound() below [locale]; Next sends it with HTTP 404.
export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="hd-container hd-empty">
      <h1>Page not found</h1>
      <p>The page you requested was not found.</p>
    </div>
  );
}
