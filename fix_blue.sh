#!/bin/bash
find src/ -type f -name "*.tsx" -exec sed -i -e 's/focus:ring-blue-500/focus:ring-brand-purple/g' \
-e 's/focus:border-blue-500/focus:border-brand-purple/g' \
-e 's/focus:ring-blue-200/focus:ring-brand-purple\/30/g' \
-e 's/focus:ring-blue-900/focus:ring-brand-purple\/40/g' \
-e 's/border-blue-500/border-brand-purple/g' \
-e 's/border-blue-100/border-brand-purple\/20/g' \
-e 's/border-blue-700/border-brand-purple\/40/g' \
-e 's/peer-focus:ring-blue-300/peer-focus:ring-brand-purple\/30/g' \
-e 's/peer-focus:ring-blue-800/peer-focus:ring-brand-purple\/40/g' \
-e 's/text-blue-100/text-brand-purple-light/g' \
{} +
