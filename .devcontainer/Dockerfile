FROM mcr.microsoft.com/devcontainers/base:debian

ARG MISE_VERSION=2026.9.9
RUN arch="$(uname -m)" \
    && case "$arch" in x86_64) arch=x64 ;; aarch64) arch=arm64 ;; esac \
    && curl -fsSL "https://github.com/jdx/mise/releases/download/v${MISE_VERSION}/mise-v${MISE_VERSION}-linux-${arch}" -o /usr/local/bin/mise \
    && chmod +x /usr/local/bin/mise
ENV PATH="/home/vscode/.local/share/mise/shims:${PATH}"
