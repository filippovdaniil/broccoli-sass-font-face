# broccoli-sass-font-face

This is a [broccoli](https://github.com/broccolijs/broccoli) plugin for the easy generation of **@font-face** rules.

## Installation

```bash
npm install --save-dev broccoli-sass-font-face
```

## Usage

Assume that you have several fonts in your project's `webpub/fonts` directory:

```
~/project/$ ls -C webpub/fonts
headers.eot
headers.ttf
headers.woff
headers_bold.eot
headers_bold.ttf
headers_bold.woff
```

Add in your Brocfile.js

```js
var fontFace = require( 'broccoli-sass-font-face' );
// This prefix will be removed from the each font URL:
fontFace.font_root = 'webpub';

var fonts = fontFace( 'webpub/fonts', {
    // Specify location of the file with Sass mixins and variables for our fonts:
    output: 'scss_compiled/_fonts.scss',
});

// ... then pass this tree to the broccoli Sass plugin
```

The output file will contain something like this (you can see this if you export the fonts tree):

```scss
// File created with broccoli-sass-font-face at Mon Dec 22 2014 20:08:01 GMT+0700 (NOVT)


@mixin headers_font{
    @font-face{
        font-family: "ObelixPro Regular";
        src: url('/fonts/headers.eot');
        src: url('/fonts/headers.eot?#iefix') format('embedded-opentype'),
             url('/fonts/headers.ttf') format('truetype'),
             url('/fonts/headers.woff') format('woff');
        font-weight: normal;
        font-style: normal;
    }
}
$headers_font_family: "ObelixPro Regular";

@mixin headers_bold_font{
    @font-face{
        font-family: "ObelixPro Bold";
        src: url('/fonts/headers_bold.eot');
        src: url('/fonts/headers_bold.eot?#iefix') format('embedded-opentype'),
             url('/fonts/headers_bold.ttf') format('truetype'),
             url('/fonts/headers_bold.woff') format('woff');
        font-weight: normal;
        font-style: normal;
    }
}
$headers_bold_font_family: "ObelixPro Bold";
```

Generated mixins and variables can be imported in your Sass file as follows:
```scss
@import "scss_compiled/fonts";

@include headers_font;

h1, h2, h3, h4{
    font-family: $headers_font_family
}
```

If you pass to plugin a broccoli tree as first argument, you must to set a `font_dir` option.
If you want to include automatically all generated mixins, you can set an `include` option to `true`.

## Documentation

### `fontFace( inputTree, options )`

---

`options.output` *{String}*

Location of the output file with Sass mixins and variables.

---

`[options.font_dir]` *{String|null}*

A path to the directory with fonts. Required, when the `inputTree` is a broccoli tree, returned by another plugin.

Default value: `null`

---

`[options.font_root]` *{String|null}*

A prefix which must be cut out from the each font URL

Default value: `null`

---

`[options.include]` *{Boolean}*

If is set to `true`, all generated mixins will be automatically included.

Default value: `false`

## Important notes

* Supported font formats: TTF, WOFF, WOFF2, EOT. SVG fonts [are deprecated](http://caniuse.com/#feat=svg-fonts) and are not supported.
* Plugin takes the value for the `font-family` property only from ttf files for now. If the ttf file is not present for the group of fonts, the value will be a file basename.

## License

This project is distributed under the MIT license.
