# The documentation site is static output — 129 pages, no server-side logic — but `ustech.app` is served
# by the shared ALB, which fronts Cloud Run only, and Cloud Run deploys images rather than directories.
# So the site is baked into an nginx image. See the hosting ticket for why this rather than S3+CloudFront:
# the internal-only access this needs is a Cloud Armor NAT allowlist on the ALB backend, which has no
# equivalent on CloudFront, and there is no AWS certificate for *.ustech.app.
#
# Built from a prebuilt `dist/`, not from source: the site needs the library built first
# (`scripts/link-library.js` copies it into `public/`), and CI already does that.
FROM nginx:alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html

# Cloud Run sets PORT; this default only matters when running the image locally.
ENV PORT=8080
EXPOSE 8080
