# Hugo Configuration

Environment-specific Hugo configuration using the config directory pattern.

## Structure

- `_default/` - Base configuration applied to all environments
  - `menus.yaml` - Navigation menu definitions
  - `params.yaml` - Site parameters and feature flags

## Skills

- `/hugo-project-setup` - Configuration patterns
- `/static-first-routing` - API endpoint configuration

## Notes

- Root `hugo.yaml` contains core settings
- Environment overrides go in `config/production/`, `config/staging/`, etc.
- Menu items defined here appear in header/footer partials
