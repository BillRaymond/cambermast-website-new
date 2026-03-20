Use this prompt to continue brochure PDF debugging in a new chat after rebuilding the Docker image:

```text
We are continuing print-layout debugging for the training brochure PDF pipeline in /workspaces/cambermast-website-new.

Start by checking the cleanliness and standardization of the built output PDFs before making any layout changes. Use the installed `poppler-utils` tools (`pdfinfo`, `pdftoppm`, and `pdftotext`) to inspect the actual generated PDFs, not just the browser preview.

Current context:
- Current local work is in `web/src/routes/(plain)/training/[slug]/print/+page.svelte`
- PDFs are generated locally with `npm --prefix web run generate:training-pdfs:dev`
- In development, `npm --prefix web run dev` also runs a watcher that regenerates brochure PDFs only when brochure-impacting source files change
- The current watcher contract includes:
  - `web/src/routes/(plain)/training/[slug]/print/+page.svelte`
  - `web/src/routes/(plain)/training/[slug]/print/+page.ts`
  - `web/src/lib/data/training/**`
  - `web/src/lib/data/training/brochure.ts`
  - `web/src/lib/data/testimonials.json`
  - `web/src/lib/data/testimonials.ts`
  - `web/src/lib/data/partners.ts`
  - `web/src/routes/about/+page.svelte`
  - brochure-linked `/images/**` assets referenced by training brochure data, testimonials, the print route, and the About page
- The Docker image includes `poppler-utils` for PDF inspection
- The brochure print route has already been simplified substantially for pagination work
- The agenda must start on a new page
- Do not delete or relax any hard page breaks unless I explicitly ask you to

What to do first:
1. Regenerate the PDFs
2. Use `pdfinfo` to confirm page counts
3. Use `pdftoppm` to rasterize the pages and inspect visual cleanliness/standardization across all brochures
4. Use `pdftotext` where useful to confirm page boundaries and text flow
5. Summarize the most obvious formatting or pagination problems in the built PDFs before editing code

Known recent finding:
- `:global(...)` selectors inside the print route’s `<svelte:head><style>` were not being transformed there, so the custom print CSS had been silently inactive; that was corrected

After the PDF audit, continue debugging page breaks and brochure pagination without changing the training data structure unless absolutely necessary.
```
