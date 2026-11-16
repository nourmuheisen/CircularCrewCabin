CirCab read-only publication

Extract the complete ZIP into a directory on any static HTTP(S) host. No database, backend, build or npm installation is required. JavaScript modules and JSON must be served with correct MIME types. Opening index.html using file:// is not supported.

All asset paths are relative, including when hosted under /some/subdirectory/. No rewrite rules are needed: routes use index.html#/cabin/cabin, index.html#/group/<group-id> and index.html#/scmp/<URL-encoded-exact-Component-ID>.

Hosting URL not configured. Set it in Builder before producing permanent QR destinations.
Keep the deployment directory, cabin identifier and source Component IDs stable when replacing a publication. Replace the full package atomically and configure cache revalidation for index.html, JavaScript and data/passport.json. Removed components show unavailable; keep an approved component in the publication to preserve its passport.

Only selected components and their confirmed documents are included. Cabin assessment summaries require all components and explicit approval; partial selections show no cabin assessment scores. Grouping never recalculates scores. Every included file is readable by anyone with host access; role selectors are presentation only. Arrange internal network access with Damen IT if required. External document references remain dependent on their destination.

Before deployment: inspect this package, confirm approval and document permissions, choose the permanent HTTPS directory, configure the Builder base URL, and test cabin/component/group routes on that host. No deployment has been performed.
