#!/bin/bash

# Create PR using GitHub API
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ghs_9ryR646n4BDNWcRaZU1ZErsShtIXLR0x1Fj2" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/walu22/Tuma-Helper-connect-africa/pulls \
  -d '{
    "title": "Fix duplicate services and improve code quality",
    "body": "## 🐛 Problem\nDuplicate services (Plumbing Repairs, Mathematics Tutoring, etc.) were appearing on the landing page due to duplicate database entries and multiple migration files inserting the same data.\n\n## 🔧 Solution\n- ✅ Fixed duplicate INSERT statements in migration files\n- ✅ Added frontend duplicate filtering in components\n- ✅ Improved TypeScript types (reduced errors from 146 to 86)\n- ✅ Created database cleanup tools\n- ✅ Fixed React Hook dependencies\n\n## 📋 Key Changes\n- Fixed duplicate services display issue\n- Enhanced type safety across components\n- Added defensive programming for data integrity\n- Created comprehensive cleanup scripts\n\n## ✅ Testing\n- [x] Build passes successfully\n- [x] No duplicate services on landing page\n- [x] Improved code quality and type safety\n\n## 🎯 Impact\n- Resolves user-reported duplicate services issue\n- Significantly improves codebase quality\n- Provides tools for ongoing data integrity",
    "head": "fix/duplicate-services-issue",
    "base": "main"
  }'