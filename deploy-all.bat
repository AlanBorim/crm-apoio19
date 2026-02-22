@echo off
echo ==========================================
echo      Deploying FULL SYSTEM to Remote Server
echo ==========================================

REM Configurações
set REMOTE_USER=crmuser
set REMOTE_HOST=69.62.90.56
set BACKEND_REMOTE_DIR=/var/www/html/crm
set FRONTEND_REMOTE_DIR=/var/www/html/crm-frontend

REM Caminhos Locais (Relativos a este script em crm-apoio19)
set BACKEND_LOCAL_DIR=..\crm-apoio19-api
set FRONTEND_LOCAL_DIR=.

echo.
echo [1/6] Deploying BACKEND...
echo ------------------------------------------
echo Preparing remote backend directory...
ssh %REMOTE_USER%@%REMOTE_HOST% "mkdir -p %BACKEND_REMOTE_DIR%"

echo Creating backend archive...
pushd %BACKEND_LOCAL_DIR%
tar --exclude "vendor" --exclude ".git" --exclude ".env" --exclude "tests" --exclude "uploads" --exclude "deploy_backend.tar.gz" -czf deploy_backend.tar.gz *
echo Uploading backend archive...
scp deploy_backend.tar.gz %REMOTE_USER%@%REMOTE_HOST%:%BACKEND_REMOTE_DIR%/
echo Extracting and updating backend...
ssh %REMOTE_USER%@%REMOTE_HOST% "cd %BACKEND_REMOTE_DIR% && tar -xzf deploy_backend.tar.gz && rm deploy_backend.tar.gz && echo 'Running Composer...' && composer install --no-dev --optimize-autoloader"
del deploy_backend.tar.gz
popd

echo.
echo [2/6] Deploying FRONTEND...
echo ------------------------------------------
echo Preparing remote frontend directory...
ssh %REMOTE_USER%@%REMOTE_HOST% "mkdir -p %FRONTEND_REMOTE_DIR%"

echo Creating frontend archive...
pushd %FRONTEND_LOCAL_DIR%
tar --exclude "node_modules" --exclude ".git" --exclude "dist" --exclude "deploy_frontend.tar.gz" -czf deploy_frontend.tar.gz *
echo Uploading frontend archive...
scp deploy_frontend.tar.gz %REMOTE_USER%@%REMOTE_HOST%:%FRONTEND_REMOTE_DIR%/
echo Extracting and building frontend...
ssh %REMOTE_USER%@%REMOTE_HOST% "cd %FRONTEND_REMOTE_DIR% && tar -xzf deploy_frontend.tar.gz && rm deploy_frontend.tar.gz && echo 'Loading NVM and Node Latest...' && export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\" && nvm use 24 && echo 'Installing dependencies...' && npm install && echo 'Building project...' && npm run build && echo 'Linking uploads directory...' && rm -rf dist/uploads && ln -sfn ../public/uploads dist/uploads"
del deploy_frontend.tar.gz
popd

echo.
echo ==========================================
echo      FULL SYSTEM DEPLOYMENT COMPLETED
echo ==========================================
pause
