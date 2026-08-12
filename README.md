# PersonalPortfolio

Static 3D portfolio for Vercel Hobby. No build step, no serverless functions, no paid APIs.

## Deploy (Vercel Hobby)

1. Push this repo to GitHub (`pk9810/PersonalPortfolio`).
2. In Vercel: **Add New → Project** → import the repo.
3. Leave settings as:
   - Framework Preset: **Other**
   - Build Command: *(empty)*
   - Output Directory: `.`
   - Install Command: *(empty)*
4. Deploy. Root `index.html` is the site.

`vercel.json` already pins those settings so Hobby does not try to run npm or a framework build.

## Local preview

```bash
python3 -m http.server
```


Open http://localhost:8000
