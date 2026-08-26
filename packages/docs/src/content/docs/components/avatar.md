---
title: Avatar
category: Media
synonyms:
  - profile picture
  - user image
  - profile photo
  - user icon
use-cases:
  - user profile
  - initials
  - placeholder image
  - gravatar
description: "Avatars represent a person or object with an image, initials, or icon. Use them in lists, comments, and profiles to give users visual context at a glance."
---

```html {.example .anatomy}
<cs-avatar label="User avatar"></cs-avatar>
```

By default, a generic icon will be shown. You can personalize avatars by adding [images](#image), [initials](#initials), and [custom icons](#custom-icon). You should always provide a `label` for assistive devices.

## Examples

### Image

To use an image for the avatar, set the `image` and `label` attributes. This will take priority and be shown over initials and icons.
Avatar images can be lazily loaded by setting the `loading` attribute to `lazy`.

```html {.example}
<cs-avatar
  image="https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  label="Avatar of a gray tabby kitten looking down"
></cs-avatar>
<cs-avatar
  image="https://images.unsplash.com/photo-1591871937573-74dbba515c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  label="Avatar of a white and grey kitten on grey textile"
  loading="lazy"
></cs-avatar>
```

### Initials

When you don't have an image to use, you can set the `initials` attribute to show something more personalized than an icon.

```html {.example}
<cs-avatar initials="WA" label="Avatar with initials: WA"></cs-avatar>
```

### Custom Icon

When no image or initials are set, an icon will be shown. The default avatar shows a generic "user" icon, but you can customize this with the `icon` slot.

```html {.example}
<cs-avatar label="Avatar with an image icon">
  <cs-icon slot="icon" name="image"></cs-icon>
</cs-avatar>

<cs-avatar label="Avatar with an archive icon">
  <cs-icon slot="icon" name="archive"></cs-icon>
</cs-avatar>

<cs-avatar label="Avatar with a briefcase icon">
  <cs-icon slot="icon" name="work"></cs-icon>
</cs-avatar>
```

### Shape

Avatars can be shaped using the `shape` attribute.

```html {.example}
<cs-avatar shape="square" label="Square avatar"></cs-avatar>
<cs-avatar shape="rounded" label="Rounded avatar"></cs-avatar>
<cs-avatar shape="circle" label="Circle avatar"></cs-avatar>
```

### Avatar Groups

You can group avatars with a few lines of CSS.

```html {.example}
<div class="avatar-group">
  <cs-avatar
    image="https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right"
    label="Avatar 1 of 4"
  ></cs-avatar>

  <cs-avatar
    image="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80"
    label="Avatar 2 of 4"
  ></cs-avatar>

  <cs-avatar
    image="https://images.unsplash.com/photo-1456439663599-95b042d50252?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80"
    label="Avatar 3 of 4"
  ></cs-avatar>

  <cs-avatar
    image="https://images.unsplash.com/flagged/photo-1554078875-e37cb8b0e27d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=top&q=80"
    label="Avatar 4 of 4"
  ></cs-avatar>
</div>

<style>
  .avatar-group cs-avatar:not(:first-of-type) {
    margin-left: calc(-1 * var(--cs-space-m));
  }

  .avatar-group cs-avatar {
    border: solid 2px var(--cs-color-surface-default);
  }
</style>
```
