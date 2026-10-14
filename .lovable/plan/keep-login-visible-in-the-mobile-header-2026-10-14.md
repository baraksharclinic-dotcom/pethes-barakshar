# Keep "Login" visible in the mobile header

## What changes

Right now, on a phone the header shows only the logo, the language toggle and the three-line menu button. The "Student Login" button is hidden on small screens, so visitors must open the menu to sign in.

After this change, a compact **Login** button sits in the top bar at all times on phones — one tap, no menu. Once a student is signed in, that same spot shows **Dashboard** instead, so returning students reach their courses directly.

```text
Phone, signed out          Phone, signed in
+-------------------------+  +-------------------------+
| (leaf) Pethe's Barakshar|  | (leaf) Pethe's Barakshar|
|                         |  |                         |
|     [मरा] [Login] [ = ] |  |     [मरा] [Dashbd] [ = ]|
+-------------------------+  +-------------------------+
```

Nothing else moves: all page links (Courses, Calendar, Knowledge Base, Blog, FAQs, Announcements, Contact) and Admin / Sign out stay inside the menu exactly as they are today.

## How the space is made

A phone screen is tight — the logo, language toggle and menu already leave about 18 px of free room, while a Login button needs roughly 60 px. To fit it comfortably we slim the phone header slightly:

- The "Bio-Chemic Academy" sub-line under the brand name is hidden on phones only (it stays on tablet and desktop), and the brand name shrinks one size.
- The language toggle shows a short label on phones (`मरा` / `EN`) instead of the full `मराठी` / `English`, and keeps its current behaviour — tapping still switches language and remembers the choice.
- Page side margins tighten a little on phones.
- Both mobile buttons get a slightly taller tap area so they are easy to hit with a thumb.

All of this is phone-only styling; tablet and desktop headers are untouched.

## Technical details

**`src/components/site/SiteHeader.tsx`**
- Signed-out button: drop the `hidden sm:inline-flex` gate so the `/auth` link renders at every width; on phones it uses the short label, on `sm+` the existing "Student Login" label.
- Signed-in: the compact Dashboard link (currently inside the `hidden sm:flex` group) renders at all widths; Admin and Sign out remain in the desktop group and the sheet menu.
- Mobile-only slimming: `size-9` logo badge and `text-base` brand text below `sm`; the `Bio-Chemic Academy` tagline gets `hidden sm:block`; container padding tightens below `sm`.
- Language toggle: keep `aria-label="Switch language"`, label becomes `मरा` / `EN` below `sm`.
- Sheet menu contents unchanged (still lists every page plus Dashboard / Admin / Sign out / Login).

**`src/lib/i18n.tsx`**
- Add two short dictionary keys used by the phone header: `loginShort` (`Login` / `लॉगिन`) and `dashboardShort` (`Dashboard` / `डॅशबोर्ड`), matching the spellings already in the dictionary.

**Verification**
- Playwright at 393x852, 360x740 and 320x568: assert the Login link is present and visible in the header, no horizontal page overflow (`scrollWidth <= innerWidth`), and that tapping it lands on `/auth`.
- Signed-in check with a minted session: the Dashboard button is visible in the phone header and opens `/dashboard`.
- Desktop (1280px) screenshot to confirm the full navigation, language label and signed-in group are unchanged.
- Confirm the build log is clean.
