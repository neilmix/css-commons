# css-commons

A learnable class-based CSS utility framework that is a space-efficient CSS subset consisting of the most common CSS properties and values.

The css-commons library is a highly pragmatic system that provides a powerful shorthand for the most common CSS styling use-cases
in a low-mental-overhead way. It also provides interoperability to allow for solving more uncommon use-cases using
traditional CSS.

This library is a work in progress. Please file issues to give feedback.

Documentation is currently terse and will be expanded with time and experience.

## Features Currently Available

- Learnable abvreviated syntax for refering to properties and values as class names
- Static utility classes for common properties and values
- Support for ad-hoc dynamic property values
- CSS variable-based support for custom taxonomy values that are automatically applied to all corresponding properties
- Psuedo-class support for :hover
- Dynamic application of classes based on the existence of a parent class
- Composition-based custom class aggregations

The above is a mouthful. We'll address each one-by-one below.

## Learnable Abvreviated Syntax

CSS naming conventions are quirky and inconsistent. This is because CSS is built to model the world and all of its languages and visual
design conventions, and the world is quirky and inconsistent.

This leaves library authors in a tricky spot. Do you simplify the quirkiness into a more readable, intuitive, and economical syntax, at the risk
of exposing implementers to the law of leaky abstractions? Or do you accept and double-down on the inherent quirkiness and complexity to avoid
leaky abstraction risk?

The css-commons library opts for learnability over intuitiveness. At first glance, the class syntax may look weird and unfamiliar, but it has
been designed to be learned rapidly. In doing so, css-commons mirrors CSS property names and values directly, but only with the most commonly
used properties and values, thereby lowering mental overhead and bypassing leaky abstractions. While it may take some effort to learn,
the author's belief is that the lowered mental overhead will be easier to maintain over the long term.

The syntax works as follows:

- Every CSS word used by the library is given a 1-3 letter abbreviation. Words in property names are either 1 or 2 letters long, while
most values are 3 letters long.
- For static utility classes, abbreviations for both properties and values are stacked together in all lowercase with no separators.
- For ad-hoc and taxonomy-based values, property names are stacked together as above, followed by a dash, followed by the value.

Here are some quick examples of static utility classes:

| class name | CSS declaration |
| --- | --- |
| `brstrno` | `{ border-style-right: none; }` |
| `brstthid` | `{ border-style-top: hidden; }` |
| `csdef` | `{ cursor: default; }` |
| `ofhid` | `{ overflow: hidden; }` |
| `dblk`  | `{ display: block }` |


Here are some quick examples of ad-hoc properties and values:

| 'brw-2px' | '{ border-width: 2px; }' |
| 'c-red' | '{ color: red; }' |
| 'c-#0000ff' | '{ color: #0000ff; }' |

Taxonomic values will be described below.

See the `docs` directory for full syntax reference.

# Static utility classes for common properties and values.

See above for a description of the syntax, and the `docs` directory for full reference.

# Support for ad-hoc dynamic property values

See above for a description of the syntax, and the `docs` directory for full reference.

# CSS variable-based support for custom taxonomy values that are automatically applied to all corresponding properties

The css-commons library supports taxonomic declaration of values as CSS variables.
First, declare a CSS variable on :root using the format below. (This must be declared
prior to the library executing.)

```css
  :root {
    --<type>-<name>: <value>; 
  }
```

For example:
```css
  :root {
    --color-dark: #111122;
    --dim-wide: 960px;
  }
```

Now you'll automatically be able to use `red` and `wide` on any appropriate corresponding class:

| `brtc-dark` | `{ border-top-color: var(--color-dark); }` |
| `c-dark` | `{ border-top-color: var(--color-dark); }` |
| `w-wide` | `{ width: var(--dim-wide); }` |

The types supported are `color`, `size` (font-size and line-height), `family`, `dim` (i.e. dimension),
`space`, `pos`, `number`, and the a special type of `class` which is described below.

See the `docs` directory for details on which types are applied to which properties.

# Psuedo-class support for :hover

```
  <div class="brw-1px brstsol brc-black hover:brc-red">border becomes red when hovered</div>
```

# Dynamic application of classes based on the existence of a parent class

This feature can be really handy.

```
  <div class="bank-account overdrawn">
    ... other content ...
    BALANCE: <span class="overdrawn:c-red">-$5.12</span>
  </div>
```

This works even when the parent's class is applied dynamically.

- Composition-based custom class aggregations

Use a CSS `class` type variable to aggregate multiple classes together.

```
  :root {
    --class-merry-christmas: c-red brw-3px brc-green brstsol;
  }
```

```
  <div class="merry-christmas">how festive.</div>
```
 

## PossibleFuture Features

Here's a list of what's in-queue for future implementaiton. Please file a ticket to influence this list.

- Expanded pseudo-class support
- Psuedo-class support for arbitrary class names
- Dynamic CSS variable update support
- Class enablement based on child selection
- Better documentation
- More thorough tests
- Automatic color gradation
