# MyPortfolio

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.19.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Share previews and SEO

The portfolio includes a 1200 × 630 share image, Open Graph and large-image card metadata, a profile schema and `robots.txt`. The editable artwork is in `scripts/share-preview.html`; its exported image is `public/share-preview.jpg`.

When the public website address is available, put its full HTTPS URL in `seo.config.json` under `siteUrl`, then run `npm run build`. Alternatively, set `SITE_URL` in the hosting platform's build environment. Production Vercel and Netlify URLs are also detected from their build environment.

The postbuild step writes absolute image URLs, the canonical URL, the profile URL and a sitemap into `dist/my-portfolio/browser`. With no public URL configured, local builds still work and no deployment address is invented. Use `npm run build` on the hosting platform so the postbuild step runs, and publish `dist/my-portfolio/browser`.

Social preview crawlers can read the metadata directly from the HTML without running Angular. A public deployment is required to test real link sharing; a localhost URL cannot be fetched by social platforms. Client-side section URLs should be served through the host's usual SPA fallback.

Run `npm run test:seo` to check deployment metadata generation.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# my-angular-app
