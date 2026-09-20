# Kestrel Bank (demo)

React + Vite + Tailwind CSS v4 + React Router. Fictional bank, about 100 generated pages.

    npm install
    npm run dev          # http://localhost:5173

## Deploy to Firebase Hosting

    npm install -g firebase-tools
    firebase login
    # put your project id in .firebaserc (or run: firebase use --add)
    npm run deploy

Add or rename pages in `src/data/site.js`. Routes, menus and footer update automatically.
