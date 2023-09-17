FROM ubuntu:22.04

RUN useradd -d /home/xbone -m -s /bin/bash xbone

ENV APP_ROOT /home/xbone/sveltekit-supabase-webmedia

WORKDIR $APP_ROOT

RUN apt update && \
    apt upgrade -y && \
    apt install -y npm \
                   curl && \
    npm install -g n && \
    n lts && \
    apt purge -y npm nodejs
