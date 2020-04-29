### Create directory for the application

If you are interested in running this application as a service on a Linux server here is a basic guide as to how to do that.

If this is a new installation create a directory to place the application files.

`mkdir /opt/bgpalerter`

This is the directory where the binary and yaml config files will be stored.  The application will also create `logs` and `src` subdirectories here if needed.

### Create systemd service file
Next you need to create the systemd service file.

`vi /etc/systemd/system/bgpalerter.service`

The contents of this file should be as follows:

`[Unit]
Description=BGPAlerter
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/bgpalerter
ExecStart=/opt/bgpalerter/bgpalerter-linux-x64

[Install]
WantedBy=multi-user.target`

### Reload systemd

`systemctl daemon-reload`

### Enable and start the service
`systemctl enable bgpalerter`
`systemctl start bgpalerter`
