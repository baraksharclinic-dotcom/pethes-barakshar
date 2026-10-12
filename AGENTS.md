<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Academy architecture
- Use a single canonical public origin for emailed auth destinations and a public confirmation page that validates the session before opening student courses, because preview origins and local development addresses are not reliable email destinations.
- Complete explicit confirmation credentials before validating the user; Google uses the owner-configured external Supabase provider and canonical public callback because the hosted broker rejects this project's Google provider. Both methods share existing course-access checks.
- Keep public content in loader-backed catalog queries and protected student/admin operations in authenticated server functions, because preview and published data must obey the same access controls.
- Store administrator privileges only in user_roles and enforce checks in server handlers and RLS, because client UI is not a security boundary.
- Keep a single auth state subscriber in AuthProvider, because duplicate subscribers cause unnecessary invalidation and race conditions.
- Store audio and PDF references as Bunny CDN URLs and deliver media directly from Bunny, because Supabase handles access and progress only, not media delivery.
- Use the shared has_course_access check for temporary student access and paid access in both RLS and server handlers, because course exceptions must not alter payment approval records.
- Persist listening positions separately from lesson completion and save periodically and on pause, because students must resume recordings across devices without marking partially heard lessons complete.

- Store registration details on each enrollment and share a validation schema between form and server, because administrators review a course-specific application rather than mutable profile details.
