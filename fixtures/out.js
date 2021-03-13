import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
console.log(renderToStaticMarkup(/* @__PURE__ */ React.createElement("div", null, "Hello World!")));
