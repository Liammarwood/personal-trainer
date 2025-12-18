# Personal Trainer Documentation

This directory contains the user-facing documentation for the Personal Trainer application, hosted on GitHub Pages.

## Documentation Structure

```
docs/
├── index.md              # Homepage with feature overview
├── getting-started.md    # Step-by-step setup guide
├── user-guide.md         # Comprehensive feature documentation
├── features.md           # Detailed feature reference
├── faq.md               # Frequently asked questions
├── troubleshooting.md   # Common issues and solutions
├── _config.yml          # GitHub Pages configuration
├── README.md            # This file
└── TEXT_TO_SPEECH.md    # Developer documentation (not in public docs)
```

## Viewing the Documentation

### Live Site
Once GitHub Pages is enabled, the documentation will be available at:
**https://liammarwood.github.io/personal-trainer/**

### Local Development

To preview the documentation locally:

1. **Install Jekyll** (if not already installed):
   ```bash
   gem install bundler jekyll
   ```

2. **Navigate to docs directory**:
   ```bash
   cd docs
   ```

3. **Create Gemfile**:
   ```ruby
   source 'https://rubygems.org'
   gem 'github-pages', group: :jekyll_plugins
   ```

4. **Install dependencies**:
   ```bash
   bundle install
   ```

5. **Serve locally**:
   ```bash
   bundle exec jekyll serve
   ```

6. **View in browser**:
   Open http://localhost:4000/personal-trainer/

## Enabling GitHub Pages

1. Go to repository settings on GitHub
2. Navigate to **Pages** section (left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
4. Click **Save**
5. Wait a few minutes for deployment
6. Site will be live at the URL shown

## Documentation Guidelines

### Adding New Pages

1. Create new `.md` file in `docs/` directory
2. Add YAML frontmatter:
   ```yaml
   ---
   layout: default
   title: Your Page Title
   nav_order: 7
   ---
   ```
3. Write content in Markdown format
4. Update navigation in `_config.yml` if needed

### Markdown Features

- **Headers**: `#`, `##`, `###`, etc.
- **Links**: `[text](url)`
- **Images**: `![alt](path)`
- **Code blocks**: ` ```language ` ... ` ``` `
- **Lists**: `1.`, `2.`, or `-` for bullets
- **Tables**: Pipe-separated format
- **Emphasis**: `*italic*`, `**bold**`

### Table of Contents

For automatic TOC generation:
```markdown
## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}
```

## Content Sections

### index.md
- Landing page for documentation site
- Feature overview and highlights
- Quick navigation to all sections
- Getting started links

### getting-started.md
- Step-by-step setup tutorial
- First-time user guide
- Basic workflow walkthrough
- 10 key steps from sign-in to completion

### user-guide.md
- Comprehensive feature documentation
- Interface overview
- Input modes (webcam vs. upload)
- Workout plans and tracking
- Settings and customization
- Progress monitoring
- Advanced tips

### features.md
- Detailed feature catalog
- Technical capabilities
- Real-time tracking details
- Audio feedback (TTS)
- Progress analytics
- Form analysis
- Security and privacy features
- Platform compatibility

### faq.md
- Frequently asked questions
- General questions
- Account & sign-in
- Tracking & accuracy
- Technical troubleshooting
- Workout & plan management
- Audio & feedback
- Privacy & security
- Mobile usage
- Support resources

### troubleshooting.md
- Common problems and solutions
- Camera & video issues
- Rep counting problems
- Audio troubleshooting
- Performance optimization
- Sign-in issues
- Display problems
- Mobile-specific issues
- Data & privacy
- How to get more help

## Updating Documentation

### Text Changes
1. Edit the appropriate `.md` file
2. Commit and push to GitHub
3. GitHub Pages will automatically rebuild
4. Changes live in ~1-2 minutes

### Adding Images
1. Create `docs/images/` directory
2. Add image files
3. Reference in Markdown:
   ```markdown
   ![Description](images/filename.png)
   ```

### Navigation Updates
1. Edit `_config.yml`
2. Update `nav_links` section
3. Add/remove/reorder menu items

## Theme Customization

The site uses the **Cayman** theme. To customize:

1. **Colors**: Create `docs/assets/css/style.scss`
2. **Layout**: Create `docs/_layouts/default.html`
3. **Includes**: Create `docs/_includes/` directory
4. Override theme defaults as needed

## SEO Optimization

Configured in `_config.yml`:
- Page titles and descriptions
- Social media cards
- Sitemap generation
- Robots.txt
- Google Analytics (optional)

## Maintenance

### Regular Updates
- [ ] Review and update content quarterly
- [ ] Add new features as released
- [ ] Update screenshots/images
- [ ] Check for broken links
- [ ] Update FAQ with common questions
- [ ] Expand troubleshooting as issues arise

### Monitoring
- Check GitHub Pages build status
- Review analytics (if enabled)
- Monitor user feedback/issues
- Track documentation usage

## Developer Documentation

Technical documentation for developers is kept in:
- `TEXT_TO_SPEECH.md` - TTS feature implementation
- Additional dev docs can be added with `.dev.md` extension
- These are excluded from GitHub Pages (see `_config.yml`)

## Contributing

To contribute to documentation:

1. Fork the repository
2. Create feature branch
3. Make documentation changes
4. Test locally with Jekyll
5. Submit pull request
6. Describe changes in PR description

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)
- [Cayman Theme](https://github.com/pages-themes/cayman)

## Support

For documentation issues or suggestions:
- Open an issue: https://github.com/Liammarwood/personal-trainer/issues
- Tag with `documentation` label
- Provide specific page and section
- Suggest improvements

---

**Last Updated**: December 2024
