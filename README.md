## 🎬 - FilmHaven
A simple, customizable, and lightweight frontend to view and interact with movies & shows.

**Accessible here:**
- <a target="_blank" href="https://fh.snipcola.com">Main</a>
- <a target="_blank" href="https://film-haven.vercel.app">Mirror</a>
- <a target="_blank" href="https://fh.snipcola.com/dist/FilmHaven.html">Portable (right click & save)</a>

## ⌨️ - Shortcuts
- `/` - Focuses on search bar. *Navigates out out of any page or modal open.*
- `[` - Plays previous episode, *if exists*. *Only works on series modal.*
- `]` - Plays next episode, *if exists*. *Only works on series modal.*
- `- or =` - Sets previous provider, *if exists*. *Only works on movie or series modal.*
- `+` - Sets next provider, *if exists*. *Only works on movie or series modal.*
- `r` - Refreshes video. *Only works on movie or series modal.*
- `v` - Focuses on video. *Only works on movie or series modal.*
- `x` - Closes modal. *Only works when modal is open.*

## 💻 - Compilation
1. Ensure you have `node` and `npm` installed.
2. Run `npm install`.
3. Run `npm prod` or `npm dev` depending on what you need.
4. If you have PHP, access the site at `api/index.php`; else, `api/dist/FilmHaven.html`.

## ⚠️ - Disclaimer
All files, such as media, are linked from third-party services, which FilmHaven is not responsible for and has no control over.

FilmHaven uses a custom proxy server in order to check which providers are available, the source code for that is available [here](https://github.com/snipcola/FilmHaven-Proxy).