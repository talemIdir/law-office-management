# Fetch all remote branches

git fetch --all

# Then checkout the branch locally

git checkout BRANCH_NAME

# Go back to main

git checkout main

# Now you can use Option 3 (recommended)

git checkout BRANCH_NAME -- .

# Review and commit

git status
git add .
git commit -m "feat: decompose database file"
git push origin main
