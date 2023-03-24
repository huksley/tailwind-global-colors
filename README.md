# Tailwind global colors

Parses your global.scss (or css) and makes colors available in :root to be used as Tailwind Colors.

```
npm i -D tailwind-global-colors
```

For example for following styles/global.scss:

```css
:root {
  --color-dark: #020914;
  --color-primary: #e8ebe0;
}
```

Add following to `tailwind.config.js`:

```js
const generateColors = require("tailwind-global-colors");
const colors = generateColors("./styles/global.scss");

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    // Your colors defined in global.scss will be available in Tailwind CSS
    colors,
  },
};
```

Afterwards, use these in HTML or JSX:

```jsx
const MyElement = () => <div className="text-primary bg-dark">Hello, world!</div>;
```

When you add new colors, Tailwind CSS will automatically update to new colors.
