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
* We do not support wikilinks as all, only standard `[]()` links.
* `![]()` images referring to local images are automatically processed into
  `<picture>` elements containing jxl & webp sources. To modify the image
  processing, see `src/runtime/markdown.js`, `src/runtime/image.js`, and
  `src/components/Image.js`.
* See `interface.d.ts` for the operations supported by the driver library.
* TODO: need to document the tera filters

### `BUILD.js`
* The final output shows up under the `dist` folder.
* Files/folders in `public/` will be copied verbatim to the final output.
* Files under `src/pages/` will be built if they have one of the following extensions:
 * `.md`
 * `.js`
 * `.tera`
* `.md` files always become HTML ones, while `.js` and `.tera` ones would need
  to have an `.html.js` or `.html.tera` extension for that.
* Files under `src/pages/` will NOT be built if their filename or directory
name starts with an underscore.
* The files under `src/pages/` will be routed to pages like so:
  * `src/pages/index.md` -> `dist/index.html`
  * `src/pages/Foo.md` -> `dist/Foo/index.html`
  * `src/pages/Foo/Bar.html.js` -> `dist/Foo/Bar/index.html`
* `.md` files MUST specify a template in their frontmatter. This is a path
  resolved relative to `src/templates/`. This can be a `.tera` or `.js` template.
* The following properties are provided for a markdown template:
  * `inputPath`: The path of the file being transformed
  * `outputPath`: The path the transformed file will be written to (minus the
  `dist/` prefix)
  * `frontmatter`: An map containing all keys specified in the frontmatter.
  * `beforeFold`: A StoreObject representing all raw markdown content before a
    `===` linebreak.
  * `body`: A Store Object representing all raw markdown content, both before
    and after the `===` linebreak.
* In addition to the above properties, `index.md` also receive a `children`
  property containing an array of all pages in its directory. This includes
  subdirectories than themselves have `index.md` files.

### Tera

See [Tera Documentation](https://keats.github.io/tera/docs/) for usage docs.

However, you MUST NOT use the `include`, `import`, or `extends` functionality.
Instead, you can use the following functions:
* `read(file)`: when `file` is relative to the project (that is, the value should include `src/pages/`), returns a StoreObject representing the contents of that file.
* `list(dir)`: when `dir` is relative to the project, returns an array of strings
  representing all the files in that directory
* `file_type(entry)`: when `entry` is a path relative to the project, return
"file" if it's a file, "dir" if it's a dir, and "symlink" if it's a symlink.
* `run_task(file)`: runs the javascript `file` relative to the project. If a
  single other argument `arg` if passed, treats that as the file's sole `ARG`.
  Otherwise, treats `ARG` as a collection of all arguments except `file`.
  Returns whatever the javascript file's default export is.
* `run_template(template)`: runs the tera template `template` relative to the
  project. Other arguments will be passed into that template's context. Returns
  a StoreObject.

And use the following filters to manipulate StoreObjects:
* `unstore`: converts a StoreObject into a string that can be displayed.
* `store`: converts a string into a StoreObject that can be passed to tasks
expecting it.

### Common Patterns

From Tera templates, a common thing to do is render markdown. This can be
achieved with

```tera
{{ run_task(file="src/runtime/markdown.js", arg=body) | unstore }}
```

If you have a common set of things you want to put in your `<head>`, one way to
do that would be:

```tera
<!doctype html>
<html>
  <head>
    {{ read(file="src/fragments/head.html") | unstore }}
  </head>
  <body>
    ...
  </body>
</html>
```
