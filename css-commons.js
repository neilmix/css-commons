(() => {

  const word_abbr_str = `
    cursor-:cursor d-:display f-:flex-wrap
  `;

const valid_props_str = 
`cursor-:auto,default,pointer
d-:none,block,inline,flex,inline-block,inline-flex
f-:wrap,nowrap,wrap-reverse`;

  const typeMap = {
    color: {
      c: ["color"],
      bg: ["background-color"],
      b: ["border-color"],
      bt: ["border-top-color"],
      br: ["border-right-color"],
      bb: ["border-bottom-color"],
      bl: ["border-left-color"],
      bhz: ["border-left-color", "border-right-color"],
      bvt: ["border-top-color", "border-bottom-color"],
    },
    size: {
      font: ["font-size"],
      lineh: ["line-height"],
    },
    family: {
      font: ["font-family"],
    },
    dim: {
      w: ["width"],
      minw: ["min-width"],
      maxw: ["max-width"],
      wmin: ["min-width"],
      wmax: ["max-width"],
      h: ["height"],
      minh: ["min-height"],
      maxh: ["max-height"],
      hmin: ["min-height"],
      hmax: ["max-height"],
      basis: ["flex-basis"],
    },
    "width": {
      b: ["border-width"],
      bt: ["border-top-width"],
      br: ["border-right-width"],
      bb: ["border-bottom-width"],
      bl: ["border-left-width"],
      btl: ["border-top-width", "border-left-width"],
      btr: ["border-top-width", "border-right-width"],
      bbr: ["border-bottom-width", "border-right-width"],
      bbl: ["border-bottom-width", "border-left-width"],
      bhz: ["border-left-width", "border-right-width"],
      bvt: ["border-top-width", "border-bottom-width"],
    },
    "radius": {
      radius: ["border-radius"],
      radiust: ["border-top-left-radius", "border-top-right-radius"],
      radiusr: ["border-top-right-radius", "border-bottom-right-radius"],
      radiusb: ["border-bottom-right-radius", "border-bottom-left-radius"],
      radiusl: ["border-bottom-left-radius", "border-top-left-radius"],
      radiustl: ["border-top-left-radius"],
      radiustr: ["border-top-right-radius"],
      radiusbr: ["border-bottom-right-radius"],
      radiusbl: ["border-bottom-left-radius"],
    },
    space: {
      m: ["margin"],
      mt: ["margin-top"],
      mr: ["margin-right"],
      mb: ["margin-bottom"],
      ml: ["margin-left"],
      mtl: ["margin-top", "margin-left"],
      mtr: ["margin-top", "margin-right"],
      mbr: ["margin-bottom", "margin-right"],
      mbl: ["margin-bottom", "margin-left"],
      mhz: ["margin-left", "margin-right"],
      mvt: ["margin-top", "margin-bottom"],
      p: ["padding"],
      pt: ["padding-top"],
      pr: ["padding-right"],
      pb: ["padding-bottom"],
      pl: ["padding-left"],
      ptl: ["padding-top", "padding-left"],
      ptr: ["padding-top", "padding-right"],
      pbr: ["padding-bottom", "padding-right"],
      pbl: ["padding-bottom", "padding-left"],
      phz: ["padding-left", "padding-right"],
      pvt: ["padding-top", "padding-bottom"],
      gap: ["gap"],
      gaprow: ["row-gap"],
      gapcol: ["column-gap"],
      rowgap: ["row-gap"],
      colgap: ["column-gap"],
    },
    pos: {
      top: ["top"],
      right: ["right"],
      bottom: ["bottom"],
      left: ["left"],
    },
    stretch: {
      grow: ["flex-grow"],
      shrink: ["flex-shrink"],
    },
    opacity: {
      opacity: ["opacity"],
    },
    z: {
      z: ["z-index"],
    }
  };

  const dynClassPropMap = {};
  const dynPropSet = new Set();
  const dynClassSet = new Set();
  for (const type in typeMap) {
    for (const cls in typeMap[type]) {
      let desc = dynClassPropMap[cls];
      if (!desc) {
        desc = { cls: cls, props: [], types: new Set(), propTypeMap: {} };
        dynClassPropMap[cls] = desc;
      }
      for (const prop of typeMap[type][cls]) {
        desc.propTypeMap[prop] = type;
        desc.props.push(prop);
        desc.types.add(type);
      }
      dynClassSet.add(cls);
      typeMap[type][cls].forEach(p => dynPropSet.add(p));
    }
  }
  
  const wordMap = word_abbr_str.split(/[ \n]+/).reduce((o, cfg) => {
    const [key, value] = cfg.split(":");
    o[key] = value;
    return o;
  }, {});

  function expand_name(abbr) {
    let props = abbr.split(" ");
    props.forEach(p => { if (!wordMap[p]) throw new Error(`Unknown word ${p} of property ${abbr}`) });
    return props.map(p => wordMap[p]).join("-");
  }

  function expand_value(abbr) {
    let values = abbr.split(" ");
    return values.map(v => wordMap[v] || v).join("-");
  }

  let conv_sheet = '';
  const valid_props_arr = valid_props_str.split(/[\n:]/);
  const staticMap = {};
  const staticClassSet = new Set();
  const staticPropSet = new Set();
  if (valid_props_arr.length % 2 == 0) {
    for (let i = 0; i < valid_props_arr.length; i += 2) {
      const name = valid_props_arr[i];
      const values = valid_props_arr[i + 1].split(",");
      if (name.endsWith("hz")) {
        for (let value of values) {
          const short = name.slice(0, -2);
          const rulename = `${name}${value}`;
          const def = `${staticMap[`${short}l${value}`]} ${staticMap[`${short}r${value}`]}`;
          staticMap[rulename] = def;
          conv_sheet += `.${rulename} { ${def} }\n`;
        }
        continue;
      }
      if (name.endsWith("vt")) {
        for (let value of values) {
          const short = name.slice(0, -2);
          const rulename = `${name}${value}`;
          const def = `${staticMap[`${short}t${value}`]} ${staticMap[`${short}b${value}`]}`;
          staticMap[rulename] = def;
          conv_sheet += `.${rulename} { ${def} }\n`;
        }
        continue;
      }
      const name_ex = expand_name(name);
      for (let value of values) {
        let value_ex;
        if (value == "no") {
          if (["brst", "brstt", "brstr", "brstb", "brstl", "cs", "d", "txdc", "txtr"].includes(name)) {
            value_ex = "none";
          } else if (["flwr", "whsp"].includes(name)) {
            value_ex = "nowrap";
          } else {
            throw new Error(`Can't find value "no" for ${name_ex}`);
          }
        } else {
          value_ex = expand_value(value);
        }
        const rulename = `${name}${value}`;
        const def = `${name_ex}: ${value_ex};`;
        staticMap[rulename] = def;
        staticClassSet.add(rulename);
        staticPropSet.add(name_ex);
        conv_sheet += `.${rulename} { ${def} }\n`;
      }
    }
  }

  const resetCSS = `
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, 
pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, 
samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, 
li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, 
article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary, time, mark, audio, video 
{ margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; border-style: solid; border-width: 0;}

body { line-height: 1; }
ol, ul { list-style: none; }
blockquote, q { quotes: none; }
blockquote:before, blockquote:after, q:before, q:after { content: ''; content: none; }
table { border-collapse: collapse; border-spacing: 0; }
* { border-width: 0px; }
* { box-sizing: border-box; }
`;

  if (typeof module != "undefined" && module.exports) {
    // we're being required as a node module
    module.exports = { wordMap, staticMap, typeMap, dynClassPropMap, resetCSS, staticPropSet, staticClassSet, dynPropSet, dynClassSet };
    return;
  }

  const el = document.createElement("style");
  el.textContent = `
  ${resetCSS}
  ${conv_sheet}
  `;
  document.head.appendChild(el);
  const sheet = document.styleSheets[document.styleSheets.length - 1];

  const generatedRules = new Set(Object.keys(staticMap));
  const vars = {};
  for (const name in typeMap) {
    vars[name] = {};
  }
  vars["class"] = {};

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

  function addStyles(elements) {
    for (const el of elements) {
      for (const className of el.classList) { 
        if (!generatedRules.has(className)) {
          const rules = generateRules(className);
          for (const rule of rules) {
            sheet.insertRule(`${rule.selector} { ${rule.propsText} }`, sheet.cssRules.length);
          }
          generatedRules.add(className);
        }
      }
    }
  }

  function generateRules(className, rootSelector) {
    let modifiers = className.split(":").reverse();
    const branchIdentifier = modifiers.shift();
    let [, siblingClasses, identifier] = branchIdentifier.match(/^(.*?)\.([^.]+)$/) || [];

    let selector = rootSelector || `.${className.replace(/[:.#%]/g, c => `\\${c}`)}`;
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

    if (staticMap[identifier]) {
      return [{ selector, propsText: staticMap[identifier]}];
    }

    if (vars["class"][identifier]) {
      const subclasses = vars["class"][identifier].split(/\s+/);
      const rules = [];
      for (const subclass of subclasses) {
        rules.push.apply(rules, generateRules(subclass, rootSelector||selector));
      }
      return rules;
    }

    const [, cls, varname] = identifier.match(/^([^-]+)-(.+)$/) || [];
    const desc = dynClassPropMap[cls];
    if (!desc) {
      if (selector.indexOf(":hover") > 0) {
        console.warn(`${className} - hover: applied to unrecoginized class ${identifier} - ignoring`);
      }
      return [];
    }

    let type;
    for (const t of desc.types) {
      if (vars[t][varname]) {
        type = t;
        break;
      }
    }

    let props;
    if (type) {
      props = typeMap[type][cls].map(p => `${p}: var(--${type}-${varname});`);
    } else {
      // if we don't find a matching var, use the varname as the value which allows people to put
      // in values on-the-fly (e.g. w-400px). We'll use it in all possible properties, relying
      // on the fact that the CSS engine will ignore invalid properties.
      props = desc.props.map(p => `${p}: ${varname};`);
    }

    return [{selector, propsText: props.join(" ")}];
  }
})();
