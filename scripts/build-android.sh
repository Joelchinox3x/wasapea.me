#!/usr/bin/env bash
set -Eeuo pipefail

# Adaptador generado por Ops Control. Puede versionarse y personalizarse para este proyecto.
# Para habilitar Release permanente, configura la firma desde Ops Control antes de compilar.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${1:-debug}"
NETWORK="${2:-lan}"

fail() { echo "[OPS] $*" >&2; exit 1; }
: "${OPS_ARTIFACT_PATH:?Ops Control no proporcionó OPS_ARTIFACT_PATH}"
: "${ANDROID_HOME:?Ops Control no proporcionó ANDROID_HOME}"
: "${JAVA_HOME:?Ops Control no proporcionó JAVA_HOME}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export CI=1 EXPO_NO_TELEMETRY=1
export CMAKE_BUILD_PARALLEL_LEVEL="${CMAKE_BUILD_PARALLEL_LEVEL:-2}"
cd "$ROOT_DIR"
echo "[OPS] Perfil: $PROFILE · Red: $NETWORK"

EXPO_CLI="$ROOT_DIR/node_modules/.bin/expo"
[[ -x "$EXPO_CLI" ]] || fail "Faltan dependencias. Ejecuta npm install antes de compilar."
if [[ "$PROFILE" == "debug" ]]; then
  [[ -f "$ROOT_DIR/node_modules/expo-dev-client/package.json" ]] || fail "El APK development requiere expo-dev-client. Ejecuta: npx expo install expo-dev-client"
  if [[ -n "${OPS_METRO_HOST:-}" && -n "${OPS_METRO_PORT:-}" ]]; then
    export OPS_EXPO_DEV_CLIENT_URL="http://${OPS_METRO_HOST}:${OPS_METRO_PORT}"
    echo "[OPS] Dev Client conectado por defecto a: $OPS_EXPO_DEV_CLIENT_URL"
  else
    echo "[OPS] Dev Client abrirá el launcher porque no se proporcionó una dirección Metro"
  fi
fi
echo "[OPS] Sincronizando nombre, icono, splash y configuración Android con Expo Prebuild"
"$EXPO_CLI" prebuild --platform android --no-install
chmod +x "$ROOT_DIR/android/gradlew"

if [[ "$PROFILE" != "debug" ]]; then
  : "${OPS_ANDROID_KEYSTORE:?Falta configurar la firma Release en Ops Control}"
  : "${OPS_ANDROID_KEY_ALIAS:?Falta el alias de firma Release}"
  : "${OPS_ANDROID_STORE_PASSWORD:?Falta la contraseña del keystore}"
  : "${OPS_ANDROID_KEY_PASSWORD:?Falta la contraseña de la llave}"
  SIGNING_GRADLE="$ROOT_DIR/scripts/ops-release-signing.gradle"
  APP_GRADLE="$ROOT_DIR/android/app/build.gradle"
  [[ -f "$SIGNING_GRADLE" ]] || fail "Falta scripts/ops-release-signing.gradle"
  [[ -f "$APP_GRADLE" ]] || fail "No se encontró android/app/build.gradle"
  if ! grep -Fq "ops-release-signing.gradle" "$APP_GRADLE"; then
    printf '\n%s\n' 'apply from: new File(rootDir, "../scripts/ops-release-signing.gradle")' >> "$APP_GRADLE"
  fi
fi

case "$PROFILE" in
  debug)
    GRADLE_TASK=assembleDebug
    GENERATED_ARTIFACT="$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
    ;;
  preview)
    GRADLE_TASK=assembleRelease
    GENERATED_ARTIFACT="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
    ;;
  production)
    GRADLE_TASK=bundleRelease
    GENERATED_ARTIFACT="$ROOT_DIR/android/app/build/outputs/bundle/release/app-release.aab"
    ;;
  *) fail "Perfil desconocido: $PROFILE" ;;
esac

echo "[OPS] Ejecutando Gradle: $GRADLE_TASK"
GRADLE_ARGS=("--max-workers=2")
if [[ -n "${OPS_ANDROID_ARCHITECTURES:-}" ]]; then
  GRADLE_ARGS+=("-PreactNativeArchitectures=$OPS_ANDROID_ARCHITECTURES")
  echo "[OPS] Arquitecturas Android: $OPS_ANDROID_ARCHITECTURES"
fi

run_gradle() {
  local log_file status
  log_file="$(mktemp)"
  set +e
  (cd "$ROOT_DIR/android" && ./gradlew --no-daemon "${GRADLE_ARGS[@]}" "$GRADLE_TASK") 2>&1 | tee "$log_file"
  status=${PIPESTATUS[0]}
  set -e
  if [[ $status -ne 0 ]] && grep -Fq "manifest 'build.ninja' still dirty after 100 tries" "$log_file"; then
    local cache_dir
    cache_dir="$(grep -oE "$ROOT_DIR/node_modules/[^[:space:]]+/android/\.cxx/[^[:space:]]+" "$log_file" | tail -n 1 || true)"
    if [[ -n "$cache_dir" && "$cache_dir" == "$ROOT_DIR"/node_modules/*/android/.cxx/* ]]; then
      echo "[OPS] CMake dejó una caché inconsistente; se regenerará únicamente: $cache_dir"
      rm -rf -- "$cache_dir"
      set +e
      (cd "$ROOT_DIR/android" && ./gradlew --no-daemon "${GRADLE_ARGS[@]}" "$GRADLE_TASK")
      status=$?
      set -e
    fi
  fi
  rm -f -- "$log_file"
  return "$status"
}

run_gradle
[[ -f "$GENERATED_ARTIFACT" ]] || fail "Gradle terminó sin crear $GENERATED_ARTIFACT"
mkdir -p "$(dirname "$OPS_ARTIFACT_PATH")"
install -m 0600 "$GENERATED_ARTIFACT" "$OPS_ARTIFACT_PATH"
echo "[OPS] Artefacto: $OPS_ARTIFACT_PATH"
