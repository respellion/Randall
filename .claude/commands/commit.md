# Git Commit

Look at all staged changes using `git diff --cached` and create a descriptive git commit message that follows these rules:

- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, refactor, test, chore
- Keep the subject line under 72 characters
- Add a short body if the change is complex and needs explanation
- Be specific about what changed and why

Then run the commit with that message.

## Examples of good commit messages
- `feat(auth): add JWT token refresh endpoint`
- `fix(api): handle null response from payment gateway`
- `refactor(db): extract connection pooling into separate module`
- `docs(readme): add setup instructions for Windows`
```

---

**How to run it**

In Claude Code:
```
/commit
```

Or with a hint:
```
/commit this fixes the login bug we discussed