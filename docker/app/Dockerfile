# =============================================================================
# Chulx — PHP 8.3-FPM Application Container
# =============================================================================
ARG PHP_VERSION=8.3
FROM php:${PHP_VERSION}-fpm-alpine

# System dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libpq \
    icu-dev \
    libzip-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    oniguruma-dev \
    linux-headers \
    $PHPIZE_DEPS

# PHP extensions required by Laravel + PostGIS
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        pgsql \
        intl \
        zip \
        gd \
        bcmath \
        pcntl \
        mbstring \
        opcache \
        sockets

# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create app user matching host UID/GID for volume permissions
ARG UID=1000
ARG GID=1000
RUN addgroup -g ${GID} appuser \
    && adduser -u ${UID} -G appuser -s /bin/sh -D appuser

# Working directory
WORKDIR /var/www/html

USER appuser

EXPOSE 9000
CMD ["php-fpm"]
