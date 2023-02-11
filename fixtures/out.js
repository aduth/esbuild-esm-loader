import { createElement as forTest } from "react";
import { renderToStaticMarkup } from "react-dom/server";
console.log(renderToStaticMarkup(/* @__PURE__ */ forTest("div", null, "Hello World!")));
