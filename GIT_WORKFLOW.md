# Git Workflow Standard

This project follows a professional **Feature Branch Workflow** (subset of Git Flow) to ensure code stability and trackability.

## 1. Branch Structure
- **`main`**: The "single source of truth." All code here is tested and ready for production. 
- **`develop`**: The integration branch. All feature branches merge here first.
- **`feature/name`**: Branches created for specific tasks (e.g., `feature/auth-context`).

## 2. Standard Development Cycle
1. **Pull Latest Changes**: 
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit often** using descriptive messages:
   ```bash
   git add .
   git commit -m "feat: implement cart context for state management"
   ```
4. **Push & PR**:
   ```bash
   git push origin feature/your-feature-name
   ```
   *Then create a Pull Request to merge into `develop`.*

## 3. Commit Message Convention
We follow conventional commits to keep history clean:
- `feat:` A new feature.
- `fix:` A bug fix.
- `refactor:` Code change that neither fixes a bug nor adds a feature.
- `style:` Changes that do not affect the meaning of the code (formatting).
- `docs:` Documentation updates.

## 4. Maintenance
- **Rebase over Merge**: When updating your branch with changes from `develop`, use `git rebase develop` to keep a linear history.
- **Squash on Merge**: Combine multiple small commits into one clean functional commit when merging to `develop`.
