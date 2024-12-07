(() => {
  const word_abr_str = 
`b:bottom c:color d:display h:height l:left m:margin p:padding r:right t:top w:width
al:align bg:background bs:basis br:border bk:break cl:column ct:content cs:cursor dc:decoration dr:direction fl:flex fm:family fn:font gp:gap gr:grow it:items js:justify ln:line mx:max mn:min op:opacity of:overflow ps:position rd:radius rw:row sf:self sh:shrink sz:size sp:space st:style tx:text tr:transform vs:visibility vt:vertical wt:weight wh:white wr:wrap x:x y:y
abs:absolute arn:around aut:auto bal:balance bet:between blk:block bld:bold bdr:bolder bsl:baseline cap:capitalize cps:collapse ctr:center def:default dot:dotted dsh:dashed end:end evn:evenly fxd:fixed hid:hidden inl:inline itc:italic low:lowercase ltr:lighter mid:middle no:no nrm:normal obq:olblique ptr:pointer pre:pre rel:relative scr:scroll sol:solid srt:start stb:stable stt:static stk:sticky str:stretch sub:sub sup:super thr:through und:underline upp:uppercase wr:wrap`;

  const valid_props_str = 
`alct:nrm,str,srt,r,end,flsrt,flend,bsl,spbet,sparn,spevn
alit:nrm,str,srt,ctr,end,flsrt,flend,bsl,sfsrt,sfend
alsf:aut,nrm,str,srt,ctr,end,flsrt,flend,bsl,sfsrt,sfend
jsct:nrm,srt,r,end,flsrt,flend,l,r,spbet,sparn,spevn,str
jsit:nrm,srt,ctr,end,flsrt,flend,sfsrt,sfend,l,r,bsl,str
jssf:aut,nrm,srt,ctr,end,flsrt,flend,sfsrt,sfend,l,r,bsl,str
txal:srt,end,l,r,ctr,js
brst:no,hid,sol,dsh,dot
brstt:no,hid,sol,dsh,dot
brstr:no,hid,sol,dsh,dot
brstb:no,hid,sol,dsh,dot
brstl:no,hid,sol,dsh,dot
brsthz:no,hid,sol,dsh,dot
brstvt:no,hid,sol,dsh,dot
cs:aut,def,no,ptr
d:no,blk,fl,inl,inlblk,inlfl
fldr:rw,cl
flwr:,no,wr
fnst:nrm,itc,obq
fnwt:nrm,bld,ltr,bdr
of:vs,hid,scr,aut
ps:stt,rel,abs,fxd,stk
txdc:no,und,lnthr
txtr:no,cap,upp,low
vtal:bsl,sub,sup,txt,txb,mid,alt,alb
vs:,vs,hid,cps
whsp:nrm,no,pre,preln,prewr,bksp`;

  const word_lookup = word_abr_str.split(/[ \n]+/).reduce((o, cfg) => {
    const [key, value] = cfg.split(":");
    o[key] = value;
    return o;
  }, {});

  function expand_name(abr) {
    let i = 0;
    let prop = '';
    while (i < abr.length) {
      let sym = abr.slice(i, i + 2);
      if (!word_lookup[sym]) sym = abr[i];

      let word = word_lookup[sym];
      if (!word) break;

      if (prop) prop += "-";
      prop += word;
      i += sym.length;
    }
    if (i < abr.length) throw new Error(`Unknown property: ${abr}`);
    return prop;
  }

  function expand_value(abr) {
    let i = 0;
    let val = '';
    while (i < abr.length) {
      let sym = abr.slice(i, i + 3);
      if (!word_lookup[sym]) sym = abr.slice(i, i + 2);
      if (!word_lookup[sym]) sym = abr[i];

      let word = word_lookup[sym];
      if (!word) break;

      if (word == "visibility") word = "visible";

      if (val) val += "-";
      val += word;
      i += sym.length;
    }

    if (i < abr.length) throw new Error(`Unknown value: ${abr}`);
    return val;
  }

  let conv_sheet = '';
  const valid_props_arr = valid_props_str.split(/[\n:]/);
  let statics = {};
  for (let i = 0; i < valid_props_arr.length; i += 2) {
    const name = valid_props_arr[i];
    const values = valid_props_arr[i + 1].split(",");
    if (name.endsWith("hz")) {
      for (let value of values) {
        const short = name.slice(0, -2);
        const rulename = `${name}${value}`;
        const def = `${statics[`${short}l${value}`]} ${statics[`${short}r${value}`]};`;
        statics[rulename] = def;
        conv_sheet += `.${rulename} { ${def} }\n`;
      }
      continue;
    }
    if (name.endsWith("vt")) {
      for (let value of values) {
        const short = name.slice(0, -2);
        const rulename = `${name}${value}`;
        const def = `${statics[`${short}t${value}`]} ${statics[`${short}b${value}`]};`;
        statics[rulename] = def;
        conv_sheet += `.${rulename} { ${def} }\n`;
      }
      continue;
    }
    for (let value of values) {
      const name_ex = expand_name(name);
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
        if (value == "bksp") value_ex += "s";
        if (value_ex == "") value_ex = { "flwr": "wrap", "vs": "visible" }[name];
      }
      const rulename = `${name}${value}`;
      const def = `${name_ex}: ${value_ex};`;
      statics[rulename] = def;
      conv_sheet += `.${rulename} { ${def} }\n`;
    }
  }
  
  const el = document.createElement("style");
  el.textContent = `
  /* reset */
  html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; }
  body { line-height: 1; }
  ol, ul { list-style: none; }
  blockquote, q { quotes: none; }
  blockquote:before, blockquote:after, q:before, q:after { content: ''; content: none; }
  table { border-collapse: collapse; border-spacing: 0; }
  * { border-width: 0px; }
  * { box-sizing: border-box; }
  ${conv_sheet}
  `;
  document.head.appendChild(el);
  const sheet = document.styleSheets[document.styleSheets.length - 1];

  const vars = {
    color: {},
    size: {},
    family: {},
    dim: {},
    space: {},
    pos: {},
    number: {},
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
      c: ["color"],
      bgc: ["background-color"],
      brc: ["border-color"],
      brtc: ["border-top-color"],
      brrc: ["border-right-color"],
      brbc: ["border-bottom-color"],
      brlc: ["border-left-color"],
      brhzc: ["border-left-color", "border-right-color"],
      brvtc: ["border-top-color", "border-bottom-color"],
      tdc: ["text-decoration-color"],
    },
    size: {
      fnsz: ["font-size"],
      lnh: ["line-height"],
    },
    family: {
      fnfm: ["font-family"],
    },
    dim: {
      w: ["width"],
      mnw: ["min-width"],
      mxw: ["max-width"],
      wmn: ["min-width"],
      wmx: ["max-width"],
      h: ["height"],
      mnh: ["min-height"],
      mxh: ["max-height"],
      hmn: ["min-height"],
      hmx: ["max-height"],
      flbs: ["flex-basis"],
    },
    space: {
      brw: ["border-width"],
      brtw: ["border-top-width"],
      brrw: ["border-right-width"],
      brbw: ["border-bottom-width"],
      brlw: ["border-left-width"],
      brhzw: ["border-left-width", "border-right-width"],
      brvtw: ["border-top-width", "border-bottom-width"],
      brrd: ["border-radius"],
      brtlrd: ["border-top-left-radius"],
      brtrrd: ["border-top-right-radius"],
      brbrrd: ["border-bottom-right-radius"],
      brblrd: ["border-bottom-left-radius"],
      brtrd: ["border-top-left-radius", "border-top-right-radius"],
      brrrd: ["border-top-right-radius", "border-bottom-right-radius"],
      brbrd: ["border-bottom-right-radius", "border-bottom-left-radius"],
      brlrd: ["border-bottom-left-radius", "border-top-left-radius"],
      m: ["margin"],
      mt: ["margin-top"],
      mr: ["margin-right"],
      mb: ["margin-bottom"],
      ml: ["margin-left"],
      mhz: ["margin-left", "margin-right"],
      mvt: ["margin-top", "margin-bottom"],
      p: ["padding"],
      pt: ["padding-top"],
      pr: ["padding-right"],
      pb: ["padding-bottom"],
      pl: ["padding-left"],
      phz: ["padding-left", "padding-right"],
      pvt: ["padding-top", "padding-bottom"],
      gp: ["gap"],
      gprw: ["row-gap"],
      gpcl: ["column-gap"],
      rwgp: ["row-gap"],
      clgp: ["column-gap"],
    },
    pos: {
      t: ["top"],
      r: ["right"],
      b: ["bottom"],
      l: ["left"],
    },
    number: {
      flgr: ["flex-grow"],
      flsh: ["flex-shrink"],
      op: ["opacity"],
    }
  };
  const rules = {};
  function addStyles(elements) {
    for (const el of elements) {
      for (const className of el.classList) {
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
      let value = vars[context][varname];
      // if we don't find a matching var, use the varname as the value which allows people to put
      // in values on-the-fly (e.g. w-400px)
      if (!value) value = varname;
      const propsText = (propMap[context][prop] || [])
        .map((propName) => `${propName}:${value};`)
        .join(" ");
        sheet.insertRule(`${selector} { ${propsText} }`, sheet.cssRules.length);
    }
  }
})();
