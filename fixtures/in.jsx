import { createElement as forTest } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log(renderToStaticMarkup(<div>Hello World!</div>));
