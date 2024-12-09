
const css = require('../fast-utility-css.js');
const fs = require('fs');

let words = {};
for (let key in css.wordMap) {
    const word = css.wordMap[key];
    const matching_static_keys = Object.keys(css.staticMap).filter(k => css.staticMap[k].match(new RegExp(`\\b${word}\\b`)));
    const matching_static_configs = matching_static_keys.map(k => ({ cls: k, def: css.staticMap[k] }));
    const matching_dynamic_keys = Object.keys(css.dynPropAbbrMap).filter(k => css.dynPropAbbrMap[k].props.filter(v => v.match(new RegExp(`\\b${word}\\b`))).length > 0);
    const matching_dynamic_configs = matching_dynamic_keys.map(k => ({ cls: k, ...css.dynPropAbbrMap[k] }));
    words[word] = { abbr: key, statics: matching_static_configs, dynamics: matching_dynamic_configs };
}

const template = compile_template(`
<html>
<head>
<style>
html body { font-family: helvetica, sans-serif; }
html table { border-collapse: collapse; }
html td  { border: 1px solid #000; padding: 5px; vertical-align: top; }
html th  { font-weight: bold; padding: 5px; }

:root {
    --class-heading: fnsz-1.2rem fnwtbld mhz-10px mvt-20px p-5 bgc-#666 c-#fff txalctr;
    --class-item: p-5 hover:bgc-#666 hover:c-#fff csdef;
}
</style>
<script defer src="../fast-utility-css.js"></script>
</head>
<body>

<div class="heading">Static Classes</div>
<div class="dfl flwr">
$$ for (let cls of [...css.staticClassSet.values()].sort()) {
    <span class="item w-6rem" title="{{ css.staticMap[cls] }}">{{ cls }}</span>
$$ }
</div>

<div class="heading">Dynamic Classes</div>
<div class="dfl flwr">
$$ for (let cls of [...css.dynClassSet.values()].sort()) {
    <span class="item w-8rem" title="{{ css.dynPropAbbrMap[cls].props.map(p => p + ': ' + css.dynPropAbbrMap[cls].type + "; ").join('\\n') }}">
        {{ cls }}-<span class="fnstitc c-#ccc">{{ css.dynPropAbbrMap[cls].type }}</span>
    </span>
$$ }
</div>

<div class="heading">Available Static Properties</div>
<div class="dfl flwr">
$$ for (let prop of [...css.staticPropSet.values()].sort()) {
    <span class="item w-10rem" title="{{ Object.entries(css.staticMap).filter(k => k[1].includes(prop)).map(e => e[0] + " &rarr; " + e[1]).join("\\n") }}">{{ prop }}</span>
$$ }
</div>

<div class="heading">Available Dynamic Properties</div>
<div class="dfl flwr">
$$ for (let cls of [...css.dynPropSet.values()].sort()) {
    <span class="item w-15rem" title="{{ Object.values(css.dynPropAbbrMap).filter(p => p.props.includes(cls)).map(p => p.abbr + ' &rarr; ' + p.props.join(", ")).join("\\n") }}">{{ cls }}</span>
$$ }
</div>

<div class="heading">Word List</div>
<div class="dfl flwr">
$$ for (let word of Object.values(css.wordMap).sort()) {
    <span class="item w-6rem" title="{{ Object.entries(css.wordMap).find(e => e[1] == word)[0] }}">{{word}}</span>
$$ }
</div>

<div class="heading">Word Abbreviations</div>
<div class="dfl flwr">
$$ for (let abbr of Object.values(words).map(w => w.abbr).sort()) {
    <span class="item w-3rem" title="{{ css.wordMap[abbr] }}">{{ abbr }}</span>
$$ }
</div>

</body>
</html>
`);
console.log(template);
const html = eval(template);

fs.writeFileSync('docs/index.html', html);

function compile_template(txt) {
    const lines = txt.split('\n'), body = ['let out = "";'];
    for (let line of lines) {
        if (line.startsWith('$$')) {
            body.push(`      ${line.slice(2)}`);
        } else {
            line = line
                .replace(/`/g, '\\`')
                .replace(/{{-(.*?)}}/g, '` + ($1) + `')
                .replace(/{{(.*?)}}/g, '` + html_escape($1) + `');
            body.push('out += `' + line + '`;');
        }
    }
    return `${body.join('\n')}\nout;`;
}
function html_escape(s) { 
    return (s||'').replace(/[<>"']/g, v => ({'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[v]));
};
