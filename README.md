### Smart Resume Screener — Frontend

A modern React + TypeScript + Vite frontend for screening resumes against job descriptions. Clean UI, fast DX, deploy-ready.

- **Tech stack**: React, TypeScript, Vite, CSS Modules/vanilla CSS
- **Build & deploy**: Vite, Vercel-ready (`vercel.json` included)

### Demo

- **YouTube Walkthrough**: [Smart Resume Screener Demo](https://youtu.be/vD5ypPAksuo)

Source: [`https://youtu.be/vD5ypPAksuo`](https://youtu.be/vD5ypPAksuo)

### Getting Started

1) Install dependencies

```bash
npm install
```

2) Run the dev server

```bash
npm run dev
```

3) Build for production

```bash
npm run build
```

4) Preview the production build

```bash
npm run preview
```

### Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build for production
- `npm run preview`: Preview local production build
- `npm run lint` (if configured): Run ESLint

### Project Structure

```text
frontend/
  ├─ public/
  ├─ src/
  │  ├─ assets/
  │  ├─ components/
  │  │  ├─ admin/
  │  │  │  ├─ ApplicantCard.tsx
  │  │  │  ├─ ApplicantFilter.tsx
  │  │  │  ├─ ApplicantList.tsx
  │  │  │  ├─ JobPanelList.tsx
  │  │  │  ├─ JobStatBar.tsx
  │  │  │  └─ utils.ts
  │  │  ├─ AdminRoute.tsx
  │  │  ├─ AuthContext.tsx
  │  │  ├─ Header.tsx
  │  │  ├─ HeroSection.tsx
  │  │  ├─ JobCard.tsx
  │  │  ├─ JobDetails.tsx
  │  │  ├─ JobList.tsx
  │  │  ├─ Login.tsx
  │  │  ├─ SignUp.tsx
  │  │  └─ types.ts
  │  ├─ pages/
  │  │  └─ AdminDashboard.tsx
  │  ├─ App.css
  │  ├─ App.tsx
  │  ├─ index.css
  │  ├─ main.tsx
  │  └─ admin-dashboard.tsx
  ├─ index.html
  ├─ vite.config.ts
  ├─ tsconfig.json
  ├─ tsconfig.app.json
  ├─ tsconfig.node.json
  └─ vercel.json
```

### Key Features

- **Job Listings & Details**: Browse jobs, view details with `JobList`, `JobCard`, and `JobDetails` components
- **Admin Dashboard**: Manage applicants and job stats via `pages/AdminDashboard.tsx` and `components/admin/*`
- **Auth Guard**: Protect admin routes using `AdminRoute.tsx` and `AuthContext.tsx`
- **Responsive UI**: Styles in `App.css` and `index.css`

### Configuration

- TypeScript settings: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Vite config: `vite.config.ts`
- ESLint: `eslint.config.js`
- Deployment: `vercel.json`

If you use environment variables, create a `.env` (local) and `.env.production` for deployment and reference via `import.meta.env`. Example:

```env
VITE_API_BASE_URL=https://api.example.com
```

Access in code:

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

### Development Notes

- Use TypeScript types from `components/types.ts` to keep props and domain models consistent
- Keep admin utilities in `components/admin/utils.ts`
- Prefer small, focused components and early returns for readability

### Testing (optional)

If you add tests later, consider:
- Unit tests via Vitest
- Component tests via Testing Library

### Deployment

- The project is **ready for Vercel**. After `npm run build`, deploy the `dist/` output or connect the repo and let Vercel auto-build.
- Ensure any required env vars are defined in your Vercel project settings.

### Contributing

1) Fork the repo and create a feature branch
2) Make focused changes with clear commit messages
3) Run `npm run build` locally before opening a PR

### License

This project is licensed under the MIT License—feel free to use, modify, and share.
