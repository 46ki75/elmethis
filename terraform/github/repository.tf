resource "github_repository" "elmethis" {
  name         = "elmethis"
  description  = "A Vue component library for personal use."
  homepage_url = "https://46ki75.github.io/elmethis/"

  has_downloads        = false
  has_projects         = false
  has_wiki             = false
  has_issues           = true
  vulnerability_alerts = true

  pages {
    build_type = "workflow"

    source {
      branch = "main"
      path   = "/"
    }
  }
}
