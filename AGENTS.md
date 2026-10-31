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

- Keep guest demo state separate from verified Cloud account state; private health records must never be persisted in guest browser storage.
- Use the generated browser Cloud client with owner-scoped RLS for health CRUD; retain public routes for the signed-out demo experience.
- Map the frontend health types to Cloud rows in the shared data adapter so existing scoring contracts remain stable.
- Apply schema with migration tooling and seed the fictional doctor directory separately because the migration tool accepts schema changes only.
- Serve the app from the origin root so Cloud preview scripts, styles, and navigation use the correct paths.
