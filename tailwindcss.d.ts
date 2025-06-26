// global.d.ts or tailwindcss.d.ts
declare namespace JSX {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    class?: string // enable Tailwind class names on elements
  }
}
