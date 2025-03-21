
(() => {

  const TIERS = 6;
  
  class Theme {
    constructor(name, color, config) {
      this.name = name;
      this.color = color;

      let [h, s, l] = [this.color.h, this.color.s, this.color.l];
      this.parseColor(
        config, "bgc", 
        {h: h, s: Math.min(s/2, 5),  l: 97                              },
        {h: h, s: s/2,               l: l + (100 - l)/1.5               },
        {h: h, s: Math.min(s/2, 5),  l: l / 1.5                         },
        {h: h, s: s/2,               l: 3                               });

      this.parseColor(
        config, "bc",  
        {h: h, s: Math.min(s, 5),    l: l + (100 - l)/1.5               },
        {h: h, s: s,                 l: l                               },
        {h: h, s: Math.min(s, 5),    l: l                               },
        {h: h, s: s,                 l: l / 1.5                         });

      this.parseColor(
        config, "hc",  
        {h: h, s: s/2,               l: l/2                             },
        {h: h, s: s,                 l: l                               },
        {h: h, s: s/2,               l: l + (100 - l) / 2               },
        {h: h, s: s,                 l: l                               });

      this.parseColor(
        config, "tc",  
        {h: h, s: Math.max(s/4, 25), l: l + (100 - l)/2                 },
        {h: h, s: Math.min(s, 5),    l: Math.max(l/1.5, 5)              },
        {h: h, s: Math.max(s/4, 25), l: l + (100 - l)/2                 },
        {h: h, s: Math.min(s, 5),    l: Math.min(l + (100 - l)/1.5, 95) });
  
      this.parseNumber(config, "bw", 1/16, 3/16);
      this.parseNumber(config, "br", 5/16, 20/16);
      this.parseNumber(config, "hs", .75,  3);
      this.parseNumber(config, "ts", .75,  2);
  
      this.parseNumber(config, "p", .5, 3);
      this.parseNumber(config, "m", this.pStart || .5, this.pEnd || 3);
      this.parseNumber(config, "g", this.pStart || .5, this.pEnd || 3); 

      this.parseWeight(config, "hw", Array(TIERS).fill(700));
      this.parseWeight(config, "tw", Array(TIERS).fill(400));
    }

    parseColor(config, name, ls, le, ds, de) {
      this[name] = {
        light: {
          start: cssColorToHSL(config[`${name}-start`]) || ls,
          end:   cssColorToHSL(config[`${name}-end`]) || le,
        },
        dark: {
          start: cssColorToHSL(config[`dark-${name}-start`]) || ds,
          end:   cssColorToHSL(config[`dark-${name}-end`]) || de,
        }
      };
      this[name].light.range = makeColorRange(this[name].light.start, this[name].light.end, TIERS);
      this[name].dark.range = makeColorRange(this[name].dark.start, this[name].dark.end, TIERS);
    }

    parseNumber(config, name, start, end) {
      this[name] = {};
      this[name].start = config[`${name}-start`] || `${start}rem`;
      this[name].end = config[`${name}-end`] || `${end}rem`;
      this[name].range = [];
      const s = `var(--theme-${this.name}-${name}-start)`;
      const e = `var(--theme-${this.name}-${name}-end)`;
      for (let i = 0; i < TIERS; i++) {
        this[name].range.push(`calc(${s} + (${e} - ${s}) * ${i} / (${TIERS}))`);
      }
    }

    parseWeight(config, name, weights) {
      this[name] = {};
      this[name].range = config[name] ? config[name].split(/\s+/) : weights;
      while (this[name].range.length < TIERS) {
        this[name].range.push(this[name].range[this[name].range.length - 1]);
      }
    }
    
    toCSS() {
      const css = [];
      css.push(`:root {`);
      css.push(`  --theme-${this.name}-color: ${cssColor(this.color)};`);

      for (let c of ["bgc", "bc", "hc", "tc"]) {
        css.push(`  --theme-${this.name}-${c}-start: ${cssColor(this[c].light.start)};`);
        css.push(`  --theme-${this.name}-${c}-end: ${cssColor(this[c].light.end)};`);
        css.push(`  --theme-${this.name}-dark-${c}-start: ${cssColor(this[c].dark.start)};`);
        css.push(`  --theme-${this.name}-dark-${c}-end: ${cssColor(this[c].dark.end)};`);
      }

      for (let n of ["bw", "br", "hs", "ts", "p", "m", "g"]) {
        css.push(`  --theme-${this.name}-${n}-start: ${this[n].start};`);
        css.push(`  --theme-${this.name}-${n}-end: ${this[n].end};`);
      }

      for (let w of ["hw", "tw"]) {
        css.push(`  --theme-${this.name}-${w}: ${this[w].range.join(" ")};`);
      }

      for (let c of ["bgc", "bc", "hc", "tc"]) {
        for (let t = 0; t < TIERS; t++) {
          css.push(`  --${this.name}-${c}${t+1}: ${this[c].light.range[t]};`);
        }
        for (let t = 0; t < TIERS; t++) {
          css.push(`  --${this.name}-dark-${c}${t+1}: ${this[c].dark.range[t]};`);
        }
      }

      for (let n of ["bw", "br", "hs", "ts", "p", "m", "g"]) {
        for (let t = 0; t < TIERS; t++) {
          css.push(`  --${this.name}-${n}${t+1}: ${this[n].range[t]};`);
        }
      }

      for (let w of ["hw", "tw"]) {
        for (let t = 0; t < TIERS; t++) {
          css.push(`  --${this.name}-${w}${t+1}: ${this[w].range[t]};`);
        }
      }
      css.push(`}`);

      const makeColors = (index, lightClasses, darkClasses) => {
        const layer = [`@layer layer${index} /* ${this.name} */ {`];
        let pushColors = mode => {
          for (let i = 1; i <= TIERS; i++) {
            for (let prop of ["bgc", "bc", "hc", "tc"]) {
              layer.push(`    --${prop}${i}: var(--${this.name}-${mode}${prop}${i});`)
              layer.push(`    --dark-${prop}${i}: var(--${this.name}-dark-${prop}${i});`)
            }
          }
        }
        let pushProps = mode => {
          for (let i = 1; i <= TIERS; i++) {
            pushColors(mode);
            for (let prop of ["bw", "br", "hs", "ts", "p", "m", "g", "hw", "tw"]) {
              layer.push(`    --${prop}${i}: var(--${this.name}-${prop}${i});`)
            }
          }
        }
        layer.push(`  ${lightClasses} {`);
        pushProps('');
        layer.push(`  }`);
        layer.push(`  ${darkClasses} {`);
        pushColors('dark-');
        layer.push(`  }`);
        layer.push(`}`);
        return layer;
      }

      const layer2 = makeColors(2, `.${this.name} .light, .${this.name}`, `.${this.name} .dark`);
      const layer3 = makeColors(3, `.${this.name}, .${this.name}.light, .${this.name}-light`, `.${this.name}.dark, .${this.name}-dark`);
      const layer4 = makeLayerClasses(this.name + '-');

      return [
        ...css, 
        ...layer2, 
        ...layer3,
        `@layer ${this.name} {`,
        ...layer4, 
        `}`,
      ].join("\n");
    }
  }
  
  const baseCSS = `
    @layer base {
      * { margin: 0; padding: 0; border: 0; font-size: 16px; font: inherit; border-style: solid; border-width: 0;}

      body { line-height: 1; }
      ol, ul { list-style: none; }
      blockquote, q { quotes: none; }
      blockquote:before, blockquote:after, q:before, q:after { content: ''; content: none; }
      table { border-collapse: collapse; border-spacing: 0; }
      * { border-width: 0px; box-sizing: border-box; transition-duration: 0.25s; transition-behavior: allow-discrete;}
      :not(:defined) { display: block; }
      
      .relative { position: relative; }
      .absolute { position: absolute; }
      .grow { flex: 1; }
      .center { display: grid; place-items: center; }
      .top-center { display: grid; place-items: start center; }
      .self-center { place-self: center; }
      .center  { place-items: center; }
      .row0 { display: flex; flex-direction: row; gap: 0; }
      .col0 { display: flex; flex-direction: column; gap: 0; }
      .absent { display: none; opacity: 0; }
      .hidden { visibility: hidden; }
      .block { display: block; }
      .stick { position: sticky; }
      .fixed { position: fixed; }
      .opacity0 { opacity: 0; }
      .opacity1 { opacity: 1; }
      .nowrap { white-space: nowrap; }
      .italic { font-style: italic; }
      
      .cursor-default { cursor: default; }
    }
    `;

  const layer1 = makeLayerClasses('');
  const css = [
    baseCSS, 
    '@layer layer1 {',
    ...layer1,
    '}',
  ];

  const computed = getComputedStyle(document.documentElement);
  const themes = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch (error) {
      // Skip stylesheets we can't access (e.g. cross-origin)
      continue;
    }
    if (!rules) continue;

    // Look for rules on the :root selector
    for (const rule of rules) {
      if (rule.selectorText && rule.selectorText.includes(':root')) {
        const style = rule.style;
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          if (prop.match(/^--theme-([^\-]+)-(.+)/)) {
            const theme = RegExp.$1;
            const varname = RegExp.$2;
            if (!themes[theme]) {
              themes[theme] = {};
            }
            themes[theme][varname] = computed.getPropertyValue(prop).trim();
          }
        }
      }
    }
  }

  setTimeout(() => {
    const computed = getComputedStyle(document.documentElement);
    const themes = {};
    for (const prop of computed) {
      console.log(prop);
      if (prop.match(/^--theme-([^\-]+)-(.+)/)) {
        const theme = RegExp.$1;
        const varname = RegExp.$2;
        if (!themes[theme]) {
          themes[theme] = {};
        }
        themes[theme][varname] = computed.getPropertyValue(prop).trim();
      }
    }
  }, 1000);

  for (const [themeName, config] of Object.entries(themes)) {
    if (!config.color) {
      console.error(`css-commons: Theme ${themeName} does not have a color defined.`);
      continue;
    }

    const color = cssColorToHSL(config.color);
    if (!color) {
      console.error(`css-commons: Theme ${themeName} color is not valid.`);
      continue;
    }

    const theme = new Theme(themeName, color, config);
    
    css.push(theme.toCSS());
  }

  css.push(`@layer overrides {
    .outline0 { outline-width: 0; }
    .br0 { border-radius: 0; }
    .b0 { border-width: 0; }
  `);

  const el = document.createElement("style");
  el.textContent = css.join("\n");
  document.head.appendChild(el);
  
  /* Helper functions */

  function makeLayerClasses(prefix) {
    const layer = [];
    const pushClasses = mode => {
      for (let i = 1; i <= TIERS; i++) {
        const bg = `var(--${prefix}${mode}bgc${i})`;
        const bc = `var(--${prefix}${mode}bc${i})`;
        const hc = `var(--${prefix}${mode}hc${i})`;
        const tc = `var(--${prefix}${mode}tc${i})`;
        const bw = `var(--${prefix}bw${i})`;
        const br = `var(--${prefix}br${i})`;
        const hw = `var(--${prefix}hw${i})`;
        const hs = `var(--${prefix}hs${i})`;
        const tw = `var(--${prefix}tw${i})`;
        const ts = `var(--${prefix}ts${i})`;
        const p = `var(--${prefix}p${i})`;
        const m = `var(--${prefix}m${i})`;
        const g = `var(--${prefix}g${i})`;
    
        let push = (prop, direction, rule) => {
          layer.push(`  .${prefix}${mode}${prop}${i}${direction} { ${rule} }`);
        }
        push('bg',  '',   `background-color: ${bg};`);
        push('bg',  '',   `background-color: ${bg};`);
        push('bgc', '',   `background-color: ${bg};`);
        push('b',   '',   `border-color: ${bc}; border-width: ${bw}; border-radius: ${br};`);
        push('bc',  '',   `border-color: ${bc};`);
        push('bw',  '',   `border-width: ${bw};`);
        push('br',  '',   `border-radius: ${br};`);
        push('b', '-t',   `border-top-color: ${bc}; border-top-width: ${bw}; border-top-left-radius: ${br}; border-top-right-radius: ${br};`);
        push('b', '-r',   `border-right-color: ${bc}; border-right-width: ${bw}; border-top-right-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('b', '-b',   `border-bottom-color: ${bc}; border-bottom-width: ${bw}; border-bottom-left-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('b', '-l',   `border-left-color: ${bc}; border-left-width: ${bw}; border-top-left-radius: ${br}; border-bottom-left-radius: ${br};`);
        push('b', '-vt',  `border-top-color: ${bc}; border-bottom-color: ${bc}; border-top-width: ${bw}; border-bottom-width: ${bw}; border-top-left-radius: ${br}; border-top-right-radius: ${br}; border-bottom-left-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('b', '-hz',  `border-left-color: ${bc}; border-right-color: ${bc}; border-left-width: ${bw}; border-right-width: ${bw}; border-top-left-radius: ${br}; border-top-right-radius: ${br}; border-bottom-left-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('b', '-tl',  `border-top-color: ${bc}; border-left-color: ${bc}; border-top-width: ${bw}; border-left-width: ${bw}; border-top-left-radius: ${br};`);
        push('b', '-tr',  `border-top-color: ${bc}; border-right-color: ${bc}; border-top-width: ${bw}; border-right-width: ${bw}; border-top-right-radius: ${br};`);
        push('b', '-bl',  `border-bottom-color: ${bc}; border-left-color: ${bc}; border-bottom-width: ${bw}; border-left-width: ${bw}; border-bottom-left-radius: ${br};`);
        push('b', '-br',  `border-bottom-color: ${bc}; border-right-color: ${bc}; border-bottom-width: ${bw}; border-right-width: ${bw}; border-bottom-right-radius: ${br};`);
        push('bc', '-t',  `border-top-color: ${bc};`);
        push('bc', '-r',  `border-right-color: ${bc};`);
        push('bc', '-b',  `border-bottom-color: ${bc};`);
        push('bc', '-l',  `border-left-color: ${bc};`);
        push('bc', '-vt', `border-top-color: ${bc}; border-bottom-color: ${bc};`);
        push('bc', '-hz', `border-left-color: ${bc}; border-right-color: ${bc};`);
        push('bc', '-tl', `border-top-color: ${bc}; border-left-color: ${bc};`);
        push('bc', '-tr', `border-top-color: ${bc}; border-right-color: ${bc};`);
        push('bc', '-bl', `border-bottom-color: ${bc}; border-left-color: ${bc};`);
        push('bc', '-br', `border-bottom-color: ${bc}; border-right-color: ${bc};`);
        push('bw', '-t',  `border-top-width: ${bw};`);
        push('bw', '-r',  `border-right-width: ${bw};`);
        push('bw', '-b',  `border-bottom-width: ${bw};`);
        push('bw', '-l',  `border-left-width: ${bw};`);
        push('bw', '-vt', `border-top-width: ${bw}; border-bottom-width: ${bw};`);
        push('bw', '-hz', `border-left-width: ${bw}; border-right-width: ${bw};`);
        push('bw', '-tl', `border-top-width: ${bw}; border-left-width: ${bw};`);
        push('bw', '-tr', `border-top-width: ${bw}; border-right-width: ${bw};`);
        push('bw', '-bl', `border-bottom-width: ${bw}; border-left-width: ${bw};`);
        push('bw', '-br', `border-bottom-width: ${bw}; border-right-width: ${bw};`);
        push('br', '-t',  `border-top-left-radius: ${br}; border-top-right-radius: ${br};`);
        push('br', '-r',  `border-top-right-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('br', '-b',  `border-bottom-left-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('br', '-l',  `border-top-left-radius: ${br}; border-bottom-left-radius: ${br};`);
        push('br', '-vt', `border-top-left-radius: ${br}; border-top-right-radius: ${br}; border-bottom-left-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('br', '-hz', `border-top-left-radius: ${br}; border-top-right-radius: ${br}; border-bottom-left-radius: ${br}; border-bottom-right-radius: ${br};`);
        push('br', '-tl', `border-top-left-radius: ${br};`);
        push('br', '-tr', `border-top-right-radius: ${br};`);
        push('br', '-bl', `border-bottom-left-radius: ${br};`);
        push('br', '-br', `border-bottom-right-radius: ${br};`);
        push('h',  '',    `color: ${hc}; font-weight: ${hw}; font-size: ${hs};`);
        push('hw', '',    `font-weight: ${hw};`);
        push('hs', '',    `font-size: ${hs};`);
        push('hc', '',    `color: ${hc};`);
        push('t',  '',    `color: ${tc}; font-weight: ${tw}; font-size: ${ts};`);
        push('tw', '',    `font-weight: ${tw};`);
        push('ts', '',    `font-size: ${ts};`);
        push('tc', '',    `color: ${tc};`);
        push('p',  '',    `padding: ${p};`);
        push('p',  '-t',  `padding-top: ${p};`);
        push('p',  '-r',  `padding-right: ${p};`);
        push('p',  '-b',  `padding-bottom: ${p};`);
        push('p',  '-l',  `padding-left: ${p};`);
        push('p',  '-vt',  `padding-top: ${p}; padding-bottom: ${p};`);
        push('p',  '-hz',  `padding-left: ${p}; padding-right: ${p};`);
        push('p',  '-tl',  `padding-top: ${p}; padding-left: ${p};`);
        push('p',  '-tr',  `padding-top: ${p}; padding-right: ${p};`);
        push('p',  '-bl',  `padding-bottom: ${p}; padding-left: ${p};`);
        push('p',  '-br',  `padding-bottom: ${p}; padding-right: ${p};`);
        push('m',  '',    `margin: ${m};`);
        push('m',  '-t',  `margin-top: ${m};`);
        push('m',  '-r',  `margin-right: ${m};`);
        push('m',  '-b',  `margin-bottom: ${m};`);
        push('m',  '-l',  `margin-left: ${m};`);
        push('m',  '-vt',  `margin-top: ${m}; margin-bottom: ${m};`);
        push('m',  '-hz',  `margin-left: ${m}; margin-right: ${m};`);
        push('m',  '-tl',  `margin-top: ${m}; margin-left: ${m};`);
        push('m',  '-tr',  `margin-top: ${m}; margin-right: ${m};`);
        push('m',  '-bl',  `margin-bottom: ${m}; margin-left: ${m};`);
        push('m',  '-br',  `margin-bottom: ${m}; margin-right: ${m};`);
        push('g',  '',    `gap: ${g};`);
        push('row', '',   `display: flex; flex-direction: row; gap: ${g};`);
        push('col', '',   `display: flex; flex-direction: column; gap: ${g};`);
        push('outline', '', `outline-color: ${bc}; outline-width: ${bw}; outline-offset: 0px; outline-style: solid;`);
      }
    }
    pushClasses('');
    pushClasses('dark-');
    return layer;
  }

  function cssColorToHSL(color) {
    if (!color) return null;

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
        return null;
    }
  }

  function cssColor(h, s, l) {
    if (typeof h === "object") {
        [h, s, l] = [h.h, h.s, h.l];
    } 
    return `hsl(${h}, ${s}%, ${l}%)`;
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
        range.push(cssColor(hRange[i], sRange[i], lRange[i]));
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
