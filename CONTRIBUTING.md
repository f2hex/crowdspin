## Issues

You're welcome to contribute to open issues with more information or by adding
:+1: on them: it will help the maintainers identify the issues to be 
prioritized.

### Creating a new issue

Youn can create a new issue by mentioning it as a `Bug report`, `Feature request`or just a `General issue`.

If your will refer to a `General issue` please provide relevant details in order to let other people clearly understand the issue.

## Pull Requests

> :information_source: Please ensure that there is a pertinent issue related to
> what you are proposing and also make sure that someone has already reviewed it
> before proceeding

1. [Fork the project](https://help.github.com/articles/creating-a-pull-request-from-a-fork/)

2. Follow our [conventions regarding commits](#commit-messages) for your commit 
   message

3. Open a Pull request against `master`.
   Blank PRs have a template you can follow where you can tick a checklist.
   When each one of the step is done, please insert an `x` in between the `[ ]`
   to mark it as ready.

### Commit messages

The commit message should be simple and self-explanatory.

We follow the [Conventional Commits format](https://www.conventionalcommits.org)
and the general rules of **[great commit messages](https://chris.beams.io/posts/git-commit/)** (read this!)

If a commit fixes an issue, please [reference it](https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords#about-issue-references)
 in the commit body with `Fix: #ISSUENUMBER`.

## Gitflow

This repository adopts a simplified branch management system as follows:

* `main` is stable and gets deployed automatically. Never push directly to it;
* feature or fix branches are derived directly from master.

### Releases

The maintainers try to keep the milestones updated in order to show what will be
fixed soon and, when possible, they also try to set a consistent end date for
such a milestone to be hit.

