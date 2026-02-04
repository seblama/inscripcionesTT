# Deployment to Synology NAS

This guide details how to deploy the `inscripcionesTT` application to your Synology NAS using Docker and configure it with the custom domain `inscripciones-trekking.entrenarbien.synology.me`.

## Prerequisites

1.  **Synology NAS** with "Container Manager" (formerly Docker) installed.
2.  **Git** installed on your NAS (optional, for easier updates) or a way to upload files to the NAS.
3.  **SSH Access** enabled on your NAS (Control Panel > Terminal & SNMP).
4.  **Supabase Credentials**: You need your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Step 1: Prepare Files on NAS

1.  Create a folder on your NAS for the project, e.g., `/volume1/docker/inscripciones-tt`.
2.  Upload the following files to this folder:
    - `Dockerfile`
    - `docker-compose.yml`
    - `nginx.conf`
    - `package.json`
    - `package-lock.json`
    - `src/` folder
    - `public/` folder
    - `index.html`
    - `vite.config.ts`
    - `tsconfig.json` and other config files.
    *Alternatively, clone the repository via SSH:*
    ```bash
    cd /volume1/docker
    git clone https://github.com/seblama/inscripcionesTT.git
    cd inscripcionesTT
    ```

## Step 2: Configure Environment Variables

Create a `.env` file in the project folder with your Supabase credentials. These are needed **during the build process**.

```bash
# .env file content
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 3: Build and Run the Container

Connect to your NAS via SSH:

```bash
ssh your-user@your-nas-ip -p 22
```

Navigate to the folder and run:

```bash
cd /volume1/docker/inscripcionesTT
sudo docker-compose up -d --build
```

This will:
1.  Build the Docker image (this may take a few minutes as it installs dependencies).
2.  Start the container mapped to port **8090**.

Verify it's running by visiting `http://your-nas-ip:8090` in your browser.

## Step 4: Configure Reverse Proxy (Custom Domain)

To make `inscripciones-trekking.entrenarbien.synology.me` point to your app:

1.  Log in to your Synology DSM (Web Interface).
2.  Go to **Control Panel** > **Login Portal** > **Advanced**.
3.  Click **Reverse Proxy**.
4.  Click **Create**.
5.  **General**:
    - **Description**: Inscripciones App
    - **Source**:
        - Protocol: `HTTPS`
        - Hostname: `inscripciones-trekking.entrenarbien.synology.me`
        - Port: `443`
        - Enable HSTS: Checked (Recommended)
    - **Destination**:
        - Protocol: `HTTP`
        - Hostname: `localhost`
        - Port: `8090`
6.  Click **Save**.

## Step 5: SSL Certificate

Ensure your certificate covers this domain.

1.  Go to **Control Panel** > **Security** > **Certificate**.
2.  If you use a Synology DDNS certificate (*.synology.me), it usually covers subdomains or you might need to update it.
3.  Click **Settings** (Configure).
4.  Find your service (`inscripciones-trekking.entrenarbien.synology.me`) in the list.
5.  Select the valid certificate from the dropdown.
6.  Click **OK**.

## Troubleshooting

- **Container won't start**: Check logs with `sudo docker logs inscripciones-tt`.
- **404 on refresh**: Ensure `nginx.conf` is correctly copied and used by the image.
- **Supabase errors**: Verify the `.env` file had the correct credentials *before* building. If you change them, you must rebuild: `sudo docker-compose up -d --build`.
