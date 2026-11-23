#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Uso: $0 <rama-asignada>"
  echo "Ejemplo: $0 version-1"
  exit 1
fi

TARGET_BRANCH="$1"

# Verifica que estamos dentro de un repositorio Git
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "Error: ejecuta este script dentro del repositorio Git."
  exit 1
}

echo "🔒 Aislando entorno local exclusivamente a la rama: ${TARGET_BRANCH}"

# 1. Restringe el fetch de origin únicamente a la rama asignada
git config remote.origin.fetch "+refs/heads/${TARGET_BRANCH}:refs/remotes/origin/${TARGET_BRANCH}"

# 2. Obtiene únicamente la rama asignada desde origin
git fetch origin "${TARGET_BRANCH}" --prune

# 3. Cambia a la rama asignada (o la crea trackeando origin/TARGET_BRANCH)
if git show-ref --verify --quiet "refs/heads/${TARGET_BRANCH}"; then
  git checkout "${TARGET_BRANCH}"
  git branch --set-upstream-to="origin/${TARGET_BRANCH}" "${TARGET_BRANCH}" >/dev/null 2>&1 || true
else
  git checkout -b "${TARGET_BRANCH}" "origin/${TARGET_BRANCH}"
fi

# 4. Elimina cualquier otra rama local existente
for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  if [[ "${branch}" != "${TARGET_BRANCH}" ]]; then
    git branch -D "${branch}" >/dev/null 2>&1 || true
  fi
done

# 5. Elimina referencias remotas en caché que no correspondan a la rama asignada
for ref in $(git for-each-ref --format='%(refname)' refs/remotes/origin/); do
  if [[ "${ref}" != "refs/remotes/origin/${TARGET_BRANCH}" ]]; then
    git update-ref -d "${ref}" >/dev/null 2>&1 || true
  fi
done

echo "✅ Entorno aislado correctamente."
echo "   Rama activa: $(git branch --show-current)"
echo "   Referencias visibles:"
git branch -a
