@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 210 24% 98%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 188 95% 28%;
  --primary-foreground: 0 0% 100%;
  --secondary: 35 80% 58%;
  --secondary-foreground: 222 47% 11%;
  --muted: 210 20% 94%;
  --muted-foreground: 215 16% 43%;
  --accent: 354 78% 62%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 214 22% 88%;
  --input: 214 22% 88%;
  --ring: 188 95% 28%;
  --radius: 0.5rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-feature-settings: "rlig" 1, "calt" 1;
}

::selection {
  background: hsl(var(--primary) / 0.18);
}

.surface-grid {
  background-image:
    linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
  background-size: 36px 36px;
}
