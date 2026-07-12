#!/bin/bash
find src/ -type f -name "*.tsx" -exec sed -i -e 's/text-blue-600/text-brand-purple/g' \
-e 's/text-blue-700/text-brand-purple/g' \
-e 's/text-blue-400/text-brand-purple-light/g' \
-e 's/text-blue-500/text-brand-purple-light/g' \
-e 's/bg-blue-50/bg-brand-purple\/10/g' \
-e 's/bg-blue-100/bg-brand-purple\/20/g' \
-e 's/bg-blue-900\/20/bg-brand-purple\/20/g' \
-e 's/bg-blue-900\/30/bg-brand-purple\/30/g' \
-e 's/bg-blue-900\/40/bg-brand-purple\/40/g' \
-e 's/border-blue-200/border-brand-purple\/30/g' \
-e 's/border-blue-800/border-brand-purple\/50/g' \
-e 's/ring-blue-600/ring-brand-purple/g' \
-e 's/bg-blue-600/bg-brand-purple/g' \
-e 's/bg-blue-700/bg-brand-purple-light/g' \
{} +
