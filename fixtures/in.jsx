// MyComponent.jsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log(renderToStaticMarkup(<div>Hello World!</div>));
