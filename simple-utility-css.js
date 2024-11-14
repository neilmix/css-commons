(() => {
  const el = document.createElement("style");
  const statics = {
    // display
    nodisplay: "display: none;",
    block: "display: block;",
    flex: "display: flex;",

    // visibility
    hidden: "visibility: hidden;",
    visible: "visibility: visible;",

    // position
    relative: "position: relative;",
    absolute: "position: absolute;",
    fixed: "position: fixed;",
    sticky: "position: sticky;",

    // flex
    col: "flex-direction: column;",
    row: "flex-direction: row;",
    colr: "flex-direction: column-reverse;",
    rowr: "flex-direction: row-reverse;",
    wrap: "flex-wrap: wrap;",
    wrapn: "flex-wrap: nowrap;",
    wrapr: "flex-wrap: wrap-reverse;",
    flex1: "flex: 1;",
    grow0: "flex-grow: 0;",
    grow1: "flex-grow: 1;",
    grow0: "flex-grow: 0;",
    grow1: "flex-grow: 1;",
    grow2: "flex-grow: 2;",
    grow3: "flex-grow: 3;",
    grow4: "flex-grow: 4;",
    grow5: "flex-grow: 5;",
    shrink0: "flex-shrink: 0;",
    shrink1: "flex-shrink: 1;",
    shrink2: "flex-shrink: 2;",
    shrink3: "flex-shrink: 3;",
    shrink4: "flex-shrink: 4;",
    shrink5: "flex-shrink: 5;",
    jstart: "justify-content: flex-start;",
    jcenter: "justify-content: center;",
    jend: "justify-content: flex-end;",
    jbetween: "justify-content: space-between;",
    jaround: "justify-content: space-around;",
    jevenly: "justify-content: space-evenly;",
    istart: "align-items: flex-start;",
    icenter: "align-items: center;",
    iend: "align-items: flex-end;",
    istretch: "align-items: stretch;",
    ibaseline: "align-items: baseline;",
    slfstart: "align-self: flex-start;",
    slfcenter: "align-self: center;",
    slfend: "align-self: flex-end;",
    slfstretch: "align-self: stretch;",
    slfbaseline: "align-self: baseline;",
    cstart: "align-content: flex-start;",
    ccenter: "align-content: center;",
    cend: "align-content: flex-end;",
    cstretch: "align-content: stretch;",
    cbetween: "align-content: space-between;",
    caround: "align-content: space-around;",

    // overflow
    ofhidden: "overflow: hidden;",
    ofvisible: "overflow: visible;",
    ofscroll: "overflow: scroll;",
    ofauto: "overflow: auto;",
    ofxhidden: "overflow-x: hidden;",
    ofxvisible: "overflow-x: visible;",
    ofxscroll: "overflow-x: scroll;",
    ofxauto: "overflow-x: auto;",
    ofyhidden: "overflow-y: hidden;",
    ofyvisible: "overflow-y: visible;",
    ofyscroll: "overflow-y: scroll;",
    ofyauto: "overflow-y: auto;",

    // borders
    solid: "border-style: solid;",
    dotted: "border-style: dotted;",
    dashed: "border-style: dashed;",
    double: "border-style: double;",
    groove: "border-style: groove;",
    ridge: "border-style: ridge;",
    inset: "border-style: inset;",
    outset: "border-style: outset;",

    // text
    uppercase: "text-transform: uppercase;",
    lowercase: "text-transform: lowercase;",
    capitalize: "text-transform: capitalize;",
    plain: "text-decoration: none;",
    underline: "text-decoration: underline;",
    overline: "text-decoration: overline;",
    line: "text-decoration: line-through;",
    bold: "font-weight: bold;",
    bolder: "font-weight: bolder;",
    lighter: "font-weight: lighter;",
    normal: "font-weight: normal; font-style: normal;",
    italic: "font-style: italic;",
    oblique: "font-style: oblique;",

    // cursor
    pointer: "cursor: pointer;",
    default: "cursor: default;",
    text: "cursor: text;",
    move: "cursor: move;",
    notallowed: "cursor: not-allowed;",

    // other
    opacity0: "opacity: 0;",
    opacity1: "opacity: 1;",
  };
  el.textContent = `
    /* reset */
    html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; }
    article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block; }
    body { line-height: 1; }
    ol, ul { list-style: none; }
    blockquote, q { quotes: none; }
    blockquote:before, blockquote:after,
    q:before, q:after { content: ''; content: none; }
    table { border-collapse: collapse; border-spacing: 0; }
    * { border-width: 0px; }
    * { box-sizing: border-box; }

    ${Object.entries(statics)
      .map(([key, value]) => `.${key} { ${value} }`)
      .join("\n")}
  `;

  document.head.appendChild(el);
  const sheet = document.styleSheets[document.styleSheets.length - 1];

  const vars = {
    color: {},
    size: {},
    width: {},
    height: {},
    spacing: {},
    position: {},
    radius: {},
  };

  const propertyRx = new RegExp(`^--(${Object.keys(vars).join("|")})-(.+)$`);
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText === ":root") {
          for (const property of rule.style) {
            const [, context, varname] = property.match(propertyRx) || [];
            if (context && varname) {
              vars[context][varname] = rule.style.getPropertyValue(property).trim();
            }
          }
        }
      }
    } catch (e) {
      console.warn(
        "simple-utility-css: Error processing stylesheets. (This might be due to CORS issues with external stylesheets?)",
        e,
      );
    }
  }

  addStyles(document.querySelectorAll("[class]"));
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type == "childList") {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.className) {
              addStyles([node]);
            }
            addStyles(node.querySelectorAll("[class]"));
          }
        }
      } else if (mutation.type == "attributes" && mutation.attributeName == "class") {
        addStyles([mutation.target]);
      }
    }
  });
  observer.observe(document, { attributes: true, childList: true, subtree: true });

  const propMap = {
    color: {
      txt: ["color"],
      bg: ["background-color"],
      brd: ["border-color"],
      brdt: ["border-top-color"],
      brdr: ["border-right-color"],
      brdb: ["border-bottom-color"],
      brdl: ["border-left-color"],
      brdh: ["border-left-color", "border-right-color"],
      brdv: ["border-top-color", "border-bottom-color"],
    },
    size: {
      txt: ["font-size"],
    },
    width: {
      w: ["width"],
      wmn: ["min-width"],
      wmx: ["max-width"],
      brd: ["border-width"],
      brdt: ["border-top-width"],
      brdr: ["border-right-width"],
      brdb: ["border-bottom-width"],
      brdl: ["border-left-width"],
      brdh: ["border-left-width", "border-right-width"],
      brdv: ["border-top-width", "border-bottom-width"],
      basis: ["flex-basis"],
    },
    height: {
      h: ["height"],
      hmn: ["min-height"],
      hmx: ["max-height"],
    },
    spacing: {
      m: ["margin"],
      mt: ["margin-top"],
      mr: ["margin-right"],
      mb: ["margin-bottom"],
      ml: ["margin-left"],
      mh: ["margin-left", "margin-right"],
      mv: ["margin-top", "margin-bottom"],
      p: ["padding"],
      pt: ["padding-top"],
      pr: ["padding-right"],
      pb: ["padding-bottom"],
      pl: ["padding-left"],
      ph: ["padding-left", "padding-right"],
      pv: ["padding-top", "padding-bottom"],
      gp: ["gap"],
      gpr: ["row-gap"],
      gpc: ["column-gap"],
    },
    position: {
      post: ["top"],
      posr: ["right"],
      posb: ["bottom"],
      posl: ["left"],
    },
    radius: {
      radius: ["border-radius"],
      radiustl: ["border-top-left-radius"],
      radiustr: ["border-top-right-radius"],
      radiusbr: ["border-bottom-right-radius"],
      radiusbl: ["border-bottom-left-radius"],
    },
  };
  const rules = {};
  function addStyles(elements) {
    for (const element of elements) {
      for (const className of element.classList) {
        if (rules[className]) continue;
        if (className.match(/[:\-\.]/)) {
          insertRule(className);
        }
        rules[className] = true;
      }
    }
  }
  function insertRule(className) {
    let modifiers = className.split(":").reverse();
    const branchIdentifier = modifiers.shift();
    let [, siblingClasses, identifier] = branchIdentifier.match(/^(.*?)\.([^.]+)$/) || [];

    let selector = `.${className.replace(/:/g, "\\:").replace(/\./g, "\\.")}`;
    if (siblingClasses) {
      selector = `.${siblingClasses}${selector}`;
    } else {
      identifier = branchIdentifier;
    }
    if (modifiers.includes("hover")) {
      selector += ":hover";
      modifiers = modifiers.filter((m) => m != "hover");
    }
    if (modifiers.length) {
      selector = `.${modifiers.join(" .")} ${selector}`;
    }

    if (statics[identifier]) {
      sheet.insertRule(`${selector} { ${statics[identifier]} }`, sheet.cssRules.length);
      return;
    }

    const [, prop, varname] = identifier.match(/^([^-]+)-(.+)$/) || [];
    for (context in propMap) {
      const value = vars[context][varname];
      if (!value) continue;
      const propsText = (propMap[context][prop] || [])
        .map((propName) => `${propName}:${value};`)
        .join(" ");
      sheet.insertRule(`${selector} { ${propsText} }`, sheet.cssRules.length);
    }
  }
})();
