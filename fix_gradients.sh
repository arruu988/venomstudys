#!/bin/bash
find src/ -type f -name "*.tsx" -exec sed -i -e 's/text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-purple-light/text-gradient-brand/g' \
-e 's/bg-gradient-to-r from-brand-purple to-brand-purple-light/bg-gradient-brand/g' {} +
