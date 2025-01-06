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
@layer reset {
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
  * { border-width: 0px; box-sizing: border-box; transition-duration: 0.25s; transition-behavior: allow-discrete;}
  :not(:defined) { display: block; }
}
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
  function insertRule(text) {
    sheet.insertRule(text, sheet.cssRules.length);
  }

  const generatedRules = new Set(Object.keys(staticMap));
  const vars = {};
  for (const name in typeMap) {
    vars[name] = {};
  }
  vars["class"] = {};

  const propertyRx = new RegExp(`^--(${Object.keys(vars).join("|")})-(.+)$`);
  const computed = getComputedStyle(document.documentElement);
  let colorPrimary = null, colorSecondary = null;
  for (const prop of computed) {
    if (prop == "--brand-color-primary") {
      colorPrimary = cssColorToHSL(computed.getPropertyValue(prop));
    } else if (prop == "--brand-color-secondary") {
      colorSecondary = cssColorToHSL(computed.getPropertyValue(prop));
      continue;
    } else {
      const [, context, varname] = prop.match(propertyRx) || [];
      if (context && varname) {
        vars[context][varname] = computed.getPropertyValue(prop).trim();
      }
    }
  }

  if (!colorPrimary) {
    colorPrimary = cssColorToHSL("#aaaaaa");
  }
  if (!colorSecondary) {
    colorSecondary = cssColorToHSL("#555555");
  }

  const style = document.documentElement.style;
  style.setProperty("--color-primary", `hsl(${colorPrimary.h}, ${colorPrimary.s}%, ${colorPrimary.l}%)`);
  style.setProperty("--color-secondary", `hsl(${colorSecondary.h}, ${colorSecondary.s}%, ${colorSecondary.l}%)`);

  function setRange(varName, range) {
    for (const [index, value] of range.entries()) {
      style.setProperty(`--${varName}${index+1}`, value);
    }
  }

  // Background colors
  setRange(
    'bgcp',
    makeColorRange(
      {h: colorPrimary.h, s: colorPrimary.s/2, l: colorPrimary.l + (100 - colorPrimary.l)/1.5}, 
      {h:colorPrimary.h, s: Math.min(colorPrimary.s/2, 5), l: 97},
      6
    )
  );
  setRange(
    'ibgcp',
    makeColorRange(
      {h: colorPrimary.h, s: colorPrimary.s/2, l: 3}, 
      {h:colorPrimary.h, s: Math.min(colorPrimary.s/2, 5), l: colorPrimary.l / 1.5 },
      6
    )
  );
  setRange(
    'bgcs',
    makeColorRange(
      {h: colorSecondary.h, s: colorSecondary.s/2, l: colorSecondary.l + (100 - colorSecondary.l)/1.5}, 
      {h:colorSecondary.h, s: Math.min(colorSecondary.s/2, 5), l: 97},
      6
    )
  );
  setRange(
    'ibgcs',
    makeColorRange(
      {h: colorSecondary.h, s: colorSecondary.s/2, l: 3}, 
      {h:colorSecondary.h, s: Math.min(colorSecondary.s/2, 5), l: colorSecondary.l / 1.5 },
      6
    )
  );

  // Borders
  setRange('bw', makeRange(3/16, 1/16, 6, 'rem'));
  setRange('br', makeRange(20/16, 5/16, 6, 'rem'));
  setRange(
    'bcp',
    makeColorRange(
      {h: colorPrimary.h, s: colorPrimary.s, l: colorPrimary.l}, 
      {h:colorPrimary.h, s: Math.min(colorPrimary.s, 5), l: colorPrimary.l + (100 - colorPrimary.l)/1.5},
      6
    )
  );
  setRange(
    'ibcp',
    makeColorRange(
      {h: colorPrimary.h, s: colorPrimary.s, l: colorPrimary.l / 1.5}, 
      {h:colorPrimary.h, s: Math.min(colorPrimary.s, 5), l: colorPrimary.l},
      6
    )
  );
  setRange(
    'bcs',
    makeColorRange(
      {h: colorSecondary.h, s: colorSecondary.s, l: colorSecondary.l}, 
      {h:colorSecondary.h, s: Math.min(colorSecondary.s, 5), l: colorSecondary.l + (100 - colorSecondary.l)/1.5},
      6
    )
  );
  setRange(
    'ibcs',
    makeColorRange(
      {h: colorSecondary.h, s: colorSecondary.s, l: colorSecondary.l / 1.5}, 
      {h:colorSecondary.h, s: Math.min(colorSecondary.s, 5), l: colorSecondary.l},
      6
    )
  );

  // Headings
  setRange('fhs', makeRange(3, .75, 6, 'rem'));
  setRange(
    'fhcp',
    makeColorRange(
      {h: colorPrimary.h, s: colorPrimary.s, l: colorPrimary.l}, 
      {h: colorPrimary.h, s: colorPrimary.s/2, l: colorPrimary.l/2},
      6
    )
  );
  setRange(
    'ifhcp',
    makeColorRange(
      {h: colorPrimary.h, s: colorPrimary.s, l: colorPrimary.l}, 
      {h: colorPrimary.h, s: colorPrimary.s/2, l: colorPrimary.l + (100 - colorPrimary.l) / 2},
      6
    )
  );
  setRange(
    'fhcs',
    makeColorRange(
      {h: colorSecondary.h, s: colorSecondary.s, l: colorSecondary.l}, 
      {h: colorSecondary.h, s: colorSecondary.s/2, l: colorSecondary.l/2},
      6
    )
  );
  setRange(
    'ifhcs',
    makeColorRange(
      {h: colorSecondary.h, s: colorSecondary.s, l: colorSecondary.l}, 
      {h: colorSecondary.h, s: colorSecondary.s/2, l: colorSecondary.l + (100 - colorSecondary.l) / 2},
      6
    )
  );

  // body text
  setRange('fts', makeRange(2, .75, 6, 'rem'));
  setRange(
    'ftcp',
    makeColorRange(
      {h: colorPrimary.h, s: Math.min(colorPrimary.s, 5), l: Math.max(colorPrimary.l/1.5, 5)}, 
      {h:colorPrimary.h, s: Math.max(colorPrimary.s/4, 25), l: colorPrimary.l + (100 - colorPrimary.l)/2},
      6
    )
  );
  setRange(
    'iftcp',
    makeColorRange(
      {h: colorPrimary.h, s: Math.min(colorPrimary.s, 5), l: Math.min(colorPrimary.l + (100 - colorPrimary.l)/1.5, 95)}, 
      {h:colorPrimary.h, s: Math.max(colorPrimary.s/4, 25), l: colorPrimary.l + (100 - colorPrimary.l)/2},
      6
    )
  );
  setRange(
    'ftcs',
    makeColorRange(
      {h: colorSecondary.h, s: Math.min(colorSecondary.s, 5), l: Math.max(colorSecondary.l/1.5, 5)}, 
      {h:colorSecondary.h, s: Math.max(colorSecondary.s/4, 25), l: colorSecondary.l + (100 - colorSecondary.l)/2},
      6
    )
  );
  setRange(
    'iftcs',
    makeColorRange(
      {h: colorSecondary.h, s: Math.min(colorSecondary.s, 5), l: Math.min(colorSecondary.l + (100 - colorSecondary.l)/1.5, 95)}, 
      {h: colorSecondary.h, s: Math.max(colorSecondary.s/4, 25), l: colorSecondary.l + (100 - colorSecondary.l)/2},
      6
    )
  );

  // Spacing
  setRange('space', makeRange(3, .5, 6, 'rem'));

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
            insertRule(`${rule.selector} { ${rule.propsText} }`);
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

  function cssColorToHSL(color) {
    color = color.trim().toLowerCase();

    if (color.startsWith("#")) {
        const [r, g, b] = parseHexRGB(color);
        return rgbToHSL(r, g, b);
    } else if (color.startsWith("rgb")) {
        const [r, g, b] = parseRGB(color);
        return rgbToHSL(r, g, b);
    } else if (color.startsWith("hsl")) {
        return parseHSL(color);
    } else {
        return [0, 0, 0];
    }
  }

  function parseHexRGB(hex) {
    // Remove the hash if present
    hex = hex.replace(/^#/, "");

    // Convert shorthand hex to full form
    if (hex.length === 3) {
        hex = hex.split("").map((char) => char + char).join("");
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
}

function makeRange(start, end, steps, unit = "") {
    const range = [];
    for (let i = 0; i < steps; i++) {
        range.push(`${start + (end - start) * i / (steps - 1)}${unit}`);
    }
    return range;
}

function makeColorRange(hsl1, hsl2, steps) {
    const h1 = hsl1.h, s1 = hsl1.s, l1 = hsl1.l;
    const h2 = hsl2.h, s2 = hsl2.s, l2 = hsl2.l;

    const hRange = makeRange(h1, h2, steps);
    const sRange = makeRange(s1, s2, steps);
    const lRange = makeRange(l1, l2, steps);
    const range = [];
    for (let i = 0; i < steps; i++) {
        range.push(`hsl(${hRange[i]}, ${sRange[i]}%, ${lRange[i]}%)`);
    }
    return range;
}

function parseRGB(rgb) {
  const match = rgb.match(/rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return [0, 0, 0];

  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function parseHSL(hsl) {
    // Extract numbers from the HSL string
    const match = hsl.match(/hsl[a]?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%/i);
    if (!match) return [0, 0, 0];

    return {
        h: parseInt(match[1], 10),
        s: parseFloat(match[2]),
        l: parseFloat(match[3]),
    };
}

function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = l < 0.5 ? delta / (max + min) : delta / (2 - max - min);

        switch (max) {
            case r:
                h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
                break;
            case g:
                h = (b - r) / delta + 2;
                break;
            case b:
                h = (r - g) / delta + 4;
                break;
        }

        h *= 60;
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
  }

})();
