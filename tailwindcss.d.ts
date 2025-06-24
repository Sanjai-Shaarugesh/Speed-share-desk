// global.d.ts or tailwindcss.d.ts
declare namespace JSX {
  interface HTMLAttributes<T> {
    class?: string // enable Tailwind class names on elements
  }
}
