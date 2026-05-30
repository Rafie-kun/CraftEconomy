# GitHub Upload Guide for CraftEconomy

This repository is set up as a project archive for the CraftEconomy App Lab app.

## What to keep in the repo

- `app_lab_code.js`
- `README.md`
- `BLUEPRINT.md`
- `GITHUB_UPLOAD_GUIDE.md`

## What not to put in the repo

- your screen recording video
- your name, school ID, or private personal info
- teacher-only submission files
- anything you do not want public

If you want to share only the code and not the AP submission media, keep the video and screenshots outside the repository.

## How to upload this repository

### Option 1: GitHub website

1. Sign in to GitHub.
2. Click the plus icon and choose `New repository`.
3. Name the repo `CraftEconomy` or another project name you like.
4. Choose `Private` if you want it hidden from the public.
5. Do not initialize with a README if you are uploading this folder as-is.
6. Create the repository.
7. On the repository page, click `uploading an existing file` or use drag-and-drop.
8. Upload the files from this folder.
9. Commit the changes.

### Option 2: Git command line

Run these commands inside this folder:

```bash
git add .
git commit -m "Initial CraftEconomy project upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If the remote already exists, skip the `git remote add origin ...` line.

## How to make the repo look professional

- Write a clear README
- Keep file names simple
- Use one main JavaScript file for the App Lab logic
- Add short comments to explain important sections
- Keep the design consistent with the Minecraft theme

## Important honesty note

You should present the project as your own only if you genuinely understand and can explain the code. A stronger approach is to say that you built and customized it with support, then show that you can explain each part.

## If you export from App Lab

If you later export the project from Code.org:

- remember App Lab exports need a local server to run properly
- do not expect App Lab data tables or database APIs to work outside Code Studio

## Recommended next steps

1. Create the GitHub repository.
2. Upload these files.
3. Add a short project description in the repo.
4. Keep your App Lab version as the one you test and submit for class.
