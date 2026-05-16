# obsidian-website-template

this is a template for generating a static site from [Obsidian](https://obsidian.md) files using [my custom build driver](https://github.com/p0lyw0lf/driver).

## Setup

After cloning this repository, you'll need to check out my [driver](https://github.com/p0lyw0lf/driver)
repository, build it using `cargo build --release` and copy the binary into
this folder with:

```
cp ../driver/target/release/driver .
```

Finally, you'll be able to build the site with

```
./driver run BUILD.js
```

## Template Details

Some notes about the template as it is currently set up:

### General Notes
* Support for Tera templates (jinja-style) is WIP, currently everything is done
  with Javascript string templating instead.
* We do not support wikilinks as all, only standard `[]()` links.
* `![]()` images referring to local images are automatically processed into
  `<picture>` elements containing jxl & webp sources. To modify the image
  processing, see `src/runtime/markdown.js` and `src/runtime/remoteImage.js`.
* See `interface.d.ts` for the operations supported by the driver library.

### `BUILD.js`
* The final output shows up under the `dist` folder.
* Files/folders in `public/` will be copied verbatim to the final output.
* Files under `src/pages/` can have one of two extensions:
 * `.md`: will be rendered with `src/build/md.js`.
 * `.js`: will be run, then the output written to the file stripped of its `.js` suffix.
* The files under `src/pages/` will be routed to pages like so:
  * `src/pages/index.md` -> `dist/index.html`
  * `src/pages/Foo.md` -> `dist/Foo/index.html`
  * `src/pages/Foo/Bar.html.js` -> `dist/Foo/Bar/index.html`
* Files with a filename that looks like `[slug].html.js` are "dynamic routes":
  first they are run get an `Array<{ slug: string }>` listing all the possible
  routes that should be generated, then the same page is run with each value in
  that array to generate what should be written at that slug.

### `src/build/md.js`
* Obsidian pages will use the `src/templates/Page.js` template.
