# Mintwise

A standalone expense and savings tracker. It runs as a website and can be packaged as an Android app using Capacitor. Your transactions and savings goal are saved only in that browser/app's local storage under a dedicated Mintwise key.

## Run as a website

Open `index.html` in a browser, or run `npm run web:serve` after installing dependencies.

## Make the Android app

1. Run `npm install`.
2. Run `npm run android:add` once, then `npm run android:sync` whenever the web files change.
3. Run `npm run android:open` to open Android Studio and generate a signed APK/AAB.

## Publish with GitHub Pages

Create a new repository only for Mintwise, push this folder's contents to its `main` branch, then in GitHub open **Settings → Pages** and select **GitHub Actions** as the source. The included workflow publishes the website automatically after every push to `main`.
