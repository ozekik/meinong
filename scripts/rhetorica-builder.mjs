import { reporter } from "vfile-reporter";
import * as vfile from "to-vfile";
import { toVFile } from "to-vfile";

import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remark2rehype from "remark-rehype";
import remarkGfm from "remark-gfm";

import doc from "rehype-document";
import format from "rehype-format";
import html from "rehype-stringify";
import slug from "rehype-slug";
import wrap from "rehype-wrap";

import rhetoricaSidenotes from "@rhetorica-css/rehype-sidenotes";

function build(srcFile, dstFile, { matter }) {
  let processor = remark()
    .data("settings", { footnotes: matter.footnotes === false ? false : true })
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkGfm)
    .use(remark2rehype, {
      handlers: {
        footnoteReference: rhetoricaSidenotes,
      },
    })
    .use(slug)
    .use(doc, {
      js: matter.js,
      css: matter.css,
      style: matter.style,
      title: matter.title,
      language: matter.language,
    });
  if (matter.wrapper) {
    processor = processor.use(wrap, { wrapper: matter.wrapper });
  }
  processor
    .use(format)
    .use(html)
    .process(srcFile, (error, file) => {
      console.error(reporter(file));
      if (file) {
        dstFile.value = file.value;
        vfile.writeSync(dstFile);
      }
    });
}

export default build;
