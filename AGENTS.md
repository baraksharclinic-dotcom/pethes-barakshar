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
- Keep public content in loader-backed catalog queries and protected student/admin operations in authenticated server functions, because preview and published data must obey the same access controls.
- Store administrator privileges only in user_roles and enforce checks in server handlers and RLS, because client UI is not a security boundary.
- Keep a single auth state subscriber in AuthProvider, because duplicate subscribers cause unnecessary invalidation and race conditions.
- Store notes in a private course-notes bucket by course ID and recordings as Vimeo/Bunny URLs, because students need enrollment-scoped access while providers host media.
